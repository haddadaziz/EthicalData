import { useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api';

export function useCertifications() {
  const [certs, setCerts] = useState<any[]>([]);
  const [fournisseurs, setFournisseurs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [certsData, fournisseursData] = await Promise.all([
        apiFetch('/certifications'),
        apiFetch('/certifications/fournisseurs')
      ]);
      setCerts(certsData);
      setFournisseurs(fournisseursData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Impossible de charger les données du catalogue.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFournisseurs = useCallback(async () => {
    try {
      const fournisseursData = await apiFetch('/certifications/fournisseurs');
      setFournisseurs(fournisseursData);
    } catch (err: any) {
      console.error(err);
    }
  }, []);

  const fetchCerts = useCallback(async () => {
    try {
      const certsData = await apiFetch('/certifications');
      setCerts(certsData);
    } catch (err: any) {
      console.error(err);
    }
  }, []);

  const createCert = async (payload: any) => {
    await apiFetch('/certifications', {
      method: 'POST',
      body: payload
    });
    await fetchCerts();
  };

  const updateCert = async (id: string, payload: any) => {
    await apiFetch(`/certifications/${id}`, {
      method: 'PUT',
      body: payload
    });
    await fetchCerts();
  };

  const deleteCert = async (id: string) => {
    await apiFetch(`/certifications/${id}`, {
      method: 'DELETE'
    });
    await fetchCerts();
  };

  const createFournisseur = async (nom: string) => {
    const newFourn = await apiFetch('/certifications/fournisseurs', {
      method: 'POST',
      body: { nom }
    });
    await fetchFournisseurs();
    return newFourn;
  };

  const deleteFournisseur = async (id: string) => {
    await apiFetch(`/certifications/fournisseurs/${id}`, {
      method: 'DELETE'
    });
    await fetchFournisseurs();
  };

  const fetchQuestions = async (certId: string) => {
    return await apiFetch(`/certifications/${certId}/questions`);
  };

  const saveQuestion = async (certId: string, payload: any, questionId?: string) => {
    if (questionId) {
      await apiFetch(`/certifications/questions/${questionId}`, {
        method: 'PUT',
        body: payload
      });
    } else {
      await apiFetch(`/certifications/${certId}/questions`, {
        method: 'POST',
        body: payload
      });
    }
  };

  const deleteQuestion = async (questionId: string) => {
    await apiFetch(`/certifications/questions/${questionId}`, {
      method: 'DELETE'
    });
  };

  return {
    certs,
    fournisseurs,
    loading,
    error,
    fetchInitialData,
    createCert,
    updateCert,
    deleteCert,
    createFournisseur,
    deleteFournisseur,
    fetchQuestions,
    saveQuestion,
    deleteQuestion
  };
}
