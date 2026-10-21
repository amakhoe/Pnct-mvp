'use client';

import React, { useState } from 'react';
import { Province, Locality, Patient } from '@/lib/tb-data';
import {
  MapPin,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Building,
  Users,
  Search,
  Trash2,
} from 'lucide-react';

interface TerritoryManagerProps {
  provinces: Province[];
  localities: Locality[];
  patients: Patient[];
  onOpenAddTerritoryModal: (mode: 'province' | 'locality') => void;
  onDeleteProvince: (provinceId: string) => void;
  onDeleteLocality: (localityId: string) => void;
}

export default function TerritoryManager({
  provinces,
  localities,
  patients,
  onOpenAddTerritoryModal,
  onDeleteProvince,
  onDeleteLocality,
}: TerritoryManagerProps) {
  const [selectedProvinceTab, setSelectedProvinceTab] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLocalities = localities.filter((loc) => {
    const matchesProvince =
      selectedProvinceTab === 'all' || loc.provinceId === selectedProvinceTab;
    const matchesSearch = loc.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesProvince && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-6 h-6 text-rose-600" />
            <h1 className="text-xl font-bold text-slate-900">Divisão Territorial & Zonas Epidemiológicas de Moçambique</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gestão oficial das 11 Províncias, Distritos Municipais e Distritos de Moçambique com monitorização da taxa de incidência (PNCT/MISAU).
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onOpenAddTerritoryModal('province')}
            className="px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors"
          >
            <Plus className="w-4 h-4 text-rose-600" />
            <span>Nova Província</span>
          </button>

          <button
            onClick={() => onOpenAddTerritoryModal('locality')}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Distrito / Município</span>
          </button>
        </div>
      </div>

      {/* Provinces Summary Cards */}
      <div className="space-y-3">
        <h2 className="font-bold text-sm text-slate-900">Resumo por Província</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {provinces.map((province) => {
            const provLocalities = localities.filter((l) => l.provinceId === province.id);
            const provPatients = patients.filter((p) => p.provinceId === province.id && p.status === 'Em Tratamento');

            return (
              <div
                key={province.id}
                className={`p-5 rounded-2xl border shadow-sm transition-all bg-white relative overflow-hidden ${
                  province.riskLevel === 'Crítico'
                    ? 'border-rose-200 hover:border-rose-300'
                    : province.riskLevel === 'Moderado'
                    ? 'border-amber-200'
                    : 'border-emerald-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {province.code}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base mt-1">{province.name}</h3>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                      province.riskLevel === 'Crítico'
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : province.riskLevel === 'Moderado'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    Risco {province.riskLevel}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-500 block">População:</span>
                    <span className="font-bold text-slate-800">{province.population.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Localidades:</span>
                    <span className="font-bold text-slate-800">{provLocalities.length} municípios</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Casos Activos:</span>
                    <span className="font-extrabold text-rose-700">{provPatients.length || province.activeCases}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Incidência Est.:</span>
                    <span className="font-bold text-slate-900">{province.incidenceRatePer100k} / 100k</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setSelectedProvinceTab(province.id)}
                    className="text-xs font-semibold text-rose-600 hover:underline"
                  >
                    Ver Localidades ({provLocalities.length})
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Remover a província de ${province.name}?`)) {
                        onDeleteProvince(province.id);
                      }
                    }}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded"
                    title="Remover Província"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Localities Detailed List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Localidades & Municípios Registados</h3>
            <p className="text-xs text-slate-500">
              Taxa de incidência bacteriológica e classificação em Zonas de Alta e Baixa Infecção
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filtrar localidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <select
              value={selectedProvinceTab}
              onChange={(e) => setSelectedProvinceTab(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white font-medium"
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

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Localidade / Município</th>
                <th className="py-2.5 px-3">Província</th>
                <th className="py-2.5 px-3">População</th>
                <th className="py-2.5 px-3">Casos Activos</th>
                <th className="py-2.5 px-3">Curados</th>
                <th className="py-2.5 px-3">Casos MDR</th>
                <th className="py-2.5 px-3">Taxa / 100k</th>
                <th className="py-2.5 px-3">Classificação Epidemiológica</th>
                <th className="py-2.5 px-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLocalities.map((loc) => {
                const prov = provinces.find((p) => p.id === loc.provinceId);
                return (
                  <tr key={loc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900">{loc.name}</td>
                    <td className="py-3 px-3 text-slate-700 font-medium">{prov?.name || 'N/D'}</td>
                    <td className="py-3 px-3 text-slate-600">{loc.population.toLocaleString()} hab.</td>
                    <td className="py-3 px-3 font-extrabold text-rose-700">{loc.activeCases}</td>
                    <td className="py-3 px-3 font-extrabold text-emerald-700">{loc.curedCases}</td>
                    <td className="py-3 px-3 font-bold text-purple-700">{loc.mdrCases}</td>
                    <td className="py-3 px-3 font-extrabold text-slate-900">{loc.incidenceRatePer100k}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          loc.riskLevel === 'Alto'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : loc.riskLevel === 'Moderado'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {loc.riskLevel === 'Alto' ? (
                          <ShieldAlert className="w-3 h-3 mr-1 text-rose-600" />
                        ) : loc.riskLevel === 'Baixo' ? (
                          <ShieldCheck className="w-3 h-3 mr-1 text-emerald-600" />
                        ) : null}
                        <span>{loc.riskLevel === 'Alto' ? 'Zona de Alta Incidência' : loc.riskLevel === 'Baixo' ? 'Zona de Baixo Índice' : 'Zona Moderada'}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Remover a localidade ${loc.name}?`)) {
                            onDeleteLocality(loc.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
