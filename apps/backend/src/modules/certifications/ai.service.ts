import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ResultatEvaluation {
  score: number;
  critique: string;
  suggestions: string;
}

@Injectable()
export class AiService {
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GEMINI_API_KEY') || '';
  }

  async evaluerReponseOuverte(
    enonce: string,
    reponseCorrecte: string | null,
    grilleNotation: string | null,
    reponseCandidat: string,
  ): Promise<ResultatEvaluation> {
    if (!this.apiKey || this.apiKey.includes('AIzaSy...')) {
      return this.evaluationSimulee(reponseCandidat, reponseCorrecte);
    }

    try {
      const prompt = `Vous êtes un examinateur officiel expert en certifications informatiques (Cloud, Cybersécurité, Réseaux, ISO 27001, etc.).
Évaluez de manière rigoureuse et constructive la réponse fournie par le candidat à la question ouverte ci-dessous en vous référant au corrigé type officiel.

DÉTAILS DE LA QUESTION :
- Énoncé de la question : "${enonce}"
${reponseCorrecte ? `- Corrigé officiel / Réponse attendue : "${reponseCorrecte}"` : ''}
${grilleNotation ? `- Critères d'évaluation additionnels : "${grilleNotation}"` : ''}

RÉPONSE DU CANDIDAT :
"${reponseCandidat}"

INSTRUCTIONS DE NOTATION :
1. Attribuez un score entier entre 0 et 100.
2. Soyez constructif. Si la réponse est très courte ou incomplète, pénalisez le score de manière proportionnelle mais juste.
3. Rédigez une critique claire résumant ce qui est correct et ce qui manque.
4. Rédigez des suggestions concrètes pour aider le candidat à réviser la notion si sa réponse est imparfaite.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: 'OBJECT',
                properties: {
                  score: {
                    type: 'INTEGER',
                    description:
                      'Note globale sur 100 attribuée à la réponse du candidat.',
                  },
                  critique: {
                    type: 'STRING',
                    description:
                      'Synthèse explicative des points forts et faiblesses identifiés dans la réponse du candidat.',
                  },
                  suggestions: {
                    type: 'STRING',
                    description:
                      'Conseils de révision ciblés et constructifs pour corriger les lacunes détectées.',
                  },
                },
                required: ['score', 'critique', 'suggestions'],
              },
            },
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur API Gemini:', errorText);
        throw new Error(`API Gemini a répondu avec le statut ${response.status}`);
      }

      const responseData = await response.json();
      const textResponse = responseData.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textResponse) {
        throw new Error('Réponse vide reçue de Gemini');
      }

      const parsedResult: ResultatEvaluation = JSON.parse(textResponse);
      return parsedResult;
    } catch (error: any) {
      console.error("Erreur lors de l'évaluation IA :", error);
      // Fallback résilient en cas d'erreur de connexion réseau ou d'API
      return this.evaluationSimulee(reponseCandidat, reponseCorrecte);
    }
  }

  /**
   * Méthode de secours simulant l'évaluation si l'API est indisponible ou non configurée.
   */
  private evaluationSimulee(reponseCandidat: string, reponseCorrecte: string | null): ResultatEvaluation {
    const cleanCand = reponseCandidat.trim().toLowerCase();
    const cleanCorr = (reponseCorrecte || '').trim().toLowerCase();

    if (!cleanCand) {
      return {
        score: 0,
        critique: "Aucune réponse n'a été fournie par le candidat.",
        suggestions: "Vous devez rédiger une explication structurée pour cette question.",
      };
    }

    // Calcul rapide de similarité de mots pour la démo hors-ligne
    const motsCandidat = cleanCand.split(/\s+/);
    const motsCorrects = cleanCorr.split(/\s+/);
    
    let correspondances = 0;
    motsCandidat.forEach((mot) => {
      if (mot.length > 3 && cleanCorr.includes(mot)) {
        correspondances++;
      }
    });

    const ratio = correspondances / Math.max(motsCorrects.length * 0.4, 5);
    const scoreSimule = Math.min(Math.round(ratio * 100), 100);

    if (scoreSimule > 70) {
      return {
        score: scoreSimule,
        critique: "Votre réponse couvre plusieurs mots-clés essentiels attendus dans le corrigé officiel.",
        suggestions: "Excellent travail. Pour optimiser votre score, veillez à utiliser les termes techniques précis du référentiel.",
      };
    } else if (scoreSimule > 30) {
      return {
        score: scoreSimule,
        critique: "Réponse partiellement correcte mais trop superficielle. Certains mots-clés importants sont présents, mais l'explication manque de profondeur technique.",
        suggestions: "Révisez le cours associé à cette notion pour structurer plus rigoureusement votre raisonnement.",
      };
    } else {
      return {
        score: Math.max(scoreSimule, 15),
        critique: "La réponse fournie est trop éloignée du corrigé attendu ou trop succincte.",
        suggestions: "Relisez attentivement la correction officielle et apprenez les définitions fondamentales de ce chapitre.",
      };
    }
  }
}
