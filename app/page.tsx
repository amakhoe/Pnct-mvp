'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import DashboardOverview from '@/components/DashboardOverview';
import PatientManager from '@/components/PatientManager';
import HealthPostManager from '@/components/HealthPostManager';
import TerritoryManager from '@/components/TerritoryManager';
import RiskZoneAnalysis from '@/components/RiskZoneAnalysis';
import PredictiveRiskSection from '@/components/PredictiveRiskSection';

import PatientFormModal from '@/components/PatientFormModal';
import PatientDetailModal from '@/components/PatientDetailModal';
import HealthPostFormModal from '@/components/HealthPostFormModal';
import TerritoryFormModal from '@/components/TerritoryFormModal';
import AiAdvisorModal from '@/components/AiAdvisorModal';
import AuthModal from '@/components/AuthModal';

import { useAuth } from '@/context/AuthContext';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';

import {
  Patient,
  Province,
  Locality,
  HealthPost,
  INITIAL_PATIENTS,
  INITIAL_PROVINCES,
  INITIAL_LOCALITIES,
  INITIAL_HEALTH_POSTS,
} from '@/lib/tb-data';
import { Lock, Cloud, Sparkles } from 'lucide-react';

export default function Home() {
  const { user, profile, isFirebaseConnected } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'patients' | 'predictive' | 'health-posts' | 'territories' | 'risk-zones'>('dashboard');

  // Core Data States
  const [provinces, setProvinces] = useState<Province[]>(INITIAL_PROVINCES);
  const [localities, setLocalities] = useState<Locality[]>(INITIAL_LOCALITIES);
  const [healthPosts, setHealthPosts] = useState<HealthPost[]>(INITIAL_HEALTH_POSTS);
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Load from localStorage on client mount if offline / not logged in
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const DATASET_VERSION = 'v2_mz_all_provinces';
        const savedVersion = localStorage.getItem('tb_mz_dataset_version');

        if (savedVersion === DATASET_VERSION) {
          const savedProvinces = localStorage.getItem('tb_provinces');
          const savedLocalities = localStorage.getItem('tb_localities');
          const savedHealthPosts = localStorage.getItem('tb_health_posts');
          const savedPatients = localStorage.getItem('tb_patients');

          if (savedProvinces) setProvinces(JSON.parse(savedProvinces));
          if (savedLocalities) setLocalities(JSON.parse(savedLocalities));
          if (savedHealthPosts) setHealthPosts(JSON.parse(savedHealthPosts));
          if (savedPatients) setPatients(JSON.parse(savedPatients));
        } else {
          setProvinces(INITIAL_PROVINCES);
          setLocalities(INITIAL_LOCALITIES);
          setHealthPosts(INITIAL_HEALTH_POSTS);
          setPatients(INITIAL_PATIENTS);
          localStorage.setItem('tb_mz_dataset_version', DATASET_VERSION);
          localStorage.setItem('tb_provinces', JSON.stringify(INITIAL_PROVINCES));
          localStorage.setItem('tb_localities', JSON.stringify(INITIAL_LOCALITIES));
          localStorage.setItem('tb_health_posts', JSON.stringify(INITIAL_HEALTH_POSTS));
          localStorage.setItem('tb_patients', JSON.stringify(INITIAL_PATIENTS));
        }
      } catch (e) {
        console.error('Failed to parse saved state from localStorage:', e);
      } finally {
        setIsInitialized(true);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Save to localStorage when state changes as local backup
  useEffect(() => {
    if (isInitialized && provinces.length > 0) localStorage.setItem('tb_provinces', JSON.stringify(provinces));
  }, [provinces, isInitialized]);

  useEffect(() => {
    if (isInitialized && localities.length > 0) localStorage.setItem('tb_localities', JSON.stringify(localities));
  }, [localities, isInitialized]);

  useEffect(() => {
    if (isInitialized && healthPosts.length > 0) localStorage.setItem('tb_health_posts', JSON.stringify(healthPosts));
  }, [healthPosts, isInitialized]);

  useEffect(() => {
    if (isInitialized && patients.length > 0) localStorage.setItem('tb_patients', JSON.stringify(patients));
  }, [patients, isInitialized]);

  // Seed baseline data to Firestore if user is authenticated and collection is empty
  const seedFirestoreIfEmpty = useCallback(async () => {
    if (!user) return;
    try {
      // Seed provinces
      for (const p of INITIAL_PROVINCES) {
        await setDoc(doc(db, 'provinces', p.id), p);
      }
      // Seed localities
      for (const l of INITIAL_LOCALITIES) {
        await setDoc(doc(db, 'localities', l.id), l);
      }
      // Seed health posts
      for (const hp of INITIAL_HEALTH_POSTS) {
        await setDoc(doc(db, 'healthPosts', hp.id), hp);
      }
      // Seed patients
      for (const pat of INITIAL_PATIENTS) {
        await setDoc(doc(db, 'patients', pat.id), pat);
      }
    } catch (err) {
      console.error('Error seeding baseline data into Firestore:', err);
    }
  }, [user]);

  // Firestore Real-time Listeners (Only attach when user is authenticated)
  useEffect(() => {
    if (!user) return;

    // Listen to patients
    const unsubPatients = onSnapshot(
      collection(db, 'patients'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Patient[] = [];
          snapshot.forEach((d) => list.push(d.data() as Patient));
          setPatients(list);
        } else {
          seedFirestoreIfEmpty();
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'patients');
      }
    );

    // Listen to provinces
    const unsubProvinces = onSnapshot(
      collection(db, 'provinces'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Province[] = [];
          snapshot.forEach((d) => list.push(d.data() as Province));
          setProvinces(list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'provinces');
      }
    );

    // Listen to localities
    const unsubLocalities = onSnapshot(
      collection(db, 'localities'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Locality[] = [];
          snapshot.forEach((d) => list.push(d.data() as Locality));
          setLocalities(list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'localities');
      }
    );

    // Listen to health posts
    const unsubHealthPosts = onSnapshot(
      collection(db, 'healthPosts'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: HealthPost[] = [];
          snapshot.forEach((d) => list.push(d.data() as HealthPost));
          setHealthPosts(list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'healthPosts');
      }
    );

    return () => {
      unsubPatients();
      unsubProvinces();
      unsubLocalities();
      unsubHealthPosts();
    };
  }, [user, seedFirestoreIfEmpty]);

  // Handler to restore official Mozambican baseline data
  const handleResetMozambiqueData = async () => {
    if (window.confirm('Deseja restaurar a base de dados oficial de Moçambique (MISAU / PNCT) com todas as 11 províncias, distritos e unidades sanitárias?')) {
      setProvinces(INITIAL_PROVINCES);
      setLocalities(INITIAL_LOCALITIES);
      setHealthPosts(INITIAL_HEALTH_POSTS);
      setPatients(INITIAL_PATIENTS);
      localStorage.setItem('tb_mz_dataset_version', 'v2_mz_all_provinces');
      localStorage.setItem('tb_provinces', JSON.stringify(INITIAL_PROVINCES));
      localStorage.setItem('tb_localities', JSON.stringify(INITIAL_LOCALITIES));
      localStorage.setItem('tb_health_posts', JSON.stringify(INITIAL_HEALTH_POSTS));
      localStorage.setItem('tb_patients', JSON.stringify(INITIAL_PATIENTS));

      if (user) {
        await seedFirestoreIfEmpty();
      }
    }
  };

  // Modal Visibility States
  const [isPatientFormOpen, setIsPatientFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const [selectedDetailPatient, setSelectedDetailPatient] = useState<Patient | null>(null);

  const [isHealthPostFormOpen, setIsHealthPostFormOpen] = useState(false);
  const [editingHealthPost, setEditingHealthPost] = useState<HealthPost | null>(null);

  const [isTerritoryFormOpen, setIsTerritoryFormOpen] = useState(false);
  const [territoryFormMode, setTerritoryFormMode] = useState<'province' | 'locality'>('province');

  const [isAiAdvisorOpen, setIsAiAdvisorOpen] = useState(false);
  const [aiAdvisorPrompt, setAiAdvisorPrompt] = useState('');
  const [aiSelectedPatientContext, setAiSelectedPatientContext] = useState<Patient | null>(null);

  // Handlers for Patient CRUD
  const handleSavePatient = async (patient: Patient) => {
    setPatients((prev) => {
      const exists = prev.some((p) => p.id === patient.id);
      if (exists) {
        return prev.map((p) => (p.id === patient.id ? patient : p));
      }
      return [patient, ...prev];
    });

    if (user) {
      try {
        await setDoc(doc(db, 'patients', patient.id), patient);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `patients/${patient.id}`);
      }
    }
  };

  const handleDeletePatient = async (patientId: string) => {
    setPatients((prev) => prev.filter((p) => p.id !== patientId));

    if (user) {
      try {
        await deleteDoc(doc(db, 'patients', patientId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `patients/${patientId}`);
      }
    }
  };

  // Handlers for Health Post CRUD
  const handleSaveHealthPost = async (post: HealthPost) => {
    setHealthPosts((prev) => {
      const exists = prev.some((hp) => hp.id === post.id);
      if (exists) {
        return prev.map((hp) => (hp.id === post.id ? post : hp));
      }
      return [post, ...prev];
    });

    if (user) {
      try {
        await setDoc(doc(db, 'healthPosts', post.id), post);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `healthPosts/${post.id}`);
      }
    }
  };

  const handleDeleteHealthPost = async (postId: string) => {
    setHealthPosts((prev) => prev.filter((hp) => hp.id !== postId));

    if (user) {
      try {
        await deleteDoc(doc(db, 'healthPosts', postId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `healthPosts/${postId}`);
      }
    }
  };

  // Handlers for Territory CRUD
  const handleSaveProvince = async (province: Province) => {
    setProvinces((prev) => [province, ...prev]);

    if (user) {
      try {
        await setDoc(doc(db, 'provinces', province.id), province);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `provinces/${province.id}`);
      }
    }
  };

  const handleDeleteProvince = async (provinceId: string) => {
    setProvinces((prev) => prev.filter((p) => p.id !== provinceId));
    setLocalities((prev) => prev.filter((l) => l.provinceId !== provinceId));

    if (user) {
      try {
        await deleteDoc(doc(db, 'provinces', provinceId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `provinces/${provinceId}`);
      }
    }
  };

  const handleSaveLocality = async (locality: Locality) => {
    setLocalities((prev) => [locality, ...prev]);

    if (user) {
      try {
        await setDoc(doc(db, 'localities', locality.id), locality);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `localities/${locality.id}`);
      }
    }
  };

  const handleDeleteLocality = async (localityId: string) => {
    setLocalities((prev) => prev.filter((l) => l.id !== localityId));

    if (user) {
      try {
        await deleteDoc(doc(db, 'localities', localityId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `localities/${localityId}`);
      }
    }
  };

  // Open AI Advisor with Custom Context
  const handleOpenAiAdvisor = (promptText?: string, patientContext?: Patient | null) => {
    setAiAdvisorPrompt(promptText || '');
    setAiSelectedPatientContext(patientContext || null);
    setIsAiAdvisorOpen(true);
  };

  // Export full JSON Backup
  const handleExportFullBackup = () => {
    const backupData = {
      exportDate: new Date().toISOString(),
      provinces,
      localities,
      healthPosts,
      patients,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `boletim_epidemiologico_tb_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const activePatientsCount = patients.filter((p) => p.status === 'Em Tratamento').length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans antialiased flex flex-col selection:bg-rose-500 selection:text-white">
      {/* Top Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewPatient={() => {
          setEditingPatient(null);
          setIsPatientFormOpen(true);
        }}
        onOpenAiAdvisor={() => handleOpenAiAdvisor()}
        onExportData={handleExportFullBackup}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onResetMozambiqueData={handleResetMozambiqueData}
        totalActivePatientsCount={activePatientsCount}
      />

      {/* Cloud Authentication Banner (if unauthenticated) */}
      {!user && (
        <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 border-b border-rose-800/40 text-white px-4 py-2.5">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-2">
              <span className="p-1 rounded-md bg-rose-500/20 text-rose-300">
                <Lock className="w-3.5 h-3.5" />
              </span>
              <span>
                <strong>Modo de Acesso Rápido:</strong> Inicie sessão com <strong>E-mail e Palavra-passe</strong> para sincronizar e persistir casos em tempo real na base de dados <strong>Firebase Firestore</strong>.
              </span>
            </div>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-500 font-semibold rounded-lg text-white text-xs transition-colors shadow-sm shrink-0"
            >
              Iniciar Sessão / Registar
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            provinces={provinces}
            localities={localities}
            healthPosts={healthPosts}
            patients={patients}
            onNavigateToRiskZones={() => setActiveTab('risk-zones')}
            onNavigateToPatients={() => setActiveTab('patients')}
            onNavigateToHealthPosts={() => setActiveTab('health-posts')}
            onOpenNewPatient={() => {
              setEditingPatient(null);
              setIsPatientFormOpen(true);
            }}
            onOpenAiAdvisor={() => handleOpenAiAdvisor()}
          />
        )}

        {activeTab === 'patients' && (
          <PatientManager
            patients={patients}
            provinces={provinces}
            localities={localities}
            healthPosts={healthPosts}
            onAddPatientClick={() => {
              setEditingPatient(null);
              setIsPatientFormOpen(true);
            }}
            onSelectPatient={(patient) => setSelectedDetailPatient(patient)}
            onDeletePatient={handleDeletePatient}
            onOpenAiAdvisorForPatient={(patient) =>
              handleOpenAiAdvisor(`Gere uma análise técnica e recomendações para o caso de ${patient.name}.`, patient)
            }
          />
        )}

        {activeTab === 'predictive' && (
          <PredictiveRiskSection
            patients={patients}
            healthPosts={healthPosts}
            provinces={provinces}
            onSelectPatient={(patient) => setSelectedDetailPatient(patient)}
            onOpenAiAdvisorForPatient={(patient) =>
              handleOpenAiAdvisor(`Análise técnica avançada de risco para o paciente ${patient.name} (${patient.code}).`, patient)
            }
          />
        )}

        {activeTab === 'risk-zones' && (
          <RiskZoneAnalysis
            provinces={provinces}
            localities={localities}
            patients={patients}
            healthPosts={healthPosts}
            onOpenAiAdvisor={(prompt) => handleOpenAiAdvisor(prompt)}
            onNavigateToPatients={() => setActiveTab('patients')}
          />
        )}

        {activeTab === 'health-posts' && (
          <HealthPostManager
            healthPosts={healthPosts}
            provinces={provinces}
            localities={localities}
            patients={patients}
            onAddHealthPostClick={() => {
              setEditingHealthPost(null);
              setIsHealthPostFormOpen(true);
            }}
            onEditHealthPostClick={(post) => {
              setEditingHealthPost(post);
              setIsHealthPostFormOpen(true);
            }}
            onDeleteHealthPost={handleDeleteHealthPost}
          />
        )}

        {activeTab === 'territories' && (
          <TerritoryManager
            provinces={provinces}
            localities={localities}
            patients={patients}
            onOpenAddTerritoryModal={(mode) => {
              setTerritoryFormMode(mode);
              setIsTerritoryFormOpen(true);
            }}
            onDeleteProvince={handleDeleteProvince}
            onDeleteLocality={handleDeleteLocality}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-white">EpiGestão TB</span>
            <span>• Programa de Gestão de Tuberculose & Vigilância de Zonas de Risco</span>
          </div>
          <div className="flex items-center space-x-3 text-slate-400">
            <span className="flex items-center space-x-1">
              <Cloud className="w-3.5 h-3.5 text-emerald-400" />
              <span>Base de Dados Firestore</span>
            </span>
            <span>•</span>
            <span>MISAU Moçambique & OMS</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <PatientFormModal
        isOpen={isPatientFormOpen}
        onClose={() => setIsPatientFormOpen(false)}
        onSavePatient={handleSavePatient}
        provinces={provinces}
        localities={localities}
        healthPosts={healthPosts}
        initialData={editingPatient}
      />

      <PatientDetailModal
        patient={selectedDetailPatient}
        onClose={() => setSelectedDetailPatient(null)}
        provinces={provinces}
        localities={localities}
        healthPosts={healthPosts}
        onUpdatePatient={handleSavePatient}
        onOpenAiAdvisorForPatient={(patient) =>
          handleOpenAiAdvisor(`Análise técnica do caso do paciente ${patient.name} (${patient.code}).`, patient)
        }
      />

      <HealthPostFormModal
        isOpen={isHealthPostFormOpen}
        onClose={() => setIsHealthPostFormOpen(false)}
        onSaveHealthPost={handleSaveHealthPost}
        provinces={provinces}
        localities={localities}
        initialData={editingHealthPost}
      />

      <TerritoryFormModal
        isOpen={isTerritoryFormOpen}
        onClose={() => setIsTerritoryFormOpen(false)}
        onSaveProvince={handleSaveProvince}
        onSaveLocality={handleSaveLocality}
        provinces={provinces}
        mode={territoryFormMode}
      />

      <AiAdvisorModal
        isOpen={isAiAdvisorOpen}
        onClose={() => setIsAiAdvisorOpen(false)}
        provinces={provinces}
        localities={localities}
        patients={patients}
        healthPosts={healthPosts}
        initialPrompt={aiAdvisorPrompt}
        selectedPatientContext={aiSelectedPatientContext}
      />
    </div>
  );
}
