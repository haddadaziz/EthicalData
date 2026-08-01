import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class MailService {
  constructor(
    private readonly configService: ConfigService,
    private readonly settingsService: SettingsService,
  ) {}

  private async sendMail(to: string, subject: string, html: string) {
    const settings = await this.settingsService.getSetting('integrations');
    const smtpConfigured =
      settings?.smtpHost && settings?.smtpUser && settings?.smtpPass;

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
          from:
            settings.smtpFrom ||
            '"Ethical Data Security" <noreply@ethicaldatasecurity.ma>',
          to,
          subject,
          html,
        });
        console.log(`[SMTP Mailer] Email sent successfully to ${to} (${subject})`);
        return;
      } catch (err) {
        console.error('[SMTP Mailer Error] Falling back to console logger:', err);
      }
    }

    console.log('========================================');
    console.log(`TRANSACTIONAL EMAIL LOGGER (Dev Mode)`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log('========================================');
  }

  // 1. Réinitialisation de Mot de Passe
  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;
    const subject = 'Réinitialisation de votre mot de passe - Ethical Data Security';

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #020617; color: #f8fafc; padding: 40px;">
    <div style="max-width: 580px; margin: auto; background: #080d1a; border: 1px solid #1e293b; border-radius: 20px; padding: 32px;">
        <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="color: #22d3ee; margin: 0; font-size: 20px; text-transform: uppercase;">ETHICAL DATA SECURITY</h2>
            <p style="color: #94a3b8; font-size: 12px;">Cybersecurity & Cloud Expertise</p>
        </div>
        <h3 style="color: #ffffff; margin-top: 0;">Réinitialisation de mot de passe</h3>
        <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
            Vous avez demandé la réinitialisation de votre mot de passe sur <strong>Ethical Data Security</strong>.
        </p>
        <div style="text-align: center; margin: 32px 0;">
            <a href="${resetLink}" style="background: linear-gradient(90deg, #2563eb, #0891b2); color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
                Réinitialiser mon mot de passe
            </a>
        </div>
        <p style="color: #64748b; font-size: 12px;">Ce lien sécurisé expire dans 1 heure.</p>
    </div>
</body>
</html>`;

    await this.sendMail(to, subject, html);
  }

  // 2. Notification de Confirmation d'Inscription
  async sendEnrollmentConfirmationEmail(
    to: string,
    data: { studentName: string; courseTitle: string; startDate: string; deliveryType: string }
  ): Promise<void> {
    const subject = `Confirmation d'inscription : ${data.courseTitle} - Ethical Data Security`;
    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #020617; color: #f8fafc; padding: 40px;">
    <div style="max-width: 580px; margin: auto; background: #080d1a; border: 1px solid #1e293b; border-radius: 20px; padding: 32px;">
        <h2 style="color: #22d3ee; margin: 0; font-size: 18px;">Confirmation d'Inscription</h2>
        <p style="color: #cbd5e1; font-size: 14px; margin-top: 12px;">Bonjour <strong>${data.studentName}</strong>,</p>
        <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
            Votre inscription au programme de formation <strong>&laquo; ${data.courseTitle} &raquo;</strong> a été validée avec succès.
        </p>
        <div style="background: #020617; border: 1px solid #1e293b; border-radius: 12px; padding: 16px; margin: 20px 0;">
            <p style="margin: 4px 0; color: #94a3b8; font-size: 12px;">Modalité : <strong style="color: #22d3ee;">${data.deliveryType}</strong></p>
            <p style="margin: 4px 0; color: #94a3b8; font-size: 12px;">Date de démarrage : <strong style="color: #ffffff;">${data.startDate}</strong></p>
        </div>
        <div style="text-align: center; margin-top: 24px;">
            <a href="http://localhost:3001/dashboard/cours" style="background: #2563eb; color: white; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 13px; display: inline-block;">
                Accéder à mon Espace Apprenant
            </a>
        </div>
    </div>
