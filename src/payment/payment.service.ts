// payment.service.ts
import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentService {
  getAllPayments() {
    throw new Error('Method not implemented.');
  }
  private readonly stripe: Stripe;

  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    private configService: ConfigService,
  ) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY'),
      { apiVersion: '2024-04-10' },
    );
  }

  async createPaymentIntent(
    price: number,
    currency: string,
  ): Promise<{ clientSecret: string }> {
    // Переводим сумму в тыйыны (minor units)
    const amountInMinorUnit = Math.round(price * 100);

    // Проверка Stripe минимальной суммы
    if (currency.toLowerCase() === 'kgs' && amountInMinorUnit < 5000) {
      throw new Error(`Минимальная сумма — 50 сомов. Вы указали: ${price}`);
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amountInMinorUnit,
      currency: currency.toLowerCase(), // убедись, что это 'kgs' или другая допустимая валюта
    });

    // Сохраняем платёж в базу (необязательно, если не нужно)
    const payment = new Payment();
    payment.stripePaymentIntentId = paymentIntent.id;
    payment.price = price;
    payment.currency = currency;
    payment.status = paymentIntent.status;

    await this.paymentsRepository.save(payment);

    return { clientSecret: paymentIntent.client_secret };
  }
}
