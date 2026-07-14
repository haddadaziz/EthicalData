import React from 'react';
import { BookOpen } from '@/components/icons';

interface WelcomeSectionProps {
    userName: string;
    onDismiss: () => void;
}

export default function WelcomeSection({ userName, onDismiss }: WelcomeSectionProps) {
    return (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xs flex-1 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <BookOpen className="w-8 h-8" />
            </div>
            <div className="space-y-2 max-w-md">
                <h3 className="text-lg font-black text-slate-955">
                    {userName ? `Bienvenue ${userName}, créez votre premier module de cours` : 'Créez votre premier module de cours'}
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Proposez des chapitres de révision, des fiches méthodologiques et des quiz pour accompagner vos élèves vers la réussite de leurs examens.
                </p>
            </div>
            <button
                type="button"
                onClick={onDismiss}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-2xl transition-all shadow-md shadow-blue-600/20 cursor-pointer"
            >
                Créer un cours maintenant
            </button>
        </div>
    );
}
