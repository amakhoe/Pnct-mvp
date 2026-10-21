'use client';

import React, { useState } from 'react';
import {
  Province,
  Locality,
  HealthPost,
  Patient,
} from '@/lib/tb-data';
import {
  Users,
  ShieldAlert,
  ShieldCheck,
  Building2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Activity,
  ArrowUpRight,
  Sparkles,
  Search,
  Filter,
  CheckCircle,
  HelpCircle,
  Stethoscope,
  XCircle,
  MapPin,
  Pill,
  Award,
  Clock,
  Calendar,
  BarChart3,
  LineChart as LineChartIcon,
  Layers,
  Eye,
  EyeOff,
  ChevronDown,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';

// Palette and geographical mapping for Mozambican Provinces
const PROVINCE_CONFIGS: Record<
  string,
  { color: string; stroke: string; lightFill: string; name: string; region: 'Sul' | 'Centro' | 'Norte' }
> = {
  'prov-nampula': { color: '#8b5cf6', stroke: '#8b5cf6', lightFill: '#ede9fe', name: 'Nampula', region: 'Norte' },
  'prov-zambezia': { color: '#f59e0b', stroke: '#f59e0b', lightFill: '#fef3c7', name: 'Zambézia', region: 'Centro' },
  'prov-sofala': { color: '#ea580c', stroke: '#ea580c', lightFill: '#ffedd5', name: 'Sofala', region: 'Centro' },
  'prov-maputo-provincia': { color: '#f43f5e', stroke: '#f43f5e', lightFill: '#ffe4e6', name: 'Maputo Prov.', region: 'Sul' },
  'prov-maputo-cidade': { color: '#e11d48', stroke: '#e11d48', lightFill: '#ffe4e6', name: 'Cidade de Maputo', region: 'Sul' },
  'prov-tete': { color: '#0284c7', stroke: '#0284c7', lightFill: '#e0f2fe', name: 'Tete', region: 'Centro' },
  'prov-cabo-delgado': { color: '#ec4899', stroke: '#ec4899', lightFill: '#fce7f3', name: 'Cabo Delgado', region: 'Norte' },
  'prov-manica': { color: '#0d9488', stroke: '#0d9488', lightFill: '#ccfbf1', name: 'Manica', region: 'Centro' },
  'prov-gaza': { color: '#16a34a', stroke: '#16a34a', lightFill: '#dcfce7', name: 'Gaza', region: 'Sul' },
  'prov-niassa': { color: '#6366f1', stroke: '#6366f1', lightFill: '#e0e7ff', name: 'Niassa', region: 'Norte' },
  'prov-inhambane': { color: '#2563eb', stroke: '#2563eb', lightFill: '#dbeafe', name: 'Inhambane', region: 'Sul' },
};

const REGION_CONFIGS = {
  'Região Sul': { color: '#e11d48', stroke: '#e11d48', lightFill: '#ffe4e6' },
  'Região Centro': { color: '#f59e0b', stroke: '#f59e0b', lightFill: '#fef3c7' },
  'Região Norte': { color: '#8b5cf6', stroke: '#8b5cf6', lightFill: '#ede9fe' },
};

// 12 Months Definition (Abr 2025 - Mar 2026) aligned with national surveillance cycles
const MONTHS_CONFIG = [
  { key: '2025-04', label: 'Abr 2025', short: 'Abr 25', quarter: 'T2 2025', seasonFactor: 0.88 },
  { key: '2025-05', label: 'Mai 2025', short: 'Mai 25', quarter: 'T2 2025', seasonFactor: 0.94 },
  { key: '2025-06', label: 'Jun 2025', short: 'Jun 25', quarter: 'T2 2025', seasonFactor: 1.06 },
  { key: '2025-07', label: 'Jul 2025', short: 'Jul 25', quarter: 'T3 2025', seasonFactor: 1.15 },
  { key: '2025-08', label: 'Ago 2025', short: 'Ago 25', quarter: 'T3 2025', seasonFactor: 1.09 },
  { key: '2025-09', label: 'Set 2025', short: 'Set 25', quarter: 'T3 2025', seasonFactor: 0.98 },
  { key: '2025-10', label: 'Out 2025', short: 'Out 25', quarter: 'T4 2025', seasonFactor: 0.92 },
  { key: '2025-11', label: 'Nov 2025', short: 'Nov 25', quarter: 'T4 2025', seasonFactor: 0.95 },
  { key: '2025-12', label: 'Dez 2025', short: 'Dez 25', quarter: 'T4 2025', seasonFactor: 1.03 },
  { key: '2026-01', label: 'Jan 2026', short: 'Jan 26', quarter: 'T1 2026', seasonFactor: 1.11 },
  { key: '2026-02', label: 'Fev 2026', short: 'Fev 26', quarter: 'T1 2026', seasonFactor: 1.04 },
  { key: '2026-03', label: 'Mar 2026', short: 'Mar 26', quarter: 'T1 2026', seasonFactor: 0.98 },
];

interface DashboardOverviewProps {
  provinces: Province[];
  localities: Locality[];
  healthPosts: HealthPost[];
  patients: Patient[];
  onNavigateToRiskZones: () => void;
  onNavigateToPatients: () => void;
  onNavigateToHealthPosts: () => void;
  onOpenNewPatient: () => void;
  onOpenAiAdvisor: () => void;
}

export default function DashboardOverview({
  provinces,
  localities,
  healthPosts,
  patients,
  onNavigateToRiskZones,
  onNavigateToPatients,
  onNavigateToHealthPosts,
  onOpenNewPatient,
  onOpenAiAdvisor,
}: DashboardOverviewProps) {
  const [selectedProvinceFilter, setSelectedProvinceFilter] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'12m' | '6m' | 'quarter'>('12m');
  const [temporalChartType, setTemporalChartType] = useState<'area' | 'line' | 'bar'>('area');
  const [temporalViewScope, setTemporalViewScope] = useState<'top5' | 'all' | 'regions' | 'single'>('top5');
  const [selectedSingleProvinceId, setSelectedSingleProvinceId] = useState<string>('prov-maputo-cidade');
  const [hiddenProvinces, setHiddenProvinces] = useState<Record<string, boolean>>({});

  // Calculations
  const totalPatients = patients.length;
  const activePatients = patients.filter((p) => p.status === 'Em Tratamento').length;
  const curedPatients = patients.filter((p) => p.status === 'Curado').length;
  const mdrPatients = patients.filter((p) => p.tbType === 'Multirresistente (MDR)').length;
  const suspectPatients = patients.filter((p) => p.status === 'Suspeito').length;

  // --- STATISTICAL CALCULATIONS ---
  // 1. Taxa de cura por província
  const provinceCureStats = provinces.map((prov) => {
    const provPatients = patients.filter((p) => p.provinceId === prov.id);
    const provActiveCount = provPatients.filter((p) => p.status === 'Em Tratamento').length;
    const provCuredCount = provPatients.filter((p) => p.status === 'Curado').length;

    const totalCured = prov.curedCases + provCuredCount;
    const totalActive = prov.activeCases + provActiveCount;
    const totalHistorical = prov.totalHistoricalCases || (totalCured + totalActive);

    const cureRatePercent = totalHistorical > 0 ? Math.min(100, Math.round((totalCured / totalHistorical) * 100)) : 0;

    return {
      id: prov.id,
      name: prov.name,
      code: prov.code,
      cured: totalCured,
      active: totalActive,
      totalHistorical,
      cureRatePercent,
    };
  }).sort((a, b) => b.cureRatePercent - a.cureRatePercent);

  const nationalAvgCureRate = provinceCureStats.length > 0
    ? Math.round(provinceCureStats.reduce((sum, p) => sum + p.cureRatePercent, 0) / provinceCureStats.length)
    : 0;

  // 2. Média de tempo de tratamento dos pacientes activos
  const activePatientsList = patients.filter((p) => p.status === 'Em Tratamento');

  const refDate = new Date();
  const activePatientDurations = activePatientsList.map((p) => {
    if (!p.startDate) return { patient: p, days: 0, months: 0 };
    const start = new Date(p.startDate);
    const diffMs = Math.max(0, refDate.getTime() - start.getTime());
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const months = +(days / 30.4).toFixed(1);
    return { patient: p, days, months };
  });

  const totalActiveDays = activePatientDurations.reduce((sum, d) => sum + d.days, 0);
  const avgActiveDays = activePatientsList.length > 0 ? Math.round(totalActiveDays / activePatientsList.length) : 0;
  const avgActiveMonths = +(avgActiveDays / 30.4).toFixed(1);

  // Subgroup averages by phase
  const intensivePhaseActive = activePatientsList.filter((p) => p.treatmentPhase.includes('Intensiva'));
  const maintenancePhaseActive = activePatientsList.filter((p) => p.treatmentPhase.includes('Manutenção'));
  const mdrPhaseActive = activePatientsList.filter((p) => p.tbType === 'Multirresistente (MDR)' || p.treatmentPhase.includes('MDR'));

  const getSubgroupAvgDays = (subgroup: Patient[]) => {
    if (subgroup.length === 0) return 0;
    const sum = subgroup.reduce((acc, p) => {
      if (!p.startDate) return acc;
      const start = new Date(p.startDate);
      const diff = Math.max(0, refDate.getTime() - start.getTime());
      return acc + Math.floor(diff / (1000 * 60 * 60 * 24));
    }, 0);
    return Math.round(sum / subgroup.length);
  };

  const avgIntensiveDays = getSubgroupAvgDays(intensivePhaseActive);
  const avgMaintenanceDays = getSubgroupAvgDays(maintenancePhaseActive);
  const avgMdrDays = getSubgroupAvgDays(mdrPhaseActive);

  // High incidence & Low incidence zones from Localities
  const highRiskLocalities = localities
    .filter((l) => l.riskLevel === 'Alto' || l.incidenceRatePer100k > 15)
    .sort((a, b) => b.incidenceRatePer100k - a.incidenceRatePer100k);

  const lowRiskLocalities = localities
    .filter((l) => l.riskLevel === 'Baixo' || l.incidenceRatePer100k <= 5)
    .sort((a, b) => a.incidenceRatePer100k - b.incidenceRatePer100k);

  // Recharts Data Prep: Province Case Distribution
  const provinceChartData = provinces.map((prov) => {
    const provPatients = patients.filter((p) => p.provinceId === prov.id);
    const active = provPatients.filter((p) => p.status === 'Em Tratamento').length;
    const cured = provPatients.filter((p) => p.status === 'Curado').length;
    return {
      name: prov.name,
      Activos: active || prov.activeCases,
      Curados: cured || prov.curedCases,
      Incidência: prov.incidenceRatePer100k,
    };
  });

  // TB Types Pie Chart Data
  const tbTypeCounts = {
    'Pulmonar Smear+': patients.filter((p) => p.tbType === 'Pulmonar Smear+').length,
    'Pulmonar Smear-': patients.filter((p) => p.tbType === 'Pulmonar Smear-').length,
    'Extrapulmonar': patients.filter((p) => p.tbType === 'Extrapulmonar').length,
    'Multirresistente (MDR)': patients.filter((p) => p.tbType === 'Multirresistente (MDR)').length,
  };

  const pieData = [
    { name: 'Pulmonar Smear+', value: tbTypeCounts['Pulmonar Smear+'] || 4, color: '#ef4444' },
    { name: 'Pulmonar Smear-', value: tbTypeCounts['Pulmonar Smear-'] || 2, color: '#f97316' },
    { name: 'Extrapulmonar', value: tbTypeCounts['Extrapulmonar'] || 2, color: '#3b82f6' },
    { name: 'TB Multirresistente', value: tbTypeCounts['Multirresistente (MDR)'] || 2, color: '#8b5cf6' },
  ];

  // Health Post Stock Status
  const lowStockPosts = healthPosts.filter((hp) => hp.medicineStockLevel !== 'Adequado');

  // --- TEMPORAL DISTRIBUTION OF CASES OVER TIME (CALCULATIONS) ---
  const activeMonths = React.useMemo(() => {
    if (timeRange === '6m') {
      return MONTHS_CONFIG.slice(6); // Out 2025 - Mar 2026
    }
    return MONTHS_CONFIG;
  }, [timeRange]);

  const temporalData = React.useMemo(() => {
    const rawMonthly = activeMonths.map((m) => {
      const point: Record<string, any> = {
        monthKey: m.key,
        period: m.short,
        fullPeriod: m.label,
        quarter: m.quarter,
        totalCases: 0,
        sulTotal: 0,
        centroTotal: 0,
        norteTotal: 0,
      };

      provinces.forEach((prov) => {
        // Base monthly cohort calculated from total historical and active surveillance
        const baseMonthly = Math.round(((prov.totalHistoricalCases || 1000) / 12) * m.seasonFactor);
        // Real new registered patients matching this month
        const realNewPatients = patients.filter(
          (p) => p.provinceId === prov.id && p.startDate && p.startDate.startsWith(m.key)
        ).length;

        const val = Math.max(1, baseMonthly + realNewPatients);
        point[prov.name] = val;
        point[prov.id] = val;
        point.totalCases += val;

        const region = PROVINCE_CONFIGS[prov.id]?.region || 'Centro';
        if (region === 'Sul') point.sulTotal += val;
        else if (region === 'Centro') point.centroTotal += val;
        else point.norteTotal += val;
      });

      point['Região Sul'] = point.sulTotal;
      point['Região Centro'] = point.centroTotal;
      point['Região Norte'] = point.norteTotal;

      // Single province breakdown
      const targetProv = provinces.find((p) => p.id === selectedSingleProvinceId) || provinces[0];
      if (targetProv) {
        const provBase = point[targetProv.name] || 50;
        point['Novos Casos'] = provBase;
        point['Activos em Tratamento'] = Math.round(targetProv.activeCases * m.seasonFactor * 0.95);
        point['Casos Curados'] = Math.round((targetProv.curedCases / 12) * m.seasonFactor * 1.05);
      }

      return point;
    });

    if (timeRange === 'quarter') {
      const quarterMap: Record<string, any> = {};
      rawMonthly.forEach((item) => {
        const q = item.quarter;
        if (!quarterMap[q]) {
          quarterMap[q] = {
            period: q,
            fullPeriod: `Trimestre ${q}`,
            totalCases: 0,
            'Região Sul': 0,
            'Região Centro': 0,
            'Região Norte': 0,
          };
          provinces.forEach((prov) => {
            quarterMap[q][prov.name] = 0;
            quarterMap[q][prov.id] = 0;
          });
          quarterMap[q]['Novos Casos'] = 0;
          quarterMap[q]['Activos em Tratamento'] = 0;
          quarterMap[q]['Casos Curados'] = 0;
        }

        quarterMap[q].totalCases += item.totalCases;
        quarterMap[q]['Região Sul'] += item['Região Sul'];
        quarterMap[q]['Região Centro'] += item['Região Centro'];
        quarterMap[q]['Região Norte'] += item['Região Norte'];

        provinces.forEach((prov) => {
          quarterMap[q][prov.name] += item[prov.name];
          quarterMap[q][prov.id] += item[prov.id];
        });

        quarterMap[q]['Novos Casos'] += item['Novos Casos'];
        quarterMap[q]['Activos em Tratamento'] = Math.max(quarterMap[q]['Activos em Tratamento'], item['Activos em Tratamento']);
        quarterMap[q]['Casos Curados'] += item['Casos Curados'];
      });

      return Object.values(quarterMap);
    }

    return rawMonthly;
  }, [activeMonths, provinces, patients, timeRange, selectedSingleProvinceId]);

  // Active Series Keys to Render
  const seriesKeysToRender = React.useMemo(() => {
    if (temporalViewScope === 'regions') {
      return ['Região Sul', 'Região Centro', 'Região Norte'].map((reg) => ({
        key: reg,
        name: reg,
        stroke: REGION_CONFIGS[reg as keyof typeof REGION_CONFIGS]?.stroke || '#6366f1',
        color: REGION_CONFIGS[reg as keyof typeof REGION_CONFIGS]?.color || '#6366f1',
        lightFill: REGION_CONFIGS[reg as keyof typeof REGION_CONFIGS]?.lightFill || '#e0e7ff',
      }));
    }

    if (temporalViewScope === 'single') {
      return [
        { key: 'Novos Casos', name: 'Novas Notificações', stroke: '#e11d48', color: '#e11d48', lightFill: '#ffe4e6' },
        { key: 'Activos em Tratamento', name: 'Casos Activos', stroke: '#3b82f6', color: '#3b82f6', lightFill: '#dbeafe' },
        { key: 'Casos Curados', name: 'Casos Curados', stroke: '#10b981', color: '#10b981', lightFill: '#dcfce7' },
      ];
    }

    const sortedProvinces = [...provinces].sort((a, b) => (b.totalHistoricalCases || 0) - (a.totalHistoricalCases || 0));
    const targetProvList = temporalViewScope === 'top5' ? sortedProvinces.slice(0, 5) : sortedProvinces;

    return targetProvList.map((prov) => ({
      key: prov.name,
      name: prov.name,
      id: prov.id,
      stroke: PROVINCE_CONFIGS[prov.id]?.stroke || '#64748b',
      color: PROVINCE_CONFIGS[prov.id]?.color || '#64748b',
      lightFill: PROVINCE_CONFIGS[prov.id]?.lightFill || '#f1f5f9',
    }));
  }, [temporalViewScope, provinces]);

  // Aggregate stats across the temporal dataset
  const periodTotalNotifications = React.useMemo(() => {
    return temporalData.reduce((acc, p) => acc + (p.totalCases || 0), 0);
  }, [temporalData]);

  const peakPeriodInfo = React.useMemo(() => {
    if (temporalData.length === 0) return { period: 'N/D', cases: 0 };
    const sorted = [...temporalData].sort((a, b) => (b.totalCases || 0) - (a.totalCases || 0));
    return { period: sorted[0]?.fullPeriod || sorted[0]?.period, cases: sorted[0]?.totalCases || 0 };
  }, [temporalData]);

  const topProvinceTemporal = React.useMemo(() => {
    const sums: Record<string, number> = {};
    provinces.forEach((p) => { sums[p.name] = 0; });
    temporalData.forEach((item) => {
      provinces.forEach((p) => {
        sums[p.name] = (sums[p.name] || 0) + (item[p.name] || 0);
      });
    });
    const sorted = Object.entries(sums).sort((a, b) => b[1] - a[1]);
    return { name: sorted[0]?.[0] || 'Nampula', count: sorted[0]?.[1] || 0 };
  }, [provinces, temporalData]);

  const selectedProvinceObj = provinces.find((p) => p.id === selectedSingleProvinceId) || provinces[0];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-rose-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 bg-rose-500/20 border border-rose-500/30 text-rose-300 px-3 py-1 rounded-full text-xs font-semibold">
              <Activity className="w-3.5 h-3.5" />
              <span>Sistema de Vigilância Epidemiológica Integrada</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Monitorização & Gestão da Tuberculose (TB)
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Mapeamento de focos de transmissão, vigilância de casos activos, acompanhamento do esquema terapêutico DOTS e rastreio de zonas de alto e baixo risco.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenAiAdvisor}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-xs sm:text-sm shadow-lg flex items-center space-x-2 transition-all border border-indigo-400/30"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Diagnóstico & Relatórios AI</span>
            </button>
            <button
              onClick={onOpenNewPatient}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs sm:text-sm shadow-lg flex items-center space-x-2 transition-all"
            >
              <Users className="w-4 h-4" />
              <span>Registar Paciente</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Active Patients */}
        <div
          onClick={onNavigateToPatients}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Casos Activos em Tratamento
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-slate-900">{activePatients}</div>
            <span className="text-xs font-medium text-slate-500">de {totalPatients} registados</span>
          </div>
          <div className="mt-2 flex items-center text-xs text-rose-600 font-medium">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            <span>Supervisão DOTS activa</span>
          </div>
        </div>

        {/* Cured Cases */}
        <div
          onClick={onNavigateToPatients}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Casos Curados / Sucesso
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-slate-900">{curedPatients}</div>
            <span className="text-xs font-semibold text-emerald-600">
              {totalPatients > 0 ? Math.round((curedPatients / totalPatients) * 100) : 0}% taxa
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">Altas com cura microbiológica</div>
        </div>

        {/* High Risk Focus Areas */}
        <div
          onClick={onNavigateToRiskZones}
          className="bg-white p-5 rounded-2xl border border-rose-200 bg-rose-50/30 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
              Zonas de Maior Incidência
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-rose-950">{highRiskLocalities.length}</div>
            <span className="text-xs font-semibold text-rose-700">Focos Críticos</span>
          </div>
          <div className="mt-2 flex items-center text-xs text-rose-800 font-medium">
            <span>Taxa &gt; 15/100k hab.</span>
            <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>

        {/* Low Incidence Zones */}
        <div
          onClick={onNavigateToRiskZones}
          className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/30 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
              Zonas de Baixo Índice
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-emerald-950">{lowRiskLocalities.length}</div>
            <span className="text-xs font-semibold text-emerald-700">Controlo Estável</span>
          </div>
          <div className="mt-2 text-xs text-emerald-800 font-medium">
            <span>Taxa &le; 5/100k hab.</span>
          </div>
        </div>
      </div>

      {/* SECTION: RESUMO ESTATÍSTICO EPIDEMIOLÓGICO */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-rose-600" />
              <span>Resumo Estatístico do Programa de Controlo</span>
            </h2>
            <p className="text-xs text-slate-500">
              Desempenho da taxa de cura por província e tempo médio de tratamento dos casos activos
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CARD 1: TAXA DE CURA POR PROVÍNCIA */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Taxa de Cura por Província
                  </h3>
                  <p className="text-xs text-slate-500">
                    Eficácia terapêutica do PNCT regional
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xl font-extrabold text-emerald-600">
                  {nationalAvgCureRate}%
                </div>
                <div className="text-[10px] font-semibold text-slate-500">
                  Média Nacional (Meta OMS &ge; 85%)
                </div>
              </div>
            </div>

            {/* Province List with progress bars */}
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {provinceCureStats.map((prov) => {
                const isHigh = prov.cureRatePercent >= 70;
                const isMedium = prov.cureRatePercent >= 60;

                return (
                  <div key={prov.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900">{prov.name}</span>
                        <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono font-semibold">
                          {prov.code}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] text-slate-500">
                          {prov.cured} / {prov.totalHistorical} casos
                        </span>
                        <span
                          className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                            isHigh
                              ? 'bg-emerald-100 text-emerald-800'
                              : isMedium
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {prov.cureRatePercent}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isHigh ? 'bg-emerald-500' : isMedium ? 'bg-blue-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${prov.cureRatePercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Província líder de cura: <strong className="text-slate-800">{provinceCureStats[0]?.name}</strong> ({provinceCureStats[0]?.cureRatePercent}%)</span>
              <span className="text-emerald-700 font-semibold">Acompanhamento Contínuo</span>
            </div>
          </div>

          {/* CARD 2: MÉDIA DE TEMPO DE TRATAMENTO DOS PACIENTES ACTIVOS */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Tempo Médio de Tratamento (Activos)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Duração média acumulada dos {activePatientsList.length} casos em seguimento
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xl font-extrabold text-indigo-600">
                  {avgActiveMonths} <span className="text-xs font-semibold">meses</span>
                </div>
                <div className="text-[10px] font-semibold text-slate-500">
                  ~{avgActiveDays} dias decorridos
                </div>
              </div>
            </div>

            {/* Subgroups Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-100">
                <div className="text-[10px] font-bold text-rose-700 uppercase">Fase Intensiva (2RHZE)</div>
                <div className="mt-1 text-base font-extrabold text-rose-950">
                  {avgIntensiveDays} <span className="text-xs font-normal text-rose-800">dias</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {intensivePhaseActive.length} paciente(s) activos
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100">
                <div className="text-[10px] font-bold text-blue-700 uppercase">Fase Manutenção (4RH)</div>
                <div className="mt-1 text-base font-extrabold text-blue-950">
                  {avgMaintenanceDays} <span className="text-xs font-normal text-blue-800">dias</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {maintenancePhaseActive.length} paciente(s) activos
                </div>
              </div>

              <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100">
                <div className="text-[10px] font-bold text-purple-700 uppercase">Tratamento MDR (2ªL)</div>
                <div className="mt-1 text-base font-extrabold text-purple-950">
                  {avgMdrDays} <span className="text-xs font-normal text-purple-800">dias</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {mdrPhaseActive.length} paciente(s) activos
                </div>
              </div>
            </div>

            {/* Active Patient Progress List */}
            <div className="space-y-2 pt-1">
              <div className="text-xs font-semibold text-slate-800 flex items-center justify-between">
                <span>Acompanhamento Individual dos Activos</span>
                <span className="text-[10px] text-slate-500">Progresso do Esquema</span>
              </div>

              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {activePatientDurations.map(({ patient, days, months }) => {
                  const targetDays = patient.tbType === 'Multirresistente (MDR)' ? 540 : 180;
                  const progress = Math.min(100, Math.round((days / targetDays) * 100));

                  return (
                    <div key={patient.id} className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs flex items-center justify-between">
                      <div className="space-y-0.5 max-w-[180px] sm:max-w-[220px]">
                        <div className="font-semibold text-slate-900 truncate">{patient.name}</div>
                        <div className="text-[10px] text-slate-500 flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>Início: {patient.startDate}</span>
                        </div>
                      </div>

                      <div className="text-right space-y-1">
                        <div className="font-bold text-indigo-700 text-[11px]">
                          {days} dias ({months} m) • <span className="text-slate-600">{progress}%</span>
                        </div>
                        <div className="w-24 sm:w-28 bg-slate-200 h-1.5 rounded-full overflow-hidden ml-auto">
                          <div
                            className="bg-indigo-600 h-full rounded-full"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CORE FEATURE SECTION: COMPARISON OF HIGH INCIDENCE VS LOW INCIDENCE ZONES */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <span>Mapeamento Epidemiológico de Incidência de Casos</span>
            </h2>
            <p className="text-xs text-slate-500">
              Identificação visual de zonas prioritárias para intervenção comunitária e zonas sob controlo estável.
            </p>
          </div>
          <button
            onClick={onNavigateToRiskZones}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center space-x-1"
          >
            <span>Ver Análise Detalhada</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ZONAS COM MAIOR REGISTO DE CASOS (HIGH INCIDENCE) */}
          <div className="bg-white rounded-2xl p-5 border border-rose-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-bl-full pointer-events-none" />
            <div className="flex items-center justify-between pb-3 border-b border-rose-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Zonas com Maior Registo de Casos (Alta Incidência)
                  </h3>
                  <span className="text-[11px] text-rose-600 font-medium">
                    Focos com taxa de infecção elevada (&gt; 15 por 100k hab.)
                  </span>
                </div>
              </div>
              <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-200">
                Alerta Vermelho
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {highRiskLocalities.slice(0, 4).map((locality) => {
                const prov = provinces.find((p) => p.id === locality.provinceId);
                return (
                  <div
                    key={locality.id}
                    className="p-3 bg-rose-50/50 hover:bg-rose-50 rounded-xl border border-rose-100/80 transition-all flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-3.5 h-3.5 text-rose-600" />
                        <span className="font-semibold text-xs text-slate-900">{locality.name}</span>
                        <span className="text-[10px] text-slate-500 font-medium">({prov?.name})</span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        População: {locality.population.toLocaleString()} hab.
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-extrabold text-rose-700">
                        {locality.activeCases} <span className="text-[10px] font-normal text-slate-600">casos activos</span>
                      </div>
                      <div className="text-[10px] font-bold text-rose-800">
                        {locality.incidenceRatePer100k} / 100k hab.
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl flex items-center justify-between">
              <span>Recomendações: Busca Activa de Sintomáticos + Rastreio Intensivo de Contactos</span>
              <button
                onClick={onOpenAiAdvisor}
                className="text-indigo-600 font-semibold hover:underline flex items-center text-[11px]"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Gerar Plano AI
              </button>
            </div>
          </div>

          {/* ZONAS COM BAIXO ÍNDICE DE INFECÇÃO (LOW INCIDENCE) */}
          <div className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
            <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Zonas com Baixo Índice de Infecção
                  </h3>
                  <span className="text-[11px] text-emerald-600 font-medium">
                    Zonas com reduzida taxa de infecção (&le; 5 por 100k hab.)
                  </span>
                </div>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                Controlo Estável
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {lowRiskLocalities.slice(0, 4).map((locality) => {
                const prov = provinces.find((p) => p.id === locality.provinceId);
                return (
                  <div
                    key={locality.id}
                    className="p-3 bg-emerald-50/50 hover:bg-emerald-50 rounded-xl border border-emerald-100/80 transition-all flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-semibold text-xs text-slate-900">{locality.name}</span>
                        <span className="text-[10px] text-slate-500 font-medium">({prov?.name})</span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        População: {locality.population.toLocaleString()} hab.
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-extrabold text-emerald-700">
                        {locality.activeCases} <span className="text-[10px] font-normal text-slate-600">casos activos</span>
                      </div>
                      <div className="text-[10px] font-bold text-emerald-800">
                        {locality.incidenceRatePer100k} / 100k hab.
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl flex items-center justify-between">
              <span>Estratégia: Manutenção da Vigilância Passiva e Prevenção Epidemiológica</span>
              <button
                onClick={onNavigateToRiskZones}
                className="text-emerald-700 font-semibold hover:underline text-[11px]"
              >
                Ver Factores de Sucesso
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: DISTRIBUIÇÃO E EVOLUÇÃO TEMPORAL DE CASOS POR PROVÍNCIA AO LONGO DO TEMPO */}
      <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200/90 shadow-sm space-y-6">
        {/* Header and Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                <LineChartIcon className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Distribuição de Casos por Província ao Longo do Tempo
              </h2>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                Série Temporal Recharts
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-2xl">
              Vigilância longitudinal de notificações mensais e acompanhamento de casos de Tuberculose (PNCT/MISAU) nas 11 províncias moçambicanas.
            </p>
          </div>

          {/* Granularity & Chart Type Selector */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Scope Tabs */}
            <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs">
              <button
                type="button"
                onClick={() => setTemporalViewScope('top5')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  temporalViewScope === 'top5'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Top 5 Províncias
              </button>
              <button
                type="button"
                onClick={() => setTemporalViewScope('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  temporalViewScope === 'all'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                11 Províncias
              </button>
              <button
                type="button"
                onClick={() => setTemporalViewScope('regions')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  temporalViewScope === 'regions'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Regiões (N/C/S)
              </button>
              <button
                type="button"
                onClick={() => setTemporalViewScope('single')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  temporalViewScope === 'single'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Por Província
              </button>
            </div>

            {/* Timeframe selector */}
            <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs">
              <button
                type="button"
                onClick={() => setTimeRange('12m')}
                className={`px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                  timeRange === '12m' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                12 Meses
              </button>
              <button
                type="button"
                onClick={() => setTimeRange('6m')}
                className={`px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                  timeRange === '6m' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                6 Meses
              </button>
              <button
                type="button"
                onClick={() => setTimeRange('quarter')}
                className={`px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                  timeRange === 'quarter' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Trimestral
              </button>
            </div>

            {/* Chart Type Icon Buttons */}
            <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs">
              <button
                type="button"
                onClick={() => setTemporalChartType('area')}
                title="Gráfico de Área Degradê"
                className={`px-2 py-1.5 rounded-lg transition-all ${
                  temporalChartType === 'area' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setTemporalChartType('line')}
                title="Gráfico de Linhas"
                className={`px-2 py-1.5 rounded-lg transition-all ${
                  temporalChartType === 'line' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LineChartIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setTemporalChartType('bar')}
                title="Gráfico de Barras"
                className={`px-2 py-1.5 rounded-lg transition-all ${
                  temporalChartType === 'bar' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Single Province Dropdown Selector if single is active */}
        {temporalViewScope === 'single' && (
          <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-rose-600" />
              <span className="text-xs font-semibold text-slate-800">
                Província Selecionada para Análise Temporal:
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={selectedSingleProvinceId}
                onChange={(e) => setSelectedSingleProvinceId(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-xs"
              >
                {provinces.map((prov) => (
                  <option key={prov.id} value={prov.id}>
                    {prov.name} ({prov.code}) - {prov.activeCases} casos activos
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-slate-500 hidden md:inline">
                População: {selectedProvinceObj?.population.toLocaleString()} hab.
              </span>
            </div>
          </div>
        )}

        {/* Temporal KPI Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-slate-50/80 border border-slate-100 p-3 rounded-xl">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Total de Notificações
            </span>
            <div className="mt-1 text-lg font-extrabold text-slate-900">
              {periodTotalNotifications.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Casos distribuídos no período
            </div>
          </div>

          <div className="bg-rose-50/60 border border-rose-100 p-3 rounded-xl">
            <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">
              Mês de Pico Sazonal
            </span>
            <div className="mt-1 text-lg font-extrabold text-rose-950">
              {peakPeriodInfo.period}
            </div>
            <div className="text-[10px] text-rose-700 mt-0.5">
              {peakPeriodInfo.cases.toLocaleString()} casos registados
            </div>
          </div>

          <div className="bg-purple-50/60 border border-purple-100 p-3 rounded-xl">
            <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">
              Maior Foco Territorial
            </span>
            <div className="mt-1 text-lg font-extrabold text-purple-950 truncate">
              {topProvinceTemporal.name}
            </div>
            <div className="text-[10px] text-purple-700 mt-0.5">
              {topProvinceTemporal.count.toLocaleString()} notificações
            </div>
          </div>

          <div className="bg-emerald-50/60 border border-emerald-100 p-3 rounded-xl">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
              Dinâmica Epidemiológica
            </span>
            <div className="mt-1 text-lg font-extrabold text-emerald-950 flex items-center space-x-1">
              <TrendingDown className="w-4 h-4 text-emerald-600" />
              <span>Controlo Estável</span>
            </div>
            <div className="text-[10px] text-emerald-700 mt-0.5">
              Reforço DOTS comunitário
            </div>
          </div>
        </div>

        {/* The Recharts Visual Container */}
        <div className="w-full h-80 sm:h-96 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {temporalChartType === 'area' ? (
              <AreaChart data={temporalData} margin={{ top: 12, right: 16, left: -10, bottom: 0 }}>
                <defs>
                  {seriesKeysToRender.map((s) => (
                    <linearGradient
                      key={`grad-${s.key}`}
                      id={`grad-${s.key.replace(/[^a-zA-Z0-9]/g, '')}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor={s.color} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={s.color} stopOpacity={0.0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const totalMonth = payload.reduce(
                        (sum: number, item: any) => sum + (Number(item.value) || 0),
                        0
                      );
                      return (
                        <div className="bg-slate-900/95 backdrop-blur border border-slate-700 p-3.5 rounded-xl shadow-2xl text-xs text-white min-w-[210px] z-50">
                          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                            <div className="flex items-center space-x-1.5 font-bold text-slate-200">
                              <Calendar className="w-3.5 h-3.5 text-rose-400" />
                              <span>{label}</span>
                            </div>
                            <span className="text-[10px] text-slate-400">PNCT Moçambique</span>
                          </div>
                          <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                            {payload.map((item: any, idx: number) => {
                              const val = Number(item.value) || 0;
                              const percent = totalMonth > 0 ? Math.round((val / totalMonth) * 100) : 0;
                              return (
                                <div key={idx} className="flex items-center justify-between space-x-3">
                                  <div className="flex items-center space-x-2 truncate">
                                    <span
                                      className="w-2.5 h-2.5 rounded-full shrink-0"
                                      style={{ backgroundColor: item.color || item.fill || item.stroke }}
                                    />
                                    <span className="text-slate-300 truncate">{item.name}</span>
                                  </div>
                                  <div className="flex items-center space-x-1.5 shrink-0">
                                    <span className="font-bold text-white">{val.toLocaleString()}</span>
                                    <span className="text-[10px] text-slate-400 font-mono">({percent}%)</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between font-bold text-slate-200 text-[11px]">
                            <span>Total no Período:</span>
                            <span className="text-rose-400 font-extrabold">{totalMonth.toLocaleString()} casos</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {seriesKeysToRender.map((s) => (
                  <Area
                    key={s.key}
                    type="monotone"
                    dataKey={s.key}
                    name={s.name}
                    stroke={s.stroke}
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill={`url(#grad-${s.key.replace(/[^a-zA-Z0-9]/g, '')})`}
                    hide={!!hiddenProvinces[s.key]}
                  />
                ))}
              </AreaChart>
            ) : temporalChartType === 'line' ? (
              <LineChart data={temporalData} margin={{ top: 12, right: 16, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const totalMonth = payload.reduce(
                        (sum: number, item: any) => sum + (Number(item.value) || 0),
                        0
                      );
                      return (
                        <div className="bg-slate-900/95 backdrop-blur border border-slate-700 p-3.5 rounded-xl shadow-2xl text-xs text-white min-w-[210px] z-50">
                          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                            <div className="flex items-center space-x-1.5 font-bold text-slate-200">
                              <Calendar className="w-3.5 h-3.5 text-rose-400" />
                              <span>{label}</span>
                            </div>
                            <span className="text-[10px] text-slate-400">PNCT Moçambique</span>
                          </div>
                          <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                            {payload.map((item: any, idx: number) => {
                              const val = Number(item.value) || 0;
                              const percent = totalMonth > 0 ? Math.round((val / totalMonth) * 100) : 0;
                              return (
                                <div key={idx} className="flex items-center justify-between space-x-3">
                                  <div className="flex items-center space-x-2 truncate">
                                    <span
                                      className="w-2.5 h-2.5 rounded-full shrink-0"
                                      style={{ backgroundColor: item.color || item.fill || item.stroke }}
                                    />
                                    <span className="text-slate-300 truncate">{item.name}</span>
                                  </div>
                                  <div className="flex items-center space-x-1.5 shrink-0">
                                    <span className="font-bold text-white">{val.toLocaleString()}</span>
                                    <span className="text-[10px] text-slate-400 font-mono">({percent}%)</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between font-bold text-slate-200 text-[11px]">
                            <span>Total no Período:</span>
                            <span className="text-rose-400 font-extrabold">{totalMonth.toLocaleString()} casos</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {seriesKeysToRender.map((s) => (
                  <Line
                    key={s.key}
                    type="monotone"
                    dataKey={s.key}
                    name={s.name}
                    stroke={s.stroke}
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: s.color }}
                    activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                    hide={!!hiddenProvinces[s.key]}
                  />
                ))}
              </LineChart>
            ) : (
              <BarChart data={temporalData} margin={{ top: 12, right: 16, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const totalMonth = payload.reduce(
                        (sum: number, item: any) => sum + (Number(item.value) || 0),
                        0
                      );
                      return (
                        <div className="bg-slate-900/95 backdrop-blur border border-slate-700 p-3.5 rounded-xl shadow-2xl text-xs text-white min-w-[210px] z-50">
                          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                            <div className="flex items-center space-x-1.5 font-bold text-slate-200">
                              <Calendar className="w-3.5 h-3.5 text-rose-400" />
                              <span>{label}</span>
                            </div>
                            <span className="text-[10px] text-slate-400">PNCT Moçambique</span>
                          </div>
                          <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                            {payload.map((item: any, idx: number) => {
                              const val = Number(item.value) || 0;
                              const percent = totalMonth > 0 ? Math.round((val / totalMonth) * 100) : 0;
                              return (
                                <div key={idx} className="flex items-center justify-between space-x-3">
                                  <div className="flex items-center space-x-2 truncate">
                                    <span
                                      className="w-2.5 h-2.5 rounded-full shrink-0"
                                      style={{ backgroundColor: item.color || item.fill || item.stroke }}
                                    />
                                    <span className="text-slate-300 truncate">{item.name}</span>
                                  </div>
                                  <div className="flex items-center space-x-1.5 shrink-0">
                                    <span className="font-bold text-white">{val.toLocaleString()}</span>
                                    <span className="text-[10px] text-slate-400 font-mono">({percent}%)</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between font-bold text-slate-200 text-[11px]">
                            <span>Total no Período:</span>
                            <span className="text-rose-400 font-extrabold">{totalMonth.toLocaleString()} casos</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {seriesKeysToRender.map((s) => (
                  <Bar
                    key={s.key}
                    dataKey={s.key}
                    name={s.name}
                    fill={s.color}
                    radius={[4, 4, 0, 0]}
                    hide={!!hiddenProvinces[s.key]}
                  />
                ))}
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Interactive Province Visibility Legend / Badges */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700 flex items-center space-x-1.5">
              <span>Filtro Rápido de Séries</span>
              <span className="text-[10px] text-slate-400 font-normal">
                (Clique para ocultar / exibir qualquer província na curva)
              </span>
            </span>
            <button
              type="button"
              onClick={() => setHiddenProvinces({})}
              className="text-rose-600 hover:text-rose-700 font-semibold text-[11px]"
            >
              Exibir Todas
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {seriesKeysToRender.map((series) => {
              const isHidden = !!hiddenProvinces[series.key];
              return (
                <button
                  key={series.key}
                  type="button"
                  onClick={() =>
                    setHiddenProvinces((prev) => ({
                      ...prev,
                      [series.key]: !prev[series.key],
                    }))
                  }
                  className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
                    isHidden
                      ? 'bg-slate-100 text-slate-400 border-slate-200 line-through opacity-60'
                      : 'bg-white text-slate-800 border-slate-200 shadow-xs hover:border-slate-300'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: isHidden ? '#94a3b8' : series.color }}
                  />
                  <span>{series.name}</span>
                  {isHidden ? (
                    <EyeOff className="w-3 h-3 text-slate-400 ml-1" />
                  ) : (
                    <Eye className="w-3 h-3 text-slate-400 ml-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Province Cases Bar Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Distribuição Epidemiológica de Casos por Província
              </h3>
              <p className="text-xs text-slate-500">Comparativo de Casos Activos vs Pacientes Curados</p>
            </div>
            <div className="text-xs bg-slate-100 px-2.5 py-1 rounded-lg text-slate-600 font-medium">
              Dados do Programa Nacional
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={provinceChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="Activos" name="Casos Activos em Tratamento" fill="#e11d48" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Curados" name="Casos Curados" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TB Types Pie Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Tipo de Tuberculose Diagnostorada</h3>
            <p className="text-xs text-slate-500 mb-2">Classificação Bacteriológica e Clínica</p>

            <div className="h-52 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-700 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* QUICK STATUS & LOW MEDICINE STOCK ALERT */}
      {lowStockPosts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-amber-950">
                Alerta de Medicamentos: {lowStockPosts.length} Postos com Estoque Baixo / Crítico
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Risco de interrupção da Fase Intensiva de RHZE. Recomenda-se reabastecimento logístico urgente.
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateToHealthPosts}
            className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-semibold whitespace-nowrap self-start sm:self-center"
          >
            Ver Postos Afetados
          </button>
        </div>
      )}

      {/* RECENT PATIENTS PREVIEW TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Pacientes Recentes no Sistema
            </h3>
            <p className="text-xs text-slate-500">Últimos registos com acompanhamento de tratamento</p>
          </div>
          <button
            onClick={onNavigateToPatients}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center space-x-1"
          >
            <span>Ver Todos ({patients.length})</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Código / Nome</th>
                <th className="py-2.5 px-3">Província / Localidade</th>
                <th className="py-2.5 px-3">Tipo TB</th>
                <th className="py-2.5 px-3">Fase Tratamento</th>
                <th className="py-2.5 px-3">Estado</th>
                <th className="py-2.5 px-3 text-right">DOTS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patients.slice(0, 5).map((patient) => {
                const prov = provinces.find((p) => p.id === patient.provinceId);
                const loc = localities.find((l) => l.id === patient.localityId);

                return (
                  <tr key={patient.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{patient.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{patient.code}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-slate-800 font-medium">{loc?.name || 'Local N/D'}</div>
                      <div className="text-[10px] text-slate-500">{prov?.name}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          patient.tbType === 'Multirresistente (MDR)'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : patient.tbType === 'Pulmonar Smear+'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {patient.tbType}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-medium">
                      {patient.treatmentPhase}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          patient.status === 'Curado'
                            ? 'bg-emerald-100 text-emerald-800'
                            : patient.status === 'Em Tratamento'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        <span>{patient.status}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {patient.dotsSupervised ? (
                        <span className="text-emerald-600 font-bold text-[11px] inline-flex items-center">
                          <CheckCircle className="w-3.5 h-3.5 mr-1" /> Sim
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Não</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
