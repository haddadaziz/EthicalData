'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { useCourses } from '@/hooks/useCourses';
import dynamic from 'next/dynamic';

const CourseEditor = dynamic(
  () => import('@/components/dashboard/courses/CourseEditor').then((mod) => mod.CourseEditor),
  { ssr: false, loading: () => <div className="p-8 text-center text-slate-400 bg-[#080d1a] border border-slate-800 rounded-3xl">Chargement de l'éditeur...</div> }
);

export default function NewCoursePage() {
    const { showToast } = useToast();
    const router = useRouter();
    const { certs, createCours } = useCourses();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        apiFetch('/users/me/profile')
            .then((profile) => {
                if (profile && profile.roles) {
                    const roles = profile.roles.map((r: any) => r.nom);
                    if (roles.includes('FORMATEUR') || roles.includes('ADMIN') || roles.includes('SUPER_ADMIN')) {
                        setIsAuthorized(true);
                    } else {
                        setIsAuthorized(false);
                        router.push('/dashboard');
                    }
                } else {
                    setIsAuthorized(false);
                    router.push('/login');
                }
            })
            .catch(() => {
                setIsAuthorized(false);
                router.push('/login');
            });
    }, [router]);

    if (isAuthorized === null) {
        return (
            <div className="p-16 text-center text-slate-400 bg-[#080d1a] border border-slate-800 rounded-3xl max-w-5xl mx-auto my-8">
                <span className="w-10 h-10 border-4 border-blue-950 border-t-cyan-500 rounded-full animate-spin inline-block mb-3" />
                <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">Chargement de l'espace de création...</p>
            </div>
        );
    }

    if (!isAuthorized) return null;

    return (
        <div className="w-full pb-10 px-2 sm:px-4 lg:px-6">
            <CourseEditor
                certs={certs}
                editingCours={null}
                onClose={() => router.push('/dashboard/courses')}
                showToast={showToast}
                onSave={async (data) => {
                    await createCours(data, 'BROUILLON');
                    showToast("Cours créé avec succès.", "success");
                    router.push('/dashboard/courses');
                }}
                onSaveDraft={async (data) => {
                    await createCours(data, 'BROUILLON');
                    showToast("Brouillon sauvegardé.", "success");
                    router.push('/dashboard/courses');
                }}
                onPublish={async (data) => {
                    await createCours(data, 'PUBLIE');
                    showToast("Cours publié avec succès !", "success");
                    router.push('/dashboard/courses');
                }}
            />
        </div>
    );
}
