"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '../../../../../lib/api';
import { useToast } from '../../../../../context/ToastContext';
import { CourseFormModal } from '../../../../../components/admin/courses/CourseFormModal';

interface CertificationInfo {
    id: string;
    nom: string;
    codeExamen: string;
}

export default function EditCoursePage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { showToast } = useToast();

    const [loading, setLoading] = useState(true);
    const [initialData, setInitialData] = useState<any>(null);
    const [certifications, setCertifications] = useState<CertificationInfo[]>([]);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        Promise.all([
            apiFetch(`/cours/${id}`),
            apiFetch('/certifications')
        ]).then(([course, certs]) => {
            setInitialData({
                id: course.id,
                titre: course.titre,
                description: course.description,
                dureeEstimee: course.dureeEstimee,
                imageUrl: course.imageUrl,
                certificationId: course.certification?.id ? Number(course.certification.id) : null,
                objectifs: course.objectifs || [],
                prerequis: course.prerequis || [],
                publicCible: course.publicCible || [],
                statut: course.statut,
            });
            setCertifications(Array.isArray(certs) ? certs : (certs?.data || []));
        }).catch((err: any) => {
            showToast(err.message || "Erreur lors du chargement.", "error");
        }).finally(() => setLoading(false));
    }, [id]);

    const handleSubmit = useCallback(async (payload: any) => {
        setUpdateLoading(true);
        setError(null);
        try {
            await apiFetch(`/cours/${id}`, { method: 'PATCH', body: payload });
            showToast(`Le cours "${payload.titre}" a été mis à jour.`, "success");
            router.push('/admin/courses');
        } catch (err: any) {
            const msg = err.message || "Erreur lors de la mise à jour.";
            setError(msg);
            showToast(msg, "error");
        } finally {
            setUpdateLoading(false);
        }
    }, [id, router, showToast]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <span className="w-10 h-10 border-4 border-blue-800/50 border-t-cyan-400 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 flex flex-col">
            <CourseFormModal
                isOpen={true}
                onClose={() => router.push('/admin/courses')}
                onSubmit={handleSubmit}
                initialData={initialData}
                certifications={certifications}
                modalLoading={updateLoading}
                modalError={error}
                inline={true}
                fullWidth={true}
            />
        </div>
    );
}
