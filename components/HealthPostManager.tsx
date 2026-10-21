'use client';

import React, { useState } from 'react';
import { HealthPost, Province, Locality, Patient } from '@/lib/tb-data';
import {
  Building2,
  Plus,
  Search,
  MapPin,
  Pill,
  CheckCircle,
  AlertTriangle,
  Stethoscope,
  Trash2,
  Edit3,
} from 'lucide-react';

interface HealthPostManagerProps {
  healthPosts: HealthPost[];
  provinces: Province[];
  localities: Locality[];
  patients: Patient[];
  onAddHealthPostClick: () => void;
  onEditHealthPostClick: (post: HealthPost) => void;
  onDeleteHealthPost: (postId: string) => void;
}

export default function HealthPostManager({
  healthPosts,
  provinces,
  localities,
  patients,
  onAddHealthPostClick,
  onEditHealthPostClick,
  onDeleteHealthPost,
}: HealthPostManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvinceFilter, setSelectedProvinceFilter] = useState('all');

  const filteredPosts = healthPosts.filter((hp) => {
    const matchesSearch =
      hp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hp.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hp.technicalLead.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesProvince =
      selectedProvinceFilter === 'all' || hp.provinceId === selectedProvinceFilter;

    return matchesSearch && matchesProvince;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900">Postos de Saúde & Centros de Referência TB</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Rede sanitária de diagnóstico (GeneXpert / Baciloscopia), acompanhamento de estoques de RHZE e unidades de tratamento.
          </p>
        </div>

        <button
          onClick={onAddHealthPostClick}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-md transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Registar Posto de Saúde</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Pesquisar por nome, código ou responsável..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <select
            value={selectedProvinceFilter}
            onChange={(e) => setSelectedProvinceFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-slate-700 font-medium"
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

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPosts.map((post) => {
          const prov = provinces.find((p) => p.id === post.provinceId);
          const loc = localities.find((l) => l.id === post.localityId);
          const activePatientsInPost = patients.filter(
            (p) => p.healthPostId === post.id && p.status === 'Em Tratamento'
          ).length;

          return (
            <div
              key={post.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                      {post.code}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-1.5">{post.name}</h3>
                  </div>

                  <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-1 rounded-md whitespace-nowrap">
                    {post.type}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1.5 bg-slate-50 p-2.5 rounded-xl">
                  <div className="flex items-center space-x-1.5 text-slate-800 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-rose-600" />
                    <span>
                      {loc?.name || 'Localidade'}, {prov?.name || 'Província'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Responsável: <strong className="text-slate-800">{post.technicalLead || 'Não atribuído'}</strong>
                  </div>
                  <div className="text-[11px] text-slate-500">Contacto: {post.phone || 'N/D'}</div>
                </div>

                {/* Equipment & Stock Status */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-semibold">Testagem GeneXpert:</span>
                    {post.genexpertAvailable ? (
                      <span className="text-emerald-700 font-bold flex items-center">
                        <CheckCircle className="w-3 h-3 mr-1" /> Sim
                      </span>
                    ) : (
                      <span className="text-slate-400 font-medium">Não disponível</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-semibold">Estoque RHZE:</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded ${
                        post.medicineStockLevel === 'Adequado'
                          ? 'bg-emerald-100 text-emerald-800'
                          : post.medicineStockLevel === 'Aviso (Baixo)'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {post.medicineStockLevel}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-slate-500 font-semibold">Pacientes Atribuidos:</span>
                    <span className="font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      {activePatientsInPost} em tratamento
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => onEditHealthPostClick(post)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg text-[11px] flex items-center space-x-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar Unidade</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Remover a unidade sanitária ${post.name}?`)) {
                      onDeleteHealthPost(post.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Remover Unidade"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
