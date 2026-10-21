'use client';

import React, { useState } from 'react';
import { Province, Locality, Patient, HealthPost } from '@/lib/tb-data';
import {
  ShieldAlert,
  ShieldCheck,
  MapPin,
  TrendingUp,
  AlertTriangle,
  Users,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  Info,
  Filter,
  Flame,
  CheckCircle,
  Activity,
  FileText,
} from 'lucide-react';

interface RiskZoneAnalysisProps {
  provinces: Province[];
  localities: Locality[];
  patients: Patient[];
  healthPosts: HealthPost[];
  onOpenAiAdvisor: (promptContext?: string) => void;
  onNavigateToPatients: () => void;
}

export default function RiskZoneAnalysis({
  provinces,
  localities,
  patients,
  healthPosts,
  onOpenAiAdvisor,
  onNavigateToPatients,
}: RiskZoneAnalysisProps) {
  const [selectedCategory, setSelectedCategory] = useState<'high' | 'low' | 'all'>('high');
  const [selectedProvinceFilter, setSelectedProvinceFilter] = useState('all');

  // Categorize zones
  const highIncidenceZones = localities
    .filter((l) => l.riskLevel === 'Alto' || l.incidenceRatePer100k > 15)
    .sort((a, b) => b.incidenceRatePer100k - a.incidenceRatePer100k);

  const lowIncidenceZones = localities
    .filter((l) => l.riskLevel === 'Baixo' || l.incidenceRatePer100k <= 5)
    .sort((a, b) => a.incidenceRatePer100k - b.incidenceRatePer100k);

  const displayedZones =
    selectedCategory === 'high'
      ? highIncidenceZones
      : selectedCategory === 'low'
      ? lowIncidenceZones
      : localities;

  const filteredZones = displayedZones.filter((z) => {
    return selectedProvinceFilter === 'all' || z.provinceId === selectedProvinceFilter;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center space-x-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-semibold">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Análise Epidemiológica Espacial e de Focos</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Análise Comparativa de Zonas de Risco Epidemiológico
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            Mapeamento de alta resolução de zonas com <strong>elevada transmissão (Maior Registo de Casos)</strong> e zonas sob <strong>baixo índice de infecção (Estáveis)</strong> para alocação prioritária de recursos sanitários e intervenções comunitárias.
          </p>
        </div>
      </div>

      {/* Mode Selection Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setSelectedCategory('high')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 ${
              selectedCategory === 'high'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-300" />
            <span>Zonas de Maior Incidência ({highIncidenceZones.length})</span>
          </button>

          <button
            onClick={() => setSelectedCategory('low')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 ${
              selectedCategory === 'low'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-200" />
            <span>Zonas de Baixo Índice ({lowIncidenceZones.length})</span>
          </button>

          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Ver Todas ({localities.length})
          </button>
        </div>

        {/* Filter Province */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedProvinceFilter}
            onChange={(e) => setSelectedProvinceFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white font-medium text-slate-700"
          >
            <option value="all">Todas as Províncias</option>
            {provinces.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* EPIDEMIOLOGICAL CONTEXT & STRATEGY PANEL */}
      {selectedCategory === 'high' && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2 text-rose-900 font-bold text-sm">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
              <span>Estratégia Prioritária para Zonas de Alta Incidência (Focos de Transmissão)</span>
            </div>

            <button
              onClick={() =>
                onOpenAiAdvisor(
                  `Gere um plano de acção de saúde pública para contornar a alta incidência de Tuberculose nas seguintes localidades: ${highIncidenceZones
                    .map((z) => `${z.name} (${z.incidenceRatePer100k}/100k)`)
                    .join(', ')}.`
                )
              }
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Gerar Plano de Ação AI</span>
            </button>
          </div>

          <p className="text-xs text-rose-800 leading-relaxed">
            As localidades listadas abaixo possuem taxas superiores a <strong>15 casos por 100 mil habitantes</strong>. Recomenda-se:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs">
            <div className="bg-white/80 p-3 rounded-xl border border-rose-200/80">
              <strong className="text-rose-950 block font-bold mb-1">1. Busca Activa Comunitária</strong>
              <p className="text-slate-700">Envio de Agentes Comunitários de Saúde (ADECOS) para busca de sintomáticos respiratórios com tosse &gt; 14 dias.</p>
            </div>
            <div className="bg-white/80 p-3 rounded-xl border border-rose-200/80">
              <strong className="text-rose-950 block font-bold mb-1">2. Rastreio de Contactos Familiares</strong>
              <p className="text-slate-700">Testagem sistemática com GeneXpert e RX de tórax para todos os contactos domiciliares de casos bacilíferos (Smear+).</p>
            </div>
            <div className="bg-white/80 p-3 rounded-xl border border-rose-200/80">
              <strong className="text-rose-950 block font-bold mb-1">3. Supervisão Estrita de DOTS</strong>
              <p className="text-slate-700">Prevenção do abandono de tratamento para evitar o aparecimento de estirpes de Tuberculose Multirresistente (MDR-TB).</p>
            </div>
          </div>
        </div>
      )}

      {selectedCategory === 'low' && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center space-x-2 text-emerald-950 font-bold text-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Boas Práticas em Zonas com Baixo Índice de Infecção</span>
          </div>

          <p className="text-xs text-emerald-900 leading-relaxed">
            As zonas com taxa inferior a <strong>5 casos por 100 mil habitantes</strong> demonstram uma dinâmica epidemiológica sob controlo. Factores de sucesso identificados:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs">
            <div className="bg-white/80 p-3 rounded-xl border border-emerald-200/80">
              <strong className="text-emerald-950 block font-bold mb-1">Elevada Adesão Terapêutica</strong>
              <p className="text-slate-700">Taxa de cura superior a 85% reduz o reservatório de infecção e interrompe a cadeia de transmissão comunitária.</p>
            </div>
            <div className="bg-white/80 p-3 rounded-xl border border-emerald-200/80">
              <strong className="text-emerald-950 block font-bold mb-1">Disponibilidade Diagnóstica</strong>
              <p className="text-slate-700">Acesso rápido a exames GeneXpert permite diagnosticar e iniciar o tratamento antes de haver disseminação.</p>
            </div>
            <div className="bg-white/80 p-3 rounded-xl border border-emerald-200/80">
              <strong className="text-emerald-950 block font-bold mb-1">Vigilância Passiva Sustentada</strong>
              <p className="text-slate-700">Manutenção dos alertas nas unidades sanitárias para rastreio contínuo de casos suspeitos.</p>
            </div>
          </div>
        </div>
      )}

      {/* Zones List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredZones.map((zone) => {
          const prov = provinces.find((p) => p.id === zone.provinceId);
          const zonePatients = patients.filter((p) => p.localityId === zone.id);
          const activeCount = zonePatients.filter((p) => p.status === 'Em Tratamento').length;
          const curedCount = zonePatients.filter((p) => p.status === 'Curado').length;
          const postsInZone = healthPosts.filter((hp) => hp.localityId === zone.id);

          return (
            <div
              key={zone.id}
              className={`bg-white rounded-2xl border p-5 shadow-sm space-y-4 transition-all hover:shadow-md ${
                zone.riskLevel === 'Alto'
                  ? 'border-rose-200 hover:border-rose-300'
                  : zone.riskLevel === 'Baixo'
                  ? 'border-emerald-200 hover:border-emerald-300'
                  : 'border-slate-200'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <MapPin
                      className={`w-4 h-4 ${
                        zone.riskLevel === 'Alto'
                          ? 'text-rose-600'
                          : zone.riskLevel === 'Baixo'
                          ? 'text-emerald-600'
                          : 'text-amber-500'
                      }`}
                    />
                    <h3 className="font-bold text-slate-900 text-base">{zone.name}</h3>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    Província de {prov?.name || 'Moçambique'} • População: {zone.population.toLocaleString()} hab.
                  </span>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center space-x-1 ${
                    zone.riskLevel === 'Alto'
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : zone.riskLevel === 'Baixo'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {zone.riskLevel === 'Alto' ? (
                    <>
                      <Flame className="w-3.5 h-3.5 mr-1 text-rose-600" />
                      <span>Alta Incidência</span>
                    </>
                  ) : zone.riskLevel === 'Baixo' ? (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                      <span>Baixo Índice</span>
                    </>
                  ) : (
                    <span>Infectação Moderada</span>
                  )}
                </span>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-4 gap-2 text-center bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block font-semibold">Casos Activos</span>
                  <span className="font-extrabold text-rose-700 text-sm">{activeCount || zone.activeCases}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 block font-semibold">Curados</span>
                  <span className="font-extrabold text-emerald-700 text-sm">{curedCount || zone.curedCases}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 block font-semibold">Casos MDR</span>
                  <span className="font-extrabold text-purple-700 text-sm">{zone.mdrCases}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 block font-semibold">Taxa / 100k hab.</span>
                  <span className="font-extrabold text-slate-900 text-sm">{zone.incidenceRatePer100k}</span>
                </div>
              </div>

              {/* Health Posts in Zone */}
              <div className="text-xs text-slate-600 space-y-1">
                <span className="font-semibold text-slate-800 block">Postos de Saúde Disponíveis:</span>
                {postsInZone.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {postsInZone.map((hp) => (
                      <span
                        key={hp.id}
                        className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px] font-medium border border-slate-200"
                      >
                        {hp.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-400 italic">Nenhum posto directamente mapeado nesta localidade</span>
                )}
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={onNavigateToPatients}
                  className="text-rose-600 font-bold hover:underline flex items-center space-x-1"
                >
                  <span>Ver Pacientes Desta Zona</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() =>
                    onOpenAiAdvisor(
                      `Análise técnica detalhada e recomendações para a localidade ${zone.name} (${prov?.name}), com taxa de incidência de ${zone.incidenceRatePer100k} por 100.000 habitantes e ${zone.activeCases} casos activos.`
                    )
                  }
                  className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg flex items-center space-x-1 text-[11px]"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Análise AI</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
