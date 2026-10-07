import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Inject, UnauthorizedException } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

import type { Database } from '../db';
import { authenticateAccessToken } from '../auth/authenticate-access-token';
import type { JwtPayload } from '@food-delivery/types';
import { driverProfiles, orders, restaurants } from '../db/schema';
import { eq } from 'drizzle-orm';

interface AuthenticatedSocket extends Socket {
  user: JwtPayload;
}

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/orders',
})
export class OrdersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwtService: JwtService,
    @Inject('DB') private readonly db: Database,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = this.getBearerToken(client);

      const user = await authenticateAccessToken(
        token,
        this.jwtService,
        this.db,
      );

      client.user = user;

      console.log(`Authenticated socket connected: ${client.id} (${user.sub})`);
    } catch (error) {
      console.log(`Socket authentication failed: ${client.id}`);

      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket, reason?: string) {
    console.log(
      `Client disconnected: ${client.id}${reason ? ` (${reason})` : ''}`,
    );
  }

  private getBearerToken(client: Socket): string {
    const authorization = client.handshake.headers.authorization;

    const [scheme, token, extra] = authorization?.split(' ') ?? [];

    if (scheme !== 'Bearer' || !token || extra) {
      throw new UnauthorizedException('Authentication required');
    }

    return token;
  }

  @SubscribeMessage('join:order')
  async handleJoinOrder(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() orderId: string,
  ) {
    const allowed = await this.canJoinOrder(client.user.sub, orderId);

    if (!allowed) {
      throw new WsException('You are not authorized to access this order');
    }

    await client.join(`order:${orderId}`);

    console.log(`Client ${client.id} joined order:${orderId}`);
  }

  @SubscribeMessage('join:restaurant')
  async handleJoinRestaurant(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() restaurantId: string,
  ) {
    const allowed = await this.canJoinRestaurant(client.user.sub, restaurantId);

    if (!allowed) {
      throw new WsException('You are not authorized to access this restaurant');
    }

    await client.join(`restaurant:${restaurantId}`);

    console.log(`Client ${client.id} joined restaurant:${restaurantId}`);
  }

  @SubscribeMessage('join:driver')
  handleJoinDriver(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() driverUserId: string,
  ) {
    if (client.user.sub !== driverUserId) {
      throw new WsException(
        'You are not authorized to access this driver channel',
      );
    }

    client.join(`driver:${driverUserId}`);

    console.log(`Client ${client.id} joined driver:${driverUserId}`);
  }
  emitDriverAssigned(driverId: string, order: Record<string, unknown>) {
    this.server.to(`driver:${driverId}`).emit('driver:assigned', order);
  }

  emitOrderUpdate(order: {
    id: string;
    restaurantId: string;
    status: string;
    [key: string]: unknown;
  }) {
    // -> Customer watching this order
    this.server.to(`order:${order.id}`).emit('order:updated', order);

    // -> Owner dashboard for this restaurant
    this.server
      .to(`restaurant:${order.restaurantId}`)
      .emit('order:updated', order);
  }

  private async canJoinOrder(
    userId: string,
    orderId: string,
  ): Promise<boolean> {
    const [order] = await this.db
      .select({
        customerId: orders.customerId,
        restaurantOwnerId: restaurants.ownerId,
        driverUserId: driverProfiles.userId,
      })
      .from(orders)
      .innerJoin(restaurants, eq(restaurants.id, orders.restaurantId))
      .leftJoin(driverProfiles, eq(driverProfiles.id, orders.driverId))
      .where(eq(orders.id, orderId));

    if (!order) {
      return false;
    }

    return (
      order.customerId === userId ||
      order.restaurantOwnerId === userId ||
      order.driverUserId === userId
    );
  }

  private async canJoinRestaurant(
    userId: string,
    restaurantId: string,
  ): Promise<boolean> {
    const [restaurant] = await this.db
      .select({
        ownerId: restaurants.ownerId,
      })
      .from(restaurants)
      .where(eq(restaurants.id, restaurantId));

    if (!restaurant) {
      return false;
    }

    return restaurant.ownerId === userId;
  }
}
