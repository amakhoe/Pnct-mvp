'use client';

import React, { useState } from 'react';
import { X, Lock, Mail, User, Shield, CheckCircle2, AlertTriangle, KeyRound, Loader2, Info } from 'lucide-react';
import { useAuth, UserProfile } from '@/context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login, register, resetPassword, authError, clearAuthError } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<UserProfile['role']>('tecnico_tb');
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSwitchMode = (newMode: 'login' | 'register' | 'reset') => {
    setMode(newMode);
    clearAuthError();
    setResetSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResetSuccess(false);

    try {
      if (mode === 'login') {
        await login(email, password);
        onClose();
      } else if (mode === 'register') {
        await register(email, password, displayName, role);
        onClose();
      } else if (mode === 'reset') {
        await resetPassword(email);
        setResetSuccess(true);
      }
    } catch {
      // Handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl w-full max-w-md overflow-hidden transition-all">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white p-5 flex items-center justify-between border-b border-rose-900/40 relative">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-300">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">
                {mode === 'login' && 'Autenticação no Sistema'}
                {mode === 'register' && 'Registar Novo Profissional'}
                {mode === 'reset' && 'Recuperar Palavra-passe'}
              </h2>
              <p className="text-[11px] text-slate-300">
                Programa Nacional de Controlo da Tuberculose (PNCT/MISAU)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            type="button"
            onClick={() => handleSwitchMode('login')}
            className={`flex-1 py-3 text-center transition-colors border-b-2 ${
              mode === 'login'
                ? 'border-rose-600 text-rose-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Iniciar Sessão
          </button>
          <button
            type="button"
            onClick={() => handleSwitchMode('register')}
            className={`flex-1 py-3 text-center transition-colors border-b-2 ${
              mode === 'register'
                ? 'border-rose-600 text-rose-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Criar Conta
          </button>
          <button
            type="button"
            onClick={() => handleSwitchMode('reset')}
            className={`flex-1 py-3 text-center transition-colors border-b-2 ${
              mode === 'reset'
                ? 'border-rose-600 text-rose-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Recuperar
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {authError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3.5 py-2.5 rounded-xl flex items-start space-x-2 text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{authError}</div>
            </div>
          )}

          {resetSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-2.5 rounded-xl flex items-start space-x-2 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">
                Um e-mail de recuperação foi enviado para <strong>{email}</strong>. Siga as instruções para redefinir a sua palavra-passe.
              </div>
            </div>
          )}

          {/* Registration fields */}
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nome Completo do Profissional *</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Ex: Dra. Esperança Bila"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Categoria / Função Clínica *</label>
                <div className="relative">
                  <Shield className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white font-medium"
                  >
                    <option value="tecnico_tb">Técnico de Vigilância TB</option>
                    <option value="medico">Médico Clínico</option>
                    <option value="enfermeiro">Enfermeiro DOTS / Cuidados</option>
                    <option value="administrador">Gestor Provincial / Administrador</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Email input */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Endereço de E-mail *</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="medico@saude.gov.mz"
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Password input */}
          {mode !== 'reset' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-700 font-semibold">Palavra-passe *</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('reset')}
                    className="text-[11px] text-rose-600 hover:underline font-medium"
                  >
                    Esqueceu-se?
                  </button>
                )}
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 disabled:bg-rose-400 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 text-xs"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>A processar...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>
                  {mode === 'login' && 'Entrar no Sistema'}
                  {mode === 'register' && 'Criar Conta de Profissional'}
                  {mode === 'reset' && 'Enviar E-mail de Recuperação'}
                </span>
              </>
            )}
          </button>

          {/* Informational Firebase box */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1">
            <div className="flex items-center space-x-1.5 font-semibold text-slate-800">
              <Info className="w-3.5 h-3.5 text-blue-600" />
              <span>Base de Dados & Autenticação Firebase</span>
            </div>
            <p className="leading-relaxed">
              Autenticação nativa com encriptação e regras de segurança na base de dados Firestore (MISAU Moçambique).
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
