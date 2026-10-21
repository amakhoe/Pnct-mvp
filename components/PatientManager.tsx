'use client';

import React, { useState } from 'react';
import { Patient, Province, Locality, HealthPost } from '@/lib/tb-data';
import { calculatePatientPrediction } from '@/lib/predictive-model';
import {
  Users,
  Search,
  Filter,
  Plus,
  Eye,
  Trash2,
  CheckCircle,
  AlertCircle,
  FileText,
  MapPin,
  Building2,
  Check,
  X,
  Download,
  Sparkles,
  Phone,
  ShieldAlert,
  Pill,
  BrainCircuit,
  TrendingUp,
} from 'lucide-react';

interface PatientManagerProps {
  patients: Patient[];
  provinces: Province[];
  localities: Locality[];
  healthPosts: HealthPost[];
  onAddPatientClick: () => void;
  onSelectPatient: (patient: Patient) => void;
  onDeletePatient: (patientId: string) => void;
  onOpenAiAdvisorForPatient: (patient: Patient) => void;
}

export default function PatientManager({
  patients,
  provinces,
  localities,
  healthPosts,
  onAddPatientClick,
  onSelectPatient,
  onDeletePatient,
  onOpenAiAdvisorForPatient,
}: PatientManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvinceFilter, setSelectedProvinceFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [selectedTbTypeFilter, setSelectedTbTypeFilter] = useState('all');

  // Filtering patients
  const filteredPatients = patients.filter((patient) => {
    const healthPost = healthPosts.find((hp) => hp.id === patient.healthPostId);
    const healthPostName = healthPost ? healthPost.name.toLowerCase() : '';
    const healthPostCode = healthPost ? healthPost.code.toLowerCase() : '';
    const term = searchTerm.toLowerCase().trim();

    const matchesSearch =
      !term ||
      patient.name.toLowerCase().includes(term) ||
      patient.code.toLowerCase().includes(term) ||
      healthPostName.includes(term) ||
      healthPostCode.includes(term) ||
      (patient.identityDoc && patient.identityDoc.toLowerCase().includes(term)) ||
      (patient.phone && patient.phone.includes(term));

    const matchesProvince =
      selectedProvinceFilter === 'all' || patient.provinceId === selectedProvinceFilter;

    const matchesStatus =
      selectedStatusFilter === 'all' || patient.status === selectedStatusFilter;

    const matchesTbType =
      selectedTbTypeFilter === 'all' || patient.tbType === selectedTbTypeFilter;

    return matchesSearch && matchesProvince && matchesStatus && matchesTbType;
  });

  const exportFilteredPatientsCsv = () => {
    const headers = ['Codigo', 'Nome', 'Idade', 'Genero', 'Documento', 'Telefone', 'Provincia', 'Localidade', 'Tipo_TB', 'Estado', 'Fase', 'DOTS'];
    const rows = filteredPatients.map((p) => {
      const prov = provinces.find((pr) => pr.id === p.provinceId)?.name || '';
      const loc = localities.find((lc) => lc.id === p.localityId)?.name || '';
      return [
        p.code,
        `"${p.name}"`,
        p.age,
        p.gender,
        p.identityDoc,
        p.phone,
        `"${prov}"`,
        `"${loc}"`,
        `"${p.tbType}"`,
        `"${p.status}"`,
        `"${p.treatmentPhase}"`,
        p.dotsSupervised ? 'Sim' : 'Nao',
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `lista_pacientes_tuberculose_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-6 h-6 text-rose-600" />
            <h1 className="text-xl font-bold text-slate-900">Gestão de Pacientes com Tuberculose</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Registo sanitário, classificação clínica, acompanhamento DOTS e acompanhamento por província e localidade.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={exportFilteredPatientsCsv}
            className="px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={onAddPatientClick}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Registar Paciente</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search bar */}
          <div className="relative col-span-1 sm:col-span-2 lg:col-span-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar código, paciente ou unidade sanitária..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                title="Limpar pesquisa"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Province */}
          <div>
            <select
              value={selectedProvinceFilter}
              onChange={(e) => setSelectedProvinceFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white text-slate-700 font-medium"
            >
              <option value="all">Todas as Províncias</option>
              {provinces.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.riskLevel})
                </option>
              ))}
            </select>
          </div>

          {/* Filter Status */}
          <div>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white text-slate-700 font-medium"
            >
              <option value="all">Todos os Estados Clínicos</option>
              <option value="Em Tratamento">Em Tratamento</option>
              <option value="Curado">Curado</option>
              <option value="Suspeito">Suspeito</option>
              <option value="Abandono">Abandono</option>
              <option value="Óbito">Óbito</option>
            </select>
          </div>

          {/* Filter TB Type */}
          <div>
            <select
              value={selectedTbTypeFilter}
              onChange={(e) => setSelectedTbTypeFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white text-slate-700 font-medium"
            >
              <option value="all">Todos os Tipos de TB</option>
              <option value="Pulmonar Smear+">Pulmonar Smear+</option>
              <option value="Pulmonar Smear-">Pulmonar Smear-</option>
              <option value="Extrapulmonar">Extrapulmonar</option>
              <option value="Multirresistente (MDR)">Multirresistente (MDR)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>A mostrar {filteredPatients.length} de {patients.length} pacientes registados</span>
          {(searchTerm || selectedProvinceFilter !== 'all' || selectedStatusFilter !== 'all' || selectedTbTypeFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedProvinceFilter('all');
                setSelectedStatusFilter('all');
                setSelectedTbTypeFilter('all');
              }}
              className="text-rose-600 font-semibold hover:underline"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Patient Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPatients.length > 0 ? (
          filteredPatients.map((patient) => {
            const province = provinces.find((p) => p.id === patient.provinceId);
            const locality = localities.find((l) => l.id === patient.localityId);
            const healthPost = healthPosts.find((hp) => hp.id === patient.healthPostId);

            return (
              <div
                key={patient.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
              >
                {/* Card Top */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-slate-900 text-sm">{patient.name}</h3>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-slate-500">
                        {patient.code} • {patient.age} anos ({patient.gender.charAt(0)})
                      </span>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        patient.status === 'Curado'
                          ? 'bg-emerald-100 text-emerald-800'
                          : patient.status === 'Em Tratamento'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {patient.status}
                    </span>
                  </div>

                  {/* TB Type & Treatment Phase Badges */}
                  <div className="flex flex-wrap gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        patient.tbType === 'Multirresistente (MDR)'
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : patient.tbType === 'Pulmonar Smear+'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}
                    >
                      {patient.tbType}
                    </span>

                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-medium">
                      {patient.treatmentPhase}
                    </span>
                  </div>

                  {/* Predictive Model Indicator */}
                  {(() => {
                    const pred = calculatePatientPrediction(patient, healthPost);
                    return (
                      <div className="flex items-center justify-between text-[11px] bg-slate-900 text-white p-2 rounded-xl border border-slate-800">
                        <div className="flex items-center space-x-1.5">
                          <BrainCircuit className="w-3.5 h-3.5 text-rose-400" />
                          <span className="font-semibold text-[10px]">Cura Estimada:</span>
                          <span className="font-bold text-emerald-400">{pred.successProbability}%</span>
                        </div>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.2 rounded-full uppercase ${
                            pred.priorityLevel === 'Crítica (Alta Prioridade)'
                              ? 'bg-rose-600 text-white'
                              : pred.priorityLevel === 'Moderada'
                              ? 'bg-amber-500 text-white'
                              : 'bg-emerald-600 text-white'
                          }`}
                        >
                          Risco {pred.riskScore}/100
                        </span>
                      </div>
                    );
                  })()}

                  {/* Location and Center */}
                  <div className="space-y-1 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="flex items-center space-x-1.5 font-medium text-slate-800">
                      <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>
                        {locality?.name || 'Localidade'}, {province?.name || 'Província'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-slate-500 text-[11px]">
                      <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate">{healthPost?.name || 'Posto não especificado'}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onSelectPatient(patient)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-[11px] flex items-center space-x-1 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ficha</span>
                    </button>

                    <button
                      onClick={() => onOpenAiAdvisorForPatient(patient)}
                      className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors"
                      title="Consultar Assistente AI sobre este caso"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`Tem certeza que deseja remover o registo de ${patient.name}?`)) {
                        onDeletePatient(patient.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Remover Paciente"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full bg-white rounded-2xl p-12 text-center border border-slate-200">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700 text-base">Nenhum paciente encontrado</h3>
            <p className="text-xs text-slate-500 mt-1">Tente ajustar os termos da pesquisa ou os filtros aplicados.</p>
          </div>
        )}
      </div>
    </div>
  );
}
