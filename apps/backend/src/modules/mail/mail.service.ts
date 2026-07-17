import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class MailService {
    constructor(
        private readonly configService: ConfigService,
        private readonly settingsService: SettingsService,
    ) { }

    async sendPasswordResetEmail(to: string, token: string): Promise<void> {
        const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';
        const resetLink = `${frontendUrl}/reset-password?token=${token}`;

        const subject = 'Réinitialisation de votre mot de passe - Ethical Data Security';
        const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 40px;">
    <div style="max-width: 560px; margin: auto; background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <h2 style="color: #1e293b; margin-top: 0;">Réinitialisation de mot de passe</h2>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            Vous avez demandé la réinitialisation de votre mot de passe sur <strong>Ethical Data Security</strong>.
        </p>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe. Ce lien expire dans <strong>1 heure</strong>.
        </p>
        <div style="text-align: center; margin: 32px 0;">
            <a href="${resetLink}" style="background: #2563eb; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
                Réinitialiser mon mot de passe
            </a>
        </div>
        <p style="color: #94a3b8; font-size: 12px;">
            Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. Aucune modification ne sera effectuée.
        </p>
        <p style="color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
            &copy; ${new Date().getFullYear()} Ethical Data Security. Tous droits réservés.
        </p>
    </div>
</body>
</html>`;

        const settings = await this.settingsService.getSetting('integrations');
        const smtpConfigured = settings?.smtpHost && settings?.smtpUser && settings?.smtpPass;

        if (smtpConfigured) {
            try {
                const nodemailer = await import('nodemailer');
                const transporter = nodemailer.default.createTransport({
                    host: settings.smtpHost,
                    port: settings.smtpPort || 587,
                    secure: settings.smtpSecure || false,
                    auth: {
                        user: settings.smtpUser,
                        pass: settings.smtpPass,
                    },
                });
                await transporter.sendMail({
                    from: settings.smtpFrom || '"Ethical Data Security" <noreply@ethicaldata.com>',
                    to,
                    subject,
                    html,
                });
                console.log(`Password reset email sent to ${to}`);
                return;
            } catch (err) {
                console.error('SMTP error, falling back to console:', err);
            }
        }

        console.log('========================================');
        console.log('PASSWORD RESET EMAIL (dev mode)');
        console.log('To:', to);
        console.log('Subject:', subject);
        console.log('Reset link:', resetLink);
        console.log('Token:', token);
        console.log('========================================');
    }
}
