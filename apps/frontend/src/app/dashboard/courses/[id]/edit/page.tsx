'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { useCourses } from '@/hooks/useCourses';
import dynamic from 'next/dynamic';

const CourseEditor = dynamic(
  () => import('@/components/dashboard/courses/CourseEditor').then((mod) => mod.CourseEditor),
  { ssr: false, loading: () => <div className="p-8 text-center text-slate-400 bg-[#080d1a] border border-slate-800 rounded-3xl">Chargement de l'éditeur...</div> }
);

export default function EditCoursePage() {
    const { showToast } = useToast();
    const router = useRouter();
    const params = useParams();
    const coursId = params?.id as string;

    const { certs, updateCours } = useCourses();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const [coursData, setCoursData] = useState<any | null>(null);
    const [loadingCours, setLoadingCours] = useState(true);

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

    useEffect(() => {
        if (isAuthorized && coursId) {
            apiFetch(`/cours/${coursId}`)
                .then((data) => {
                    setCoursData(data);
                })
                .catch((err) => {
                    showToast("Impossible de charger le cours.", "error");
                    router.push('/dashboard/courses');
                })
                .finally(() => {
                    setLoadingCours(false);
                });
        }
    }, [isAuthorized, coursId, router, showToast]);

    if (isAuthorized === null || loadingCours) {
        return (
            <div className="p-16 text-center text-slate-400 bg-[#080d1a] border border-slate-800 rounded-3xl max-w-5xl mx-auto my-8">
                <span className="w-10 h-10 border-4 border-blue-950 border-t-cyan-500 rounded-full animate-spin inline-block mb-3" />
                <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">Chargement du cours...</p>
            </div>
        );
    }

    if (!isAuthorized || !coursData) return null;

    return (
        <div className="w-full pb-10 px-2 sm:px-4 lg:px-6">
            <CourseEditor
                certs={certs}
                editingCours={coursData}
                onClose={() => router.push('/dashboard/courses')}
                showToast={showToast}
                onSave={async (data) => {
                    await updateCours(coursData.id, data);
                    showToast("Cours mis à jour.", "success");
                    router.push('/dashboard/courses');
                }}
                onSaveDraft={async (data) => {
                    await updateCours(coursData.id, data, 'BROUILLON');
                    showToast("Brouillon mis à jour.", "success");
                    router.push('/dashboard/courses');
                }}
                onPublish={async (data) => {
                    await updateCours(coursData.id, data, 'PUBLIE');
                    showToast("Cours publié avec succès !", "success");
                    router.push('/dashboard/courses');
                }}
            />
        </div>
    );
}
