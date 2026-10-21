'use client';

import React, { useState } from 'react';
import { Patient, Province, Locality, HealthPost, Consultation, Exam } from '@/lib/tb-data';
import { calculatePatientPrediction } from '@/lib/predictive-model';
import {
  X,
  UserCheck,
  MapPin,
  Building2,
  Calendar,
  CheckCircle,
  FileText,
  Sparkles,
  Phone,
  Pill,
  User,
  Stethoscope,
  FlaskConical,
  Plus,
  Scale,
  TrendingUp,
  Activity,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  FileSpreadsheet,
  BrainCircuit,
  ShieldAlert,
  AlertTriangle,
  HeartPulse,
} from 'lucide-react';

interface PatientDetailModalProps {
  patient: Patient | null;
  onClose: () => void;
  provinces: Province[];
  localities: Locality[];
  healthPosts: HealthPost[];
  onUpdatePatient: (updatedPatient: Patient) => void;
  onOpenAiAdvisorForPatient: (patient: Patient) => void;
}

export default function PatientDetailModal({
  patient,
  onClose,
  provinces,
  localities,
  healthPosts,
  onUpdatePatient,
  onOpenAiAdvisorForPatient,
}: PatientDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'consultations' | 'exams' | 'predictive'>('overview');
  const [treatmentStatus, setTreatmentStatus] = useState(patient?.status || 'Em Tratamento');
  const [sputumResult, setSputumResult] = useState(patient?.sputumSmearResult || 'Pendente');
  const [dotsRecorded, setDotsRecorded] = useState(false);

  // Forms Visibility States
  const [showAddConsultation, setShowAddConsultation] = useState(false);
  const [showAddExam, setShowAddExam] = useState(false);

  // Consultation Form State
  const [consDate, setConsDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [consDoctor, setConsDoctor] = useState('');
  const [consWeight, setConsWeight] = useState('');
  const [consSymptoms, setConsSymptoms] = useState('');
  const [consNotes, setConsNotes] = useState('');
  const [consAdherence, setConsAdherence] = useState<Consultation['treatmentAdherence']>('Excelente (>95%)');
  const [consNextDate, setConsNextDate] = useState('');

  // Exam Form State
  const [examDate, setExamDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [examType, setExamType] = useState<Exam['type']>('Baciloscopia (BK)');
  const [examResult, setExamResult] = useState('');
  const [examLab, setExamLab] = useState('');
  const [examAttachment, setExamAttachment] = useState('');
  const [examNotes, setExamNotes] = useState('');

  if (!patient) return null;

  const province = provinces.find((p) => p.id === patient.provinceId);
  const locality = localities.find((l) => l.id === patient.localityId);
  const healthPost = healthPosts.find((hp) => hp.id === patient.healthPostId);

  const consultations = patient.consultations || [];
  const exams = patient.exams || [];

  const handleRecordDotsToma = () => {
    setDotsRecorded(true);
    const updated = {
      ...patient,
      dotsSupervised: true,
      notes: (patient.notes || '') + `\n[${new Date().toLocaleDateString()}] Toma diária de medicação DOTS confirmada presencialmente.`,
    };
    onUpdatePatient(updated);
  };

  const handleDeclareCure = () => {
    const updated: Patient = {
      ...patient,
      status: 'Curado',
      treatmentPhase: 'Concluído',
      sputumSmearResult: 'Negativo',
      notes: (patient.notes || '') + `\n[${new Date().toLocaleDateString()}] Paciente declarado CURADO com exames de controlo negativos.`,
    };
    onUpdatePatient(updated);
    setTreatmentStatus('Curado');
    setSputumResult('Negativo');
  };

  // Add Consultation Handler
  const handleSaveConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consDoctor.trim() || !consWeight) return;

    const newCons: Consultation = {
      id: `cons-${crypto.randomUUID()}`,
      patientId: patient.id,
      date: consDate,
      doctorOrNurse: consDoctor,
      weightKg: parseFloat(consWeight),
      symptoms: consSymptoms.trim() || 'Nenhum sintoma grave reportado',
      clinicalNotes: consNotes.trim() || 'Evolução clínica sem intercorrências.',
      treatmentAdherence: consAdherence,
      nextAppointmentDate: consNextDate || undefined,
    };

    const updatedConsultations = [newCons, ...consultations];
    const updatedPatient: Patient = {
      ...patient,
      consultations: updatedConsultations,
    };

    onUpdatePatient(updatedPatient);
    setShowAddConsultation(false);
    // Reset Form
    setConsDoctor('');
    setConsWeight('');
    setConsSymptoms('');
    setConsNotes('');
    setConsNextDate('');
  };

  // Add Exam Handler
  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examResult.trim() || !examLab.trim()) return;

    const newExamRecord: Exam = {
      id: `exam-${crypto.randomUUID()}`,
      patientId: patient.id,
      date: examDate,
      type: examType,
      result: examResult,
      laboratory: examLab,
      attachmentName: examAttachment.trim() || undefined,
      notes: examNotes.trim() || undefined,
    };

    const updatedExams = [newExamRecord, ...exams];
    let updatedSputumResult = patient.sputumSmearResult;

    if (
      examType === 'Baciloscopia (BK)' &&
      ['Positivo (+++)', 'Positivo (++)', 'Positivo (+)', 'Negativo', 'Pendente'].includes(examResult)
    ) {
      updatedSputumResult = examResult as any;
      setSputumResult(updatedSputumResult);
    }

    const updatedPatient: Patient = {
      ...patient,
      sputumSmearResult: updatedSputumResult,
      exams: updatedExams,
    };

    onUpdatePatient(updatedPatient);
    setShowAddExam(false);
    // Reset Form
    setExamResult('');
    setExamLab('');
    setExamAttachment('');
    setExamNotes('');
  };

  // Weight progress calculations
  const sortedConsultations = [...consultations].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const initialWeight = sortedConsultations[0]?.weightKg;
  const currentWeight = sortedConsultations[sortedConsultations.length - 1]?.weightKg;
  const weightDiff = initialWeight && currentWeight ? (currentWeight - initialWeight).toFixed(1) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center font-bold text-white text-base shadow">
              {patient.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-bold text-base text-white">{patient.name}</h2>
                <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-mono px-2 py-0.5 rounded">
                  {patient.code}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {patient.age} anos, {patient.gender} • Início do Processo: {patient.startDate}
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

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2 gap-2 text-xs font-semibold text-slate-600 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 px-3 border-b-2 flex items-center space-x-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-rose-600 text-rose-700 bg-white rounded-t-lg font-bold shadow-sm'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Ficha Geral</span>
          </button>

          <button
            onClick={() => setActiveTab('consultations')}
            className={`pb-2.5 px-3 border-b-2 flex items-center space-x-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'consultations'
                ? 'border-rose-600 text-rose-700 bg-white rounded-t-lg font-bold shadow-sm'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Histórico de Consultas</span>
            {consultations.length > 0 && (
              <span className="bg-rose-100 text-rose-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1">
                {consultations.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('exams')}
            className={`pb-2.5 px-3 border-b-2 flex items-center space-x-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'exams'
                ? 'border-rose-600 text-rose-700 bg-white rounded-t-lg font-bold shadow-sm'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            <span>Exames & Laboratório</span>
            {exams.length > 0 && (
              <span className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1">
                {exams.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('predictive')}
            className={`pb-2.5 px-3 border-b-2 flex items-center space-x-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'predictive'
                ? 'border-rose-600 text-rose-700 bg-white rounded-t-lg font-bold shadow-sm'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <BrainCircuit className="w-4 h-4 text-rose-600" />
            <span>Modelo Preditivo & Risco</span>
            <span className="bg-rose-100 text-rose-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1 uppercase">
              IA / PNCT
            </span>
          </button>
        </div>

        {/* Modal Body / Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 flex-1">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Status Badge Strip */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Estado Clínico
                  </span>
                  <span
                    className={`inline-block mt-1 font-bold text-xs px-2.5 py-1 rounded-full ${
                      patient.status === 'Curado'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : patient.status === 'Em Tratamento'
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {patient.status}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Classificação da TB
                  </span>
                  <span className="font-bold text-xs text-slate-900 block mt-1">
                    {patient.tbType}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Fase de Tratamento
                  </span>
                  <span className="font-semibold text-xs text-slate-800 block mt-1">
                    {patient.treatmentPhase}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Baciloscopia (BK)
                  </span>
                  <span className="font-bold text-xs text-rose-700 block mt-1">
                    {sputumResult}
                  </span>
                </div>
              </div>

              {/* Patient Location and Health Post */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1.5">
                  <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                    <MapPin className="w-4 h-4 text-rose-600" />
                    <span>Residência & Território</span>
                  </div>
                  <p className="text-slate-700 font-medium">{patient.address || 'Endereço não especificado'}</p>
                  <div className="text-[11px] text-slate-500">
                    Província: <strong className="text-slate-800">{province?.name}</strong> (Risco {province?.riskLevel})
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Localidade: <strong className="text-slate-800">{locality?.name}</strong>
                  </div>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1.5">
                  <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>Unidade Sanitária de Referência</span>
                  </div>
                  <p className="text-slate-800 font-bold">{healthPost?.name || 'Posto de Saúde Atribuído'}</p>
                  <p className="text-[11px] text-slate-500">Responsável: {healthPost?.technicalLead || 'Enfermeiro Chefe'}</p>
                  <p className="text-[11px] text-slate-500">Telefone: {healthPost?.phone || 'Não disponível'}</p>
                </div>
              </div>

              {/* Clinical Details */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1">
                  Informação Clínica e Rastreio de Contactos
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl">
                  <div>
                    <span className="text-slate-500 text-[10px] block font-semibold">Documento BI/NIF:</span>
                    <span className="font-mono text-slate-800 font-medium">{patient.identityDoc || 'Não registado'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block font-semibold">Contacto Telefónico:</span>
                    <span className="text-slate-800 font-medium">{patient.phone || 'Sem telefone'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block font-semibold">Supervisão DOTS:</span>
                    <span className="font-bold text-emerald-700">{patient.dotsSupervised ? 'Activa' : 'Pendente'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block font-semibold">Contactos Familiares:</span>
                    <span className="font-bold text-slate-800">{patient.contactTracingCount} pessoas elegíveis para rastreio</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 text-[10px] block font-semibold">Comorbilidades Associadas:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {patient.comorbidities && patient.comorbidities.length > 0 ? (
                        patient.comorbidities.map((c) => (
                          <span key={c} className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded text-[10px]">
                            {c}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400">Nenhuma comorbilidade declarada</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {patient.notes && (
                <div className="space-y-1">
                  <span className="font-bold text-slate-900 text-xs block">Histórico de Notas Clínicas:</span>
                  <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl text-[11px] text-amber-950 whitespace-pre-wrap">
                    {patient.notes}
                  </div>
                </div>
              )}

              {/* Quick Actions Panel */}
              <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3">
                <h4 className="font-bold text-xs text-rose-300 flex items-center space-x-1.5">
                  <Pill className="w-4 h-4 text-rose-400" />
                  <span>Ações Rápidas de Acompanhamento</span>
                </h4>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleRecordDotsToma}
                    disabled={dotsRecorded}
                    className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
                      dotsRecorded
                        ? 'bg-emerald-800 text-emerald-200 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{dotsRecorded ? 'Toma DOTS Registada Hoje' : 'Registar Toma DOTS Hoje'}</span>
                  </button>

                  {patient.status !== 'Curado' && (
                    <button
                      onClick={handleDeclareCure}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow transition-all"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Declarar Cura Médica</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      onClose();
                      onOpenAiAdvisorForPatient(patient);
                    }}
                    className="px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Consultar Assistente AI sobre Caso</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONSULTATIONS HISTORY */}
          {activeTab === 'consultations' && (
            <div className="space-y-6">
              {/* Summary Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-rose-50/70 border border-rose-200/80 rounded-xl space-y-1">
                  <span className="text-[10px] text-rose-700 font-bold uppercase tracking-wider block">
                    Total Consultas
                  </span>
                  <span className="text-lg font-black text-rose-950">{consultations.length}</span>
                </div>

                <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-1">
                  <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">
                    Peso Actual
                  </span>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-lg font-black text-emerald-950">
                      {currentWeight ? `${currentWeight} kg` : 'N/D'}
                    </span>
                    {weightDiff && (
                      <span className={`text-[10px] font-bold ${Number(weightDiff) >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                        ({Number(weightDiff) >= 0 ? `+${weightDiff}` : weightDiff} kg)
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl space-y-1">
                  <span className="text-[10px] text-blue-700 font-bold uppercase tracking-wider block">
                    Adesão Recente
                  </span>
                  <span className="text-xs font-bold text-blue-950 block">
                    {consultations[0]?.treatmentAdherence || 'N/A'}
                  </span>
                </div>

                <div className="p-3 bg-purple-50/70 border border-purple-200/80 rounded-xl space-y-1">
                  <span className="text-[10px] text-purple-700 font-bold uppercase tracking-wider block">
                    Próxima Consulta
                  </span>
                  <span className="text-xs font-bold text-purple-950 block">
                    {consultations[0]?.nextAppointmentDate || 'Não agendada'}
                  </span>
                </div>
              </div>

              {/* Header Action Row */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-1.5">
                    <Stethoscope className="w-4 h-4 text-rose-600" />
                    <span>Registro de Evolução Clínica</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Histórico cronológico das consultas de acompanhamento médico e de enfermagem
                  </p>
                </div>

                <button
                  onClick={() => setShowAddConsultation(!showAddConsultation)}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs flex items-center space-x-1 shadow transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showAddConsultation ? 'Cancelar' : 'Registar Consulta'}</span>
                </button>
              </div>

              {/* Add Consultation Form */}
              {showAddConsultation && (
                <form
                  onSubmit={handleSaveConsultation}
                  className="bg-slate-900 text-white p-4 rounded-xl space-y-3 border border-slate-800 shadow-xl"
                >
                  <div className="font-bold text-xs text-rose-300 flex items-center space-x-1.5 border-b border-slate-800 pb-2">
                    <Activity className="w-4 h-4 text-rose-400" />
                    <span>Nova Evolução Clínica de Paciente</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                        Data da Consulta
                      </label>
                      <input
                        type="date"
                        required
                        value={consDate}
                        onChange={(e) => setConsDate(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-rose-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                        Médico / Enfermeiro Responsável
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Dra. Maria Esperança"
                        value={consDoctor}
                        onChange={(e) => setConsDoctor(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-rose-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                        Peso Medido (kg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        placeholder="Ex: 59.5"
                        value={consWeight}
                        onChange={(e) => setConsWeight(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-rose-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                        Grau de Adesão Terapêutica
                      </label>
                      <select
                        value={consAdherence}
                        onChange={(e) => setConsAdherence(e.target.value as any)}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-rose-500 outline-none"
                      >
                        <option value="Excelente (>95%)">Excelente (&gt;95%)</option>
                        <option value="Regular (80-95%)">Regular (80-95%)</option>
                        <option value="Irregular (<80%)">Irregular (&lt;80%)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                        Data da Próxima Consulta
                      </label>
                      <input
                        type="date"
                        value={consNextDate}
                        onChange={(e) => setConsNextDate(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-rose-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                      Sintomas Relatados no Acompanhamento
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Tosse residual, sem febre, melhora no apetite"
                      value={consSymptoms}
                      onChange={(e) => setConsSymptoms(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-rose-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                      Notas Clínicas de Evolução
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Resumo da avaliação médica, tolerabilidade aos tuberculostáticos, exames solicitados..."
                      value={consNotes}
                      onChange={(e) => setConsNotes(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-rose-500 outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddConsultation(false)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs shadow"
                    >
                      Gravar Consulta
                    </button>
                  </div>
                </form>
              )}

              {/* Consultation List */}
              <div className="space-y-3">
                {consultations.length === 0 ? (
                  <div className="text-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-300 space-y-2">
                    <Stethoscope className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="font-bold text-slate-700">Sem histórico de consultas registado</p>
                    <p className="text-slate-500 text-[11px]">
                      Clique no botão &quot;Registar Consulta&quot; acima para inserir a primeira consulta de acompanhamento deste paciente.
                    </p>
                  </div>
                ) : (
                  consultations.map((c, index) => (
                    <div
                      key={c.id}
                      className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-2.5 hover:border-slate-300 transition-all"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                        <div className="flex items-center space-x-2">
                          <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded text-[10px] flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{c.date}</span>
                          </span>
                          <span className="font-bold text-slate-900">{c.doctorOrNurse}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded text-[10px] flex items-center space-x-1">
                            <Scale className="w-3 h-3 text-slate-600" />
                            <span>{c.weightKg} kg</span>
                          </span>

                          <span
                            className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                              c.treatmentAdherence.includes('Excelente')
                                ? 'bg-emerald-100 text-emerald-800'
                                : c.treatmentAdherence.includes('Regular')
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            Adesão: {c.treatmentAdherence}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          Sintomas Relatados:
                        </span>
                        <p className="text-slate-800 font-medium">{c.symptoms}</p>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                          Evolução & Notas Médicas:
                        </span>
                        <p className="text-slate-700 whitespace-pre-wrap">{c.clinicalNotes}</p>
                      </div>

                      {c.nextAppointmentDate && (
                        <div className="text-[11px] text-purple-700 font-semibold flex items-center space-x-1 pt-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Próxima Consulta Agendada para: <strong>{c.nextAppointmentDate}</strong></span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: EXAMS */}
          {activeTab === 'exams' && (
            <div className="space-y-6">
              {/* Summary Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl space-y-1">
                  <span className="text-[10px] text-blue-700 font-bold uppercase tracking-wider block">
                    Total Exames Registados
                  </span>
                  <span className="text-lg font-black text-blue-950">{exams.length}</span>
                </div>

                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-1">
                  <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider block">
                    Baciloscopia (BK) Actual
                  </span>
                  <span className="text-sm font-bold text-amber-950 block">
                    {patient.sputumSmearResult}
                  </span>
                </div>

                <div className="p-3 bg-purple-50/70 border border-purple-200/80 rounded-xl space-y-1 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-purple-700 font-bold uppercase tracking-wider block">
                    Último Exame
                  </span>
                  <span className="text-xs font-bold text-purple-950 block">
                    {exams[0] ? `${exams[0].type} (${exams[0].date})` : 'Nenhum'}
                  </span>
                </div>
              </div>

              {/* Header Action Row */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-1.5">
                    <FlaskConical className="w-4 h-4 text-blue-600" />
                    <span>Exames Laboratoriais e de Imagem</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Baciloscopias, teste GeneXpert, Radiografias (RX) e análises sanguíneas
                  </p>
                </div>

                <button
                  onClick={() => setShowAddExam(!showAddExam)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs flex items-center space-x-1 shadow transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showAddExam ? 'Cancelar' : 'Registar Exame'}</span>
                </button>
              </div>

              {/* Add Exam Form */}
              {showAddExam && (
                <form
                  onSubmit={handleSaveExam}
                  className="bg-slate-900 text-white p-4 rounded-xl space-y-3 border border-slate-800 shadow-xl"
                >
                  <div className="font-bold text-xs text-blue-300 flex items-center space-x-1.5 border-b border-slate-800 pb-2">
                    <FlaskConical className="w-4 h-4 text-blue-400" />
                    <span>Registar Novo Exame Clínico</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                        Data de Realização
                      </label>
                      <input
                        type="date"
                        required
                        value={examDate}
                        onChange={(e) => setExamDate(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                        Tipo de Exame
                      </label>
                      <select
                        value={examType}
                        onChange={(e) => setExamType(e.target.value as any)}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="Baciloscopia (BK)">Baciloscopia (BK)</option>
                        <option value="GeneXpert MTB/RIF">GeneXpert MTB/RIF</option>
                        <option value="Raio-X de Tórax (RX)">Raio-X de Tórax (RX)</option>
                        <option value="Cultura / Antibiograma">Cultura / Antibiograma</option>
                        <option value="Hemograma / Bioquímica">Hemograma / Bioquímica</option>
                        <option value="Teste HIV">Teste HIV</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                        Laboratório / Hospital
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Lab. CS de Bagamoyo / HGM"
                        value={examLab}
                        onChange={(e) => setExamLab(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                        Resultado do Exame
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Negativo, Positivo (+++), Sem resistência à Rifampicina"
                        value={examResult}
                        onChange={(e) => setExamResult(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                        Nome do Ficheiro Anexo (Opcional)
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: laudo_bk_2mes.pdf"
                        value={examAttachment}
                        onChange={(e) => setExamAttachment(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                      Observações Clínicas e Laudo
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Detalhes relevantes do resultado de imagem ou laboratorial..."
                      value={examNotes}
                      onChange={(e) => setExamNotes(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddExam(false)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs shadow"
                    >
                      Gravar Exame
                    </button>
                  </div>
                </form>
              )}

              {/* Exam List */}
              <div className="space-y-3">
                {exams.length === 0 ? (
                  <div className="text-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-300 space-y-2">
                    <FlaskConical className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="font-bold text-slate-700">Nenhum exame registado</p>
                    <p className="text-slate-500 text-[11px]">
                      Clique no botão &quot;Registar Exame&quot; acima para adicionar laudos de laboratório ou exames de imagem.
                    </p>
                  </div>
                ) : (
                  exams.map((exam) => (
                    <div
                      key={exam.id}
                      className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-2 hover:border-slate-300 transition-all"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                        <div className="flex items-center space-x-2">
                          <span className="bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded text-[10px]">
                            {exam.type}
                          </span>
                          <span className="text-slate-500 text-[11px] font-medium">{exam.date}</span>
                        </div>

                        <span className="text-slate-500 text-[11px]">
                          Lab: <strong className="text-slate-800">{exam.laboratory}</strong>
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                            Resultado:
                          </span>
                          <span
                            className={`font-bold text-xs inline-block mt-0.5 ${
                              exam.result.includes('Negativo') || exam.result.includes('Sem Resistência')
                                ? 'text-emerald-700'
                                : exam.result.includes('Positivo') || exam.result.includes('Resistência DETETADA')
                                ? 'text-rose-700'
                                : 'text-slate-900'
                            }`}
                          >
                            {exam.result}
                          </span>
                        </div>

                        {exam.attachmentName && (
                          <div className="flex items-center space-x-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 text-[10px] font-semibold">
                            <Paperclip className="w-3 h-3 text-slate-500" />
                            <span>{exam.attachmentName}</span>
                          </div>
                        )}
                      </div>

                      {exam.notes && (
                        <p className="text-slate-600 text-[11px] bg-slate-50 p-2 rounded border border-slate-100 italic">
                          &quot;{exam.notes}&quot;
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: PREDICTIVE MODEL & RISK ESTIMATION */}
          {activeTab === 'predictive' && (() => {
            const pred = calculatePatientPrediction(patient, healthPost);
            return (
              <div className="space-y-5">
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 rounded-xl shadow-sm flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <BrainCircuit className="w-5 h-5 text-rose-400" />
                      <h3 className="font-bold text-sm text-white">Modelo Preditivo Epidemiológico de Sucesso</h3>
                    </div>
                    <p className="text-xs text-slate-300">
                      Análise automatizada de dados históricos, comorbilidades e adesão terapêutica
                    </p>
                  </div>

                  <button
                    onClick={() => onOpenAiAdvisorForPatient(patient)}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors shadow"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Análise Profunda com Assistente IA</span>
                  </button>
                </div>

                {/* Gauges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Probability of Success */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Probabilidade Estimada de Cura</span>
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-3xl font-extrabold text-slate-900">
                        {pred.successProbability}%
                      </span>
                      <span className="text-xs font-semibold text-emerald-600">
                        {pred.successProbability >= 80
                          ? 'Excelente'
                          : pred.successProbability >= 65
                          ? 'Satisfatório'
                          : 'Atenção Necessária'}
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          pred.successProbability >= 80
                            ? 'bg-emerald-500'
                            : pred.successProbability >= 65
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${pred.successProbability}%` }}
                      />
                    </div>
                  </div>

                  {/* Risk Score */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Pontuação de Risco Clínico</span>
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                    </div>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-3xl font-extrabold text-rose-700">
                        {pred.riskScore}
                      </span>
                      <span className="text-xs text-slate-400">/ 100</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto ${
                          pred.priorityLevel === 'Crítica (Alta Prioridade)'
                            ? 'bg-rose-100 text-rose-800'
                            : pred.priorityLevel === 'Moderada'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {pred.priorityLevel}
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-600 rounded-full transition-all duration-500"
                        style={{ width: `${pred.riskScore}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Risk Factors Breakdown */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                  <h4 className="font-bold text-xs text-slate-900 flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Factores de Risco Identificados ({pred.riskFactors.length})</span>
                  </h4>

                  <div className="space-y-2">
                    {pred.riskFactors.map((rf, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-rose-50/70 border border-rose-100 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-rose-950">{rf.factor}</span>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                              rf.impact === 'Crítico'
                                ? 'bg-rose-600 text-white'
                                : rf.impact === 'Alto'
                                ? 'bg-rose-200 text-rose-900'
                                : 'bg-amber-200 text-amber-900'
                            }`}
                          >
                            Impacto {rf.impact}
                          </span>
                        </div>
                        <p className="text-[11px] text-rose-900/80">{rf.description}</p>
                      </div>
                    ))}

                    {pred.riskFactors.length === 0 && (
                      <div className="text-xs text-slate-500 p-2">
                        Nenhum factor de risco grave detectado neste momento.
                      </div>
                    )}
                  </div>
                </div>

                {/* Protective Factors */}
                {pred.protectiveFactors.length > 0 && (
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                    <h4 className="font-bold text-xs text-slate-900 flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Factores Protetores e Elementos Favoráveis ({pred.protectiveFactors.length})</span>
                    </h4>

                    <div className="space-y-2">
                      {pred.protectiveFactors.map((pf, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-100 text-xs">
                          <div className="font-bold text-emerald-950">{pf.factor}</div>
                          <div className="text-[11px] text-emerald-800">{pf.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommended Interventions Checklist */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                  <h4 className="font-bold text-xs text-slate-900 flex items-center space-x-2">
                    <HeartPulse className="w-4 h-4 text-rose-600" />
                    <span>Recomendações e Intervenções Prioritárias Recomendadas</span>
                  </h4>

                  <div className="space-y-2">
                    {pred.recommendedInterventions.map((action, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-start space-x-2">
                        <span className="bg-rose-600 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-slate-800 font-medium">{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Ficha clínica sincronizada com a base de dados de Tuberculose
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white font-semibold rounded-xl text-xs hover:bg-slate-700 shadow-sm"
          >
            Fechar Ficha
          </button>
        </div>
      </div>
    </div>
  );
}
