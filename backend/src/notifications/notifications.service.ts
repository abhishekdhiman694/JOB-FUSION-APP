import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private configService: ConfigService) {}

  async sendPushNotification(fcmToken: string, title: string, body: string, data?: object): Promise<boolean> {
    if (!fcmToken) return false;
    this.logger.log(`[FCM] Sending to ${fcmToken}: ${title} - ${body}`);
    // Firebase Admin SDK integration - add google-services.json to activate
    // const message = { notification: { title, body }, data, token: fcmToken };
    // await admin.messaging().send(message);
    return true;
  }

  async sendJobAlert(fcmToken: string, jobTitle: string, company: string): Promise<void> {
    await this.sendPushNotification(
      fcmToken,
      'New Job Match!',
      `${jobTitle} at ${company} matches your profile`,
      { type: 'job_alert' },
    );
  }
}
