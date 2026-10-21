'use client';

import React from 'react';
import {
  Activity,
  Users,
  Building2,
  MapPin,
  ShieldAlert,
  Sparkles,
  Plus,
  FileSpreadsheet,
  BrainCircuit,
  Lock,
  LogOut,
  UserCheck,
  Cloud,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface NavbarProps {
  activeTab: 'dashboard' | 'patients' | 'predictive' | 'health-posts' | 'territories' | 'risk-zones';
  setActiveTab: (tab: 'dashboard' | 'patients' | 'predictive' | 'health-posts' | 'territories' | 'risk-zones') => void;
  onOpenNewPatient: () => void;
  onOpenAiAdvisor: () => void;
  onExportData: () => void;
  onOpenAuthModal: () => void;
  onResetMozambiqueData?: () => void;
  totalActivePatientsCount: number;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenNewPatient,
  onOpenAiAdvisor,
  onExportData,
  onOpenAuthModal,
  onResetMozambiqueData,
  totalActivePatientsCount,
}: NavbarProps) {
  const { user, profile, logout, isFirebaseConnected } = useAuth();

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'medico':
        return 'Médico';
      case 'enfermeiro':
        return 'Enfermeiro';
      case 'administrador':
        return 'Administrador';
      default:
        return 'Técnico TB';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-red-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-900/30">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-white tracking-tight">EpiGestão</span>
                <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">
                  TB Moçambique / PNCT
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Vigilância Epidemiológica & Gestão de Tuberculose
              </p>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800/80">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Painel Geral</span>
            </button>

            <button
              onClick={() => setActiveTab('patients')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'patients'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Pacientes</span>
              {totalActivePatientsCount > 0 && (
                <span className="ml-1 bg-slate-800 text-rose-300 text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-rose-500/30">
                  {totalActivePatientsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('predictive')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'predictive'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BrainCircuit className="w-4 h-4 text-rose-400" />
              <span>Modelo Preditivo</span>
            </button>

            <button
              onClick={() => setActiveTab('risk-zones')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'risk-zones'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Análise de Zonas</span>
            </button>

            <button
              onClick={() => setActiveTab('health-posts')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'health-posts'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Postos de Saúde</span>
            </button>

            <button
              onClick={() => setActiveTab('territories')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'territories'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Territórios</span>
            </button>
          </nav>

          {/* Action Buttons & Auth */}
          <div className="flex items-center space-x-2">
            {/* Cloud Status Pill */}
            <div
              className={`hidden xl:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                isFirebaseConnected
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/70'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title={isFirebaseConnected ? 'Base de dados Firebase Firestore Conectada' : 'A ligar à Firebase...'}
            >
              <Cloud className={`w-3.5 h-3.5 ${isFirebaseConnected ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
              <span>{isFirebaseConnected ? 'Firebase Ativo' : 'Offline'}</span>
            </div>

            <button
              onClick={onOpenAiAdvisor}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md transition-all border border-indigo-400/30"
              title="Assistente Epidemiológico com Inteligência Artificial"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span className="hidden sm:inline">Assistente AI</span>
            </button>

            <button
              onClick={onOpenNewPatient}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Novo Paciente</span>
            </button>

            <button
              onClick={onExportData}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              title="Exportar Relatório em JSON"
            >
              <FileSpreadsheet className="w-4 h-4" />
            </button>

            {onResetMozambiqueData && (
              <button
                onClick={onResetMozambiqueData}
                className="hidden lg:flex items-center space-x-1 px-2 py-1.5 rounded-lg text-[11px] font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition-all border border-slate-700"
                title="Restaurar Base de Dados Oficial de Moçambique (MISAU / PNCT)"
              >
                <span>🇲🇿 Moçambique</span>
              </button>
            )}

            {/* Authentication Button & User Chip */}
            {user ? (
              <div className="flex items-center space-x-2 pl-1 border-l border-slate-800">
                <div
                  onClick={onOpenAuthModal}
                  className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-xs cursor-pointer transition-colors"
                  title={`Sessão iniciada como: ${user.email}`}
                >
                  <div className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-bold">
                    {profile?.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="font-semibold text-white leading-tight truncate max-w-[110px] text-[11px]">
                      {profile?.displayName || user.email?.split('@')[0]}
                    </p>
                    <p className="text-[9px] text-rose-300 leading-none">
                      {getRoleLabel(profile?.role)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => logout()}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  title="Terminar Sessão"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all border border-emerald-400/40"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Entrar</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Tabs Bar */}
        <div className="md:hidden flex items-center justify-between py-2 border-t border-slate-800 overflow-x-auto space-x-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap font-medium ${
              activeTab === 'dashboard' ? 'bg-rose-600 text-white' : 'text-slate-300'
            }`}
          >
            Painel Geral
          </button>
          <button
            onClick={() => setActiveTab('patients')}
            className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap font-medium ${
              activeTab === 'patients' ? 'bg-rose-600 text-white' : 'text-slate-300'
            }`}
          >
            Pacientes ({totalActivePatientsCount})
          </button>
          <button
            onClick={() => setActiveTab('predictive')}
            className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap font-medium ${
              activeTab === 'predictive' ? 'bg-rose-600 text-white' : 'text-slate-300'
            }`}
          >
            Preditivo
          </button>
          <button
            onClick={() => setActiveTab('risk-zones')}
            className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap font-medium ${
              activeTab === 'risk-zones' ? 'bg-rose-600 text-white' : 'text-slate-300'
            }`}
          >
            Zonas
          </button>
          <button
            onClick={() => setActiveTab('health-posts')}
            className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap font-medium ${
              activeTab === 'health-posts' ? 'bg-rose-600 text-white' : 'text-slate-300'
            }`}
          >
            Postos
          </button>
          <button
            onClick={() => setActiveTab('territories')}
            className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap font-medium ${
              activeTab === 'territories' ? 'bg-rose-600 text-white' : 'text-slate-300'
            }`}
          >
            Territórios
          </button>
          {!user && (
            <button
              onClick={onOpenAuthModal}
              className="px-2.5 py-1 rounded-md text-xs whitespace-nowrap font-bold bg-emerald-600 text-white"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
