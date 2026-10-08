import { Body, Controller, type RawBodyRequest, Headers, HttpCode, Param, Post, Request, UseGuards } from "@nestjs/common";
import { JwtPayload, UserRole } from "@food-delivery/types";
import { Request as ExpressRequest } from 'express'
import { Roles } from "../auth/decorators/role.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { PaymentsService } from "./payments.service";
import { CreatePaymentIntentDto } from "./dto/create-payment-intent.dto";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

type AuthRequest = ExpressRequest & { user: JwtPayload }

@Controller('payments')
@ApiTags('Payments')
export class PaymentsController {
    constructor(private paymentsService: PaymentsService) { }

    @Post('intent')
    @ApiBearerAuth('access-token')
    @ApiBody({ type: CreatePaymentIntentDto })
    @ApiOperation({ summary: 'Create or retrieve a Stripe payment intent for an order' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.CUSTOMER)
    createIntent(
        @Request() req: AuthRequest,
        @Body() dto: CreatePaymentIntentDto,
    ) {
        return this.paymentsService.createPaymentIntent(dto.orderId, req.user.sub)
    }

    @Post('webhook')
    @ApiOperation({ summary: 'Receive verified Stripe payment events' })
    @HttpCode(200)
    handleWebhook(
        @Request() req: RawBodyRequest<ExpressRequest>,
        @Headers('stripe-signature') signature: string,
    ) {
        //req.rawBody is the raw Buffer - required for webhook signature verification
        // this only works because we enabled rawBody: true in main.ts
        return this.paymentsService.handleWebhook(req.rawBody!, signature)
    }


}
