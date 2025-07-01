import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  async sendOfferNotification(
    to: string,
    offerDetails: { amount: number; itemName: string; userName: string },
  ) {
    console.log(
      `[Email Simulation] Would send to ${to}: ${offerDetails.userName} has contributed ${offerDetails.amount} to "${offerDetails.itemName}".`,
    );
  }
}
