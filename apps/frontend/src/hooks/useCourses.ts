import { useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api';

export function useCourses() {
  const [cours, setCours] = useState<any[]>([]);
  const [certs, setCerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [coursData, certsData] = await Promise.all([
        apiFetch('/cours/mes-cours'),
        apiFetch('/certifications'),
      ]);
      setCours(Array.isArray(coursData) ? coursData : []);
      setCerts(Array.isArray(certsData) ? certsData : (certsData?.data || []));
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Impossible de charger les cours.");
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCours = async (coursId: string) => {
    await apiFetch(`/cours/${coursId}`, { method: 'DELETE' });
    await fetchInitialData();
  };

  const publishCours = async (coursId: string) => {
    await apiFetch(`/cours/${coursId}/publier`, { method: 'PATCH' });
    await fetchInitialData();
  };

  const createCours = async (data: any, statut: 'BROUILLON' | 'PUBLIE' = 'BROUILLON') => {
    await apiFetch('/cours', {
      method: 'POST',
      body: { ...data, statut },
    });
    await fetchInitialData();
  };

  const updateCours = async (coursId: string, data: any, statut?: 'BROUILLON' | 'PUBLIE') => {
    const payload = statut ? { ...data, statut } : data;
    await apiFetch(`/cours/${coursId}`, {
      method: 'PATCH',
      body: payload,
    });
    await fetchInitialData();
  };

  return {
    cours,
    certs,
    loading,
    error,
    fetchInitialData,
    deleteCours,
    publishCours,
    createCours,
    updateCours,
  };
}
