'use client';

import React, { useState } from 'react';
import { Patient, HealthPost, Province } from '@/lib/tb-data';
import {
  calculatePatientPrediction,
  getPredictivePrioritizedPatients,
  PredictiveAnalysis,
} from '@/lib/predictive-model';
import {
  TrendingUp,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  Filter,
  UserCheck,
  Building2,
  Phone,
  ChevronRight,
  BrainCircuit,
  Info,
  Layers,
  HeartPulse,
} from 'lucide-react';

interface PredictiveRiskSectionProps {
  patients: Patient[];
  healthPosts: HealthPost[];
  provinces: Province[];
  onSelectPatient: (patient: Patient) => void;
  onOpenAiAdvisorForPatient: (patient: Patient) => void;
}

export default function PredictiveRiskSection({
  patients,
  healthPosts,
  onSelectPatient,
  onOpenAiAdvisorForPatient,
}: PredictiveRiskSectionProps) {
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [selectedPatientForDetail, setSelectedPatientForDetail] = useState<Patient | null>(null);

  // Compute predictive analysis for all patients
  const prioritized = getPredictivePrioritizedPatients(patients, healthPosts);

  const activePatientsCount = patients.filter((p) => p.status === 'Em Tratamento' || p.status === 'Suspeito').length;

  const highRiskCount = prioritized.filter((p) => p.analysis.priorityLevel === 'Crítica (Alta Prioridade)').length;
  const mediumRiskCount = prioritized.filter((p) => p.analysis.priorityLevel === 'Moderada').length;
  const lowRiskCount = prioritized.filter((p) => p.analysis.priorityLevel === 'Baixa').length;

  const avgPredictedSuccess = Math.round(
    prioritized.reduce((sum, item) => sum + item.analysis.successProbability, 0) / (prioritized.length || 1)
  );

  // Filter list
  const filteredItems = prioritized.filter((item) => {
    if (priorityFilter === 'high') return item.analysis.priorityLevel === 'Crítica (Alta Prioridade)';
    if (priorityFilter === 'medium') return item.analysis.priorityLevel === 'Moderada';
    if (priorityFilter === 'low') return item.analysis.priorityLevel === 'Baixa';
    return true;
  });

  const activeAnalysis = selectedPatientForDetail
    ? calculatePatientPrediction(
        selectedPatientForDetail,
        healthPosts.find((hp) => hp.id === selectedPatientForDetail.healthPostId)
      )
    : filteredItems[0]?.analysis || null;

  const activePatientObj = selectedPatientForDetail || filteredItems[0]?.patient || null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
      {/* SECTION HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-br from-rose-500 to-indigo-600 text-white rounded-xl shadow-sm">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <span>Modelo Preditivo Epidemiológico & Estimativa de Risco</span>
                <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Algoritmo PNCT
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Análise preditiva automatizada para priorização de intervenções e estimativa da probabilidade de cura individual.
              </p>
            </div>
          </div>
        </div>

        {/* Global Summary Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5 text-right">
            <span className="text-[10px] font-semibold text-slate-500 block">Previsão Média de Sucesso</span>
            <span className="text-sm font-extrabold text-emerald-600">{avgPredictedSuccess}%</span>
          </div>

          <div className="bg-rose-50 border border-rose-200/80 rounded-xl px-3 py-1.5 text-right">
            <span className="text-[10px] font-semibold text-rose-700 block">Casos de Prioridade Crítica</span>
            <span className="text-sm font-extrabold text-rose-700">{highRiskCount}</span>
          </div>
        </div>
      </div>

      {/* OVERVIEW STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div
          onClick={() => setPriorityFilter('all')}
          className={`cursor-pointer p-3.5 rounded-xl border transition-all ${
            priorityFilter === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
              : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100 text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium opacity-80">Total em Triagem</span>
            <Layers className="w-4 h-4 opacity-70" />
          </div>
          <div className="text-xl font-bold mt-1">{prioritized.length}</div>
          <div className="text-[10px] opacity-70 mt-0.5">{activePatientsCount} casos sob monitorização</div>
        </div>

        <div
          onClick={() => setPriorityFilter('high')}
          className={`cursor-pointer p-3.5 rounded-xl border transition-all ${
            priorityFilter === 'high'
              ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
              : 'bg-rose-50 border-rose-200 hover:bg-rose-100/80 text-rose-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider">Alta Prioridade</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl font-bold mt-1">{highRiskCount}</div>
          <div className="text-[10px] opacity-80 mt-0.5">Pontuação de Risco &ge; 50 / 100</div>
        </div>

        <div
          onClick={() => setPriorityFilter('medium')}
          className={`cursor-pointer p-3.5 rounded-xl border transition-all ${
            priorityFilter === 'medium'
              ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
              : 'bg-amber-50 border-amber-200 hover:bg-amber-100/80 text-amber-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider">Prioridade Moderada</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold mt-1">{mediumRiskCount}</div>
          <div className="text-[10px] opacity-80 mt-0.5">Pontuação de Risco 25 - 49</div>
        </div>

        <div
          onClick={() => setPriorityFilter('low')}
          className={`cursor-pointer p-3.5 rounded-xl border transition-all ${
            priorityFilter === 'low'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
              : 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100/80 text-emerald-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider">Baixo Risco</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold mt-1">{lowRiskCount}</div>
          <div className="text-[10px] opacity-80 mt-0.5">Probabilidade de cura &ge; 80%</div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN PREDICTIVE BOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: PRIORITIZED PATIENT QUEUE (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 px-1">
            <span>Fila de Pacientes Ordenada por Risco</span>
            <span className="text-[10px] text-slate-400 font-mono">{filteredItems.length} paciente(s)</span>
          </div>

          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {filteredItems.map(({ patient, analysis }) => {
              const hp = healthPosts.find((h) => h.id === patient.healthPostId);
              const isSelected = activePatientObj?.id === patient.id;

              const isHighPriority = analysis.priorityLevel === 'Crítica (Alta Prioridade)';
              const isMediumPriority = analysis.priorityLevel === 'Moderada';

              return (
                <div
                  key={patient.id}
                  onClick={() => setSelectedPatientForDetail(patient)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer text-xs space-y-2 ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/20'
                      : isHighPriority
                      ? 'bg-rose-50/50 border-rose-200 hover:border-rose-300 text-slate-800'
                      : 'bg-slate-50/80 border-slate-200/80 hover:border-slate-300 text-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-sm flex items-center space-x-1.5">
                        <span className={isSelected ? 'text-white' : 'text-slate-900'}>{patient.name}</span>
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                            isSelected
                              ? 'bg-slate-800 text-rose-300'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {patient.code}
                        </span>
                      </div>
                      <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                        {patient.tbType} • {hp?.name || 'Unidade Sanitária'}
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                          isHighPriority
                            ? 'bg-rose-600 text-white'
                            : isMediumPriority
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {analysis.successProbability}% Cura
                      </span>
                      <div className={`text-[9px] font-semibold mt-1 ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                        Risco: {analysis.riskScore}/100
                      </div>
                    </div>
                  </div>

                  {/* Progress bar of probability */}
                  <div className="w-full bg-slate-200/60 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        analysis.successProbability < 65
                          ? 'bg-rose-500'
                          : analysis.successProbability < 80
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${analysis.successProbability}%` }}
                    />
                  </div>

                  {/* Top risk factor snippet */}
                  {analysis.riskFactors.length > 0 && (
                    <div
                      className={`text-[10px] flex items-center space-x-1 ${
                        isSelected ? 'text-rose-300' : 'text-rose-700'
                      }`}
                    >
                      <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{analysis.riskFactors[0].factor}</span>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredItems.length === 0 && (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs">
                Nenhum paciente encontrado para este filtro de prioridade.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: DETAILED PREDICTIVE DASHBOARD FOR SELECTED PATIENT (7 cols) */}
        <div className="lg:col-span-7 bg-slate-50 rounded-xl border border-slate-200/80 p-5 space-y-5">
          {activePatientObj && activeAnalysis ? (
            <div className="space-y-5">
              {/* Patient Banner */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-600 text-white font-bold flex items-center justify-center text-sm">
                    {activePatientObj.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                      <span>{activePatientObj.name}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-semibold border border-slate-200">
                        {activePatientObj.code}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {activePatientObj.age} anos, {activePatientObj.gender} • {activePatientObj.tbType}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onSelectPatient(activePatientObj)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors"
                  >
                    <span>Abrir Ficha</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onOpenAiAdvisorForPatient(activePatientObj)}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Assistente IA</span>
                  </button>
                </div>
              </div>

              {/* Predictive Indicators Header Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Success Probability Gauge */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Estimativa de Probabilidade de Cura</span>
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-extrabold text-slate-900">
                      {activeAnalysis.successProbability}%
                    </span>
                    <span className="text-xs font-semibold text-emerald-600">
                      {activeAnalysis.successProbability >= 80
                        ? 'Favorável'
                        : activeAnalysis.successProbability >= 65
                        ? 'Atenção Necessária'
                        : 'Crítico'}
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        activeAnalysis.successProbability >= 80
                          ? 'bg-emerald-500'
                          : activeAnalysis.successProbability >= 65
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${activeAnalysis.successProbability}%` }}
                    />
                  </div>
                </div>

                {/* Risk Score Gauge */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Pontuação de Risco Epidemiológico</span>
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-extrabold text-rose-700">
                      {activeAnalysis.riskScore}
                    </span>
                    <span className="text-xs text-slate-400">/ 100</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto ${
                        activeAnalysis.priorityLevel === 'Crítica (Alta Prioridade)'
                          ? 'bg-rose-100 text-rose-800'
                          : activeAnalysis.priorityLevel === 'Moderada'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {activeAnalysis.priorityLevel}
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-600 rounded-full transition-all duration-500"
                      style={{ width: `${activeAnalysis.riskScore}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Identified Risk Factors */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <h4 className="font-bold text-xs text-slate-900 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Factores Determinantes de Risco Identificados ({activeAnalysis.riskFactors.length})</span>
                </h4>

                <div className="space-y-2">
                  {activeAnalysis.riskFactors.map((rf, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-rose-50/60 border border-rose-100 text-xs space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-rose-950">{rf.factor}</span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                            rf.impact === 'Crítico'
                              ? 'bg-rose-600 text-white'
                              : rf.impact === 'Alto'
                              ? 'bg-rose-200 text-rose-900'
                              : 'bg-amber-200 text-amber-900'
                          }`}
                        >
                          {rf.impact}
                        </span>
                      </div>
                      <p className="text-[11px] text-rose-800/80">{rf.description}</p>
                    </div>
                  ))}

                  {activeAnalysis.riskFactors.length === 0 && (
                    <div className="text-xs text-slate-500 p-2">Sem factores de risco graves identificados.</div>
                  )}
                </div>
              </div>

              {/* Identified Protective Factors */}
              {activeAnalysis.protectiveFactors.length > 0 && (
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                  <h4 className="font-bold text-xs text-slate-900 flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Factores de Protecção e Adesão ({activeAnalysis.protectiveFactors.length})</span>
                  </h4>

                  <div className="space-y-1.5">
                    {activeAnalysis.protectiveFactors.map((pf, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-emerald-50/60 border border-emerald-100 text-xs">
                        <div className="font-bold text-emerald-950">{pf.factor}</div>
                        <div className="text-[11px] text-emerald-800/80">{pf.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Action Plan for Health Workers */}
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-4 rounded-xl shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-white flex items-center space-x-2">
                    <HeartPulse className="w-4 h-4 text-rose-400" />
                    <span>Plano Preditivo de Intervenção Recomendado</span>
                  </h4>
                  <span className="text-[10px] text-slate-300 font-mono">Orientação PNCT</span>
                </div>

                <ul className="space-y-2 text-xs">
                  {activeAnalysis.recommendedInterventions.map((action, idx) => (
                    <li key={idx} className="flex items-start space-x-2 bg-white/10 p-2 rounded-lg border border-white/10">
                      <span className="bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="text-slate-100 text-[11px] leading-snug">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 text-xs">
              Selecione um paciente na lista à esquerda para visualizar a análise preditiva detalhada.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
