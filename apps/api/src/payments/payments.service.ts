import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Database } from '../db';
import Stripe from 'stripe';
import { orders } from '../db/schema';
import { eq } from 'drizzle-orm';
import { OrdersGateway } from '../gateway/orders.gateway';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    @Inject('DB')
    private readonly db: Database,
    private ordersGateway: OrdersGateway,
  ) {
    //initialize Stripe with the secret key
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }

  async createPaymentIntent(orderId: string, customerId: string) {
    const [order] = await this.db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId));

    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.customerId !== customerId) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== 'PENDING') {
      throw new BadRequestException('Order is no longer pending');
    }

    const amount = Math.round(Number(order.totalAmount) * 100);

    if (!Number.isInteger(amount) || amount <= 0) {
      throw new BadRequestException('Invalid order amount');
    }

    // create payment intent - amount must be in smallest currency unit (cents)
    const paymentIntent = await this.stripe.paymentIntents.create(
      {
        amount: amount, // e.g. $8.99 - 899cents
        currency: 'usd',
        metadata: {
          orderId: order.id, // attach orderId so we can find it in the webhook
        },
      },
      {
        idempotencyKey: `order-payment-${order.id}`,
      },
    );

    //save paymentIntentId to order so webhook can match it
    await this.db
      .update(orders)
      .set({
        stripePaymentIntentId: paymentIntent.id,
      })
      .where(eq(orders.id, orderId));
    return { clientSecret: paymentIntent.client_secret };
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    let event: ReturnType<typeof this.stripe.webhooks.constructEvent>;

    try {
      //verify webhook signature - ensures the request is genuinely from stripe
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );
    } catch {
      throw new BadRequestException('Invalid webhook signature');
    }
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      const [order] = await this.db
        .select()
        .from(orders)
        .where(eq(orders.stripePaymentIntentId, paymentIntent.id));

      if (!order) return { received: true };

      // Stripe can resend webhooks.
      if (order.paymentStatus === 'PAID') {
        return { received: true };
      }

      const [updated] = await this.db
        .update(orders)
        .set({
          status: 'CONFIRMED',
          paymentStatus: 'PAID',
          updatedAt: new Date(),
        })
        .where(eq(orders.id, order.id))
        .returning();

      this.ordersGateway.emitOrderUpdate(updated);
    }
  }
}
