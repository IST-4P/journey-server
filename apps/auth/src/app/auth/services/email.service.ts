import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import fs from 'fs';
import path from 'path';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend;
  private otpTemplate: string;

  constructor(private readonly configService: ConfigService) {
    this.resend = new Resend(this.configService.getOrThrow('RESEND_API_KEY'));

    // Load template from dist/assets (works in both dev and production)
    const templatePath = path.join(__dirname, 'assets', 'otp.html');
    this.otpTemplate = fs.readFileSync(templatePath, 'utf-8');
  }

  sendOTP(body: { email: string; code: string }) {
    return this.resend.emails.send({
      from: 'Phi <no-reply@hacmieu.xyz>',
      to: [body.email],
      subject: 'Mã OTP',
      html: this.otpTemplate.replace(/\{\{code\}\}/g, body.code),
    });
  }
}