</body>
</html>`;

    await this.sendMail(to, subject, html);
  }

  // 3. Notification de Rappel de Session Live
  async sendSessionReminderEmail(
    to: string,
    data: { studentName: string; sessionTitle: string; sessionDate: string; joinUrl: string }
  ): Promise<void> {
    const subject = `Rappel de Session Live : ${data.sessionTitle} - Ethical Data Security`;
    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #020617; color: #f8fafc; padding: 40px;">
    <div style="max-width: 580px; margin: auto; background: #080d1a; border: 1px solid #1e293b; border-radius: 20px; padding: 32px;">
        <h2 style="color: #f59e0b; margin: 0; font-size: 18px;">⏰ Rappel de Votre Prochaine Session Live</h2>
        <p style="color: #cbd5e1; font-size: 14px; margin-top: 12px;">Bonjour <strong>${data.studentName}</strong>,</p>
        <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
            Votre session de cours en visioconférence interactive aura lieu très prochainement :
        </p>
        <div style="background: #020617; border: 1px solid #f59e0b; border-radius: 12px; padding: 16px; margin: 20px 0;">
            <p style="margin: 4px 0; color: #ffffff; font-size: 14px; font-weight: bold;">${data.sessionTitle}</p>
            <p style="margin: 4px 0; color: #f59e0b; font-size: 12px;">Date & Heure : <strong>${data.sessionDate}</strong></p>
        </div>
        <div style="text-align: center; margin-top: 24px;">
            <a href="${data.joinUrl}" style="background: #f59e0b; color: #020617; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 13px; display: inline-block;">
                Rejoindre la Visioconférence
            </a>
        </div>
    </div>
</body>
</html>`;

    await this.sendMail(to, subject, html);
  }

  // 4. Envoi Automatique de Facture & Reçu d'Achat
  async sendInvoiceReceiptEmail(
    to: string,
    data: { studentName: string; invoiceNumber: string; totalAmount: string; date: string; items: { description: string; amount: string }[] }
  ): Promise<void> {
    const subject = `Facture & Reçu de Paiement #${data.invoiceNumber} - Ethical Data Security`;
    const itemsHtml = data.items
      .map(
        (i) =>
          `<tr><td style="padding: 8px; border-bottom: 1px solid #1e293b; color: #cbd5e1; font-size: 13px;">${i.description}</td><td style="padding: 8px; border-bottom: 1px solid #1e293b; color: #ffffff; font-weight: bold; text-align: right; font-size: 13px;">${i.amount}</td></tr>`
      )
      .join('');

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #020617; color: #f8fafc; padding: 40px;">
    <div style="max-width: 580px; margin: auto; background: #080d1a; border: 1px solid #1e293b; border-radius: 20px; padding: 32px;">
        <h2 style="color: #10b981; margin: 0; font-size: 18px;">Facture & Reçu Officiel d'Achat</h2>
        <p style="color: #cbd5e1; font-size: 14px; margin-top: 12px;">Bonjour <strong>${data.studentName}</strong>,</p>
        <p style="color: #cbd5e1; font-size: 14px;">Merci pour votre commande. Voici votre récapitulatif de facture :</p>
        
        <div style="background: #020617; border: 1px solid #1e293b; border-radius: 12px; padding: 16px; margin: 16px 0;">
            <p style="margin: 2px 0; color: #94a3b8; font-size: 12px;">N° Facture : <strong style="color: #ffffff;">${data.invoiceNumber}</strong></p>
            <p style="margin: 2px 0; color: #94a3b8; font-size: 12px;">Date de règlement : <strong style="color: #ffffff;">${data.date}</strong></p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <thead>
                <tr style="border-bottom: 2px solid #1e293b;">
                    <th style="text-align: left; padding: 8px; color: #94a3b8; font-size: 11px; text-transform: uppercase;">Désignation</th>
                    <th style="text-align: right; padding: 8px; color: #94a3b8; font-size: 11px; text-transform: uppercase;">Montant (TTC)</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHtml}
            </tbody>
        </table>

        <div style="text-align: right; margin-top: 16px; border-top: 2px solid #10b981; padding-top: 12px;">
            <span style="color: #94a3b8; font-size: 12px;">Total Payé : </span>
            <strong style="color: #10b981; font-size: 18px; font-family: monospace;">${data.totalAmount}</strong>
        </div>
    </div>
</body>
</html>`;

    await this.sendMail(to, subject, html);
  }

  // 5. Envoi Automatique de Code Voucher d'Examen
  async sendVoucherCodeEmail(
    to: string,
    data: { studentName: string; voucherTitle: string; voucherCode: string; provider: string; expiryDate: string }
  ): Promise<void> {
    const subject = `Votre Code Voucher d'Examen Official : ${data.voucherCode} - Ethical Data Security`;
    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #020617; color: #f8fafc; padding: 40px;">
    <div style="max-width: 580px; margin: auto; background: #080d1a; border: 1px solid #0891b2; border-radius: 20px; padding: 32px;">
        <h2 style="color: #22d3ee; margin: 0; font-size: 18px;">🎁 Votre Code Voucher est Disponible !</h2>
        <p style="color: #cbd5e1; font-size: 14px; margin-top: 12px;">Bonjour <strong>${data.studentName}</strong>,</p>
        <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
            Félicitations pour votre commande du voucher officiel <strong>${data.voucherTitle}</strong> (${data.provider}).
        </p>

        <div style="background: #082f49; border: 2px dashed #0284c7; border-radius: 14px; padding: 20px; text-align: center; margin: 24px 0;">
            <span style="color: #94a3b8; font-size: 11px; text-transform: uppercase; font-weight: bold; display: block; margin-bottom: 6px;">Code de Réduction d'Examen Pearson VUE / Certiport</span>
            <span style="color: #22d3ee; font-size: 22px; font-family: monospace; font-weight: bold; letter-spacing: 2px;">${data.voucherCode}</span>
            <span style="color: #64748b; font-size: 11px; display: block; margin-top: 8px;">Date d'expiration : ${data.expiryDate}</span>
        </div>

        <p style="color: #94a3b8; font-size: 12px; line-height: 1.5;">
            Utilisez ce code lors de la réservation de votre examen sur le portail officiel de l'éditeur (${data.provider}).
        </p>
    </div>
</body>
</html>`;

    await this.sendMail(to, subject, html);
  }
}
