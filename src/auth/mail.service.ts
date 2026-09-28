import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  private readonly logger = new Logger('MailService');

  async sendVerificationEmail(email: string, token: string) {
    const verificationUrl = `http://localhost:3000/api/v1/auth/verify-email?token=${token}`;

    // mail
    this.logger.log('================== [EMAIL DISPATCH] ==================');
    this.logger.log(`To: ${email}`);
    this.logger.log(`Subject: EchoGPT - Verify Your Email Address`);
    this.logger.log(`Verification Token: ${token}`);
    this.logger.log(`Link: ${verificationUrl}`);
    this.logger.log('=======================================================');


    return true;
  }
}