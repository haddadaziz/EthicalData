import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  private getDefaults(key: string): any {
    const defaults: Record<string, any> = {
      general: {
        siteName: 'Ethical Data Security',
        contactEmail: 'contact@ethicaldata.local',
        allowRegistrations: true,
        supportPhone: '+33 1 00 00 00 00',
      },
      security: {
        passwordMinLength: 8,
        passwordRequireUppercase: true,
        passwordRequireDigit: true,
        passwordRequireSpecialChar: true,
        downloadQuota: 10,
        antiSharingEnabled: true,
        bannedIps: [],
      },
      ai: {
        activeModel: 'gemini-2.5-flash',
        apiKey: '',
        apiUrl: '',
        customPrompt: `Vous êtes un examinateur officiel expert en certifications informatiques (Cloud, Cybersécurité, Réseaux, ISO 27001, etc.).
Évaluez de manière rigoureuse et constructive la réponse fournie par le candidat à la question ouverte ci-dessous en vous référant au corrigé type officiel.

DÉTAILS DE LA QUESTION :
- Énoncé de la question : "{{enonce}}"
- Corrigé officiel / Réponse attendue : "{{reponseCorrecte}}"
- Critères d'évaluation additionnels : "{{grilleNotation}}"

RÉPONSE DU CANDIDAT :
"{{reponseCandidat}}"

INSTRUCTIONS DE NOTATION :
1. Attribuez un score entier entre 0 et 100.
2. Soyez constructif. Si la réponse est très courte ou incomplète, pénalisez le score de manière proportionnelle mais juste.
3. Rédigez une critique claire résumant ce qui est correct et ce qui manque.
4. Rédigez des suggestions concrètes pour aider le candidat à réviser la notion si sa réponse est imparfaite.`,
        maxTokens: 2048,
      },
      integrations: {
        discordWebhookUrl: '',
        slackWebhookUrl: '',
        stripePublicKey: '',
        stripeSecretKey: '',
        ssoEnabled: false,
        smtpHost: '',
        smtpPort: 587,
        smtpSecure: false,
        smtpUser: '',
        smtpPass: '',
        smtpFrom: '',
      },
    };

    return defaults[key] || {};
  }

  async getSetting(key: string): Promise<any> {
    try {
      const setting = await this.prisma.configurationSysteme.findUnique({
        where: { cle: key },
      });

      if (!setting) {
        return this.getDefaults(key);
      }

      try {
        return JSON.parse(setting.valeur);
      } catch {
        return setting.valeur;
      }
    } catch {
      return this.getDefaults(key);
    }
  }

  async updateSetting(key: string, value: any): Promise<any> {
    const stringifiedValue =
      typeof value === 'string' ? value : JSON.stringify(value);

    const setting = await this.prisma.configurationSysteme.upsert({
      where: { cle: key },
      update: { valeur: stringifiedValue },
      create: { cle: key, valeur: stringifiedValue },
    });

    try {
      return JSON.parse(setting.valeur);
    } catch {
      return setting.valeur;
    }
  }

  async getAllSettings(): Promise<Record<string, any>> {
    const keys = ['general', 'security', 'ai', 'integrations'];
    const result: Record<string, any> = {};

    for (const key of keys) {
      result[key] = await this.getSetting(key);
    }

    return result;
  }
}
