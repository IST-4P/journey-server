import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import fs from 'fs';
import path from 'path';
import { Resend } from 'resend';

const otpTemplate = fs.readFileSync(path.resolve('src/assets/otp.html'), {
  encoding: 'utf-8',
});

@Injectable()
export class EmailService {
  private resend: Resend;
  constructor(private readonly configService: ConfigService) {
    this.resend = new Resend(this.configService.get('RESEND_API_KEY'));
  }

  sendOTP(body: { email: string; code: string }) {
    return this.resend.emails.send({
      from: 'Phi <no-reply@hacmieu.xyz>',
      to: [body.email],
      subject: 'Mã OTP',
      html: otpTemplate.replace(/\{\{code\}\}/g, body.code),
    });
  }
}
