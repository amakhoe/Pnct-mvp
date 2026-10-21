'use client';

import React, { useState } from 'react';
import { Province, Locality } from '@/lib/tb-data';
import { X, MapPin, CheckCircle } from 'lucide-react';

interface TerritoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveProvince: (province: Province) => void;
  onSaveLocality: (locality: Locality) => void;
  provinces: Province[];
  mode: 'province' | 'locality';
}

export default function TerritoryFormModal({
  isOpen,
  onClose,
  onSaveProvince,
  onSaveLocality,
  provinces,
  mode,
}: TerritoryFormModalProps) {
  // Province State
  const [provinceName, setProvinceName] = useState('');
  const [provinceCode, setProvinceCode] = useState('');
  const [provincePopulation, setProvincePopulation] = useState(1000000);
  const [provinceRiskLevel, setProvinceRiskLevel] = useState<Province['riskLevel']>('Moderado');

  // Locality State
  const [localityName, setLocalityName] = useState('');
  const [localityProvinceId, setLocalityProvinceId] = useState(provinces[0]?.id || '');
  const [localityPopulation, setLocalityPopulation] = useState(250000);
  const [localityActiveCases, setLocalityActiveCases] = useState(15);
  const [localityCuredCases, setLocalityCuredCases] = useState(40);
  const [localityMdrCases, setLocalityMdrCases] = useState(1);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'province') {
      if (!provinceName.trim()) return;
      const newProv: Province = {
        id: `prov-${Date.now()}`,
        name: provinceName,
        code: provinceCode || provinceName.substring(0, 3).toUpperCase(),
        population: Number(provincePopulation),
        activeCases: 0,
        totalHistoricalCases: 0,
        curedCases: 0,
        incidenceRatePer100k: 0,
        riskLevel: provinceRiskLevel,
      };
      onSaveProvince(newProv);
    } else {
      if (!localityName.trim()) return;
      const pop = Number(localityPopulation);
      const active = Number(localityActiveCases);
      const inc = pop > 0 ? Number(((active / pop) * 100000).toFixed(1)) : 0;
      let risk: Locality['riskLevel'] = 'Moderado';
      if (inc > 15) risk = 'Alto';
      else if (inc <= 5) risk = 'Baixo';

      const newLoc: Locality = {
        id: `loc-${Date.now()}`,
        provinceId: localityProvinceId,
        name: localityName,
        population: pop,
        activeCases: active,
        curedCases: Number(localityCuredCases),
        mdrCases: Number(localityMdrCases),
        incidenceRatePer100k: inc,
        riskLevel: risk,
      };
      onSaveLocality(newLoc);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md flex flex-col overflow-hidden">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-rose-400" />
            <h2 className="font-bold text-base">
              {mode === 'province' ? 'Registar Nova Província' : 'Registar Nova Localidade / Município'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {mode === 'province' ? (
            <>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nome da Província *</label>
                <input
                  type="text"
                  required
                  value={provinceName}
                  onChange={(e) => setProvinceName(e.target.value)}
                  placeholder="Ex: Malanje, Cuanza Sul, Nampula"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Código (3 letras)</label>
                  <input
                    type="text"
                    maxLength={3}
                    value={provinceCode}
                    onChange={(e) => setProvinceCode(e.target.value.toUpperCase())}
                    placeholder="Ex: MAL"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nível de Risco Inicial</label>
                  <select
                    value={provinceRiskLevel}
                    onChange={(e) => setProvinceRiskLevel(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white font-semibold"
                  >
                    <option value="Baixo">Baixo</option>
                    <option value="Moderado">Moderado</option>
                    <option value="Crítico">Crítico</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">População Estimada (Habitantes)</label>
                <input
                  type="number"
                  required
                  min={1000}
                  value={provincePopulation}
                  onChange={(e) => setProvincePopulation(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nome da Localidade / Município *</label>
                <input
                  type="text"
                  required
                  value={localityName}
                  onChange={(e) => setLocalityName(e.target.value)}
                  placeholder="Ex: KaMavota, Nlhamankulu, Beira, Nampula"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Província Pertencente *</label>
                <select
                  value={localityProvinceId}
                  onChange={(e) => setLocalityProvinceId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white font-medium"
                >
                  {provinces.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">População (Habitantes)</label>
                <input
                  type="number"
                  required
                  min={100}
                  value={localityPopulation}
                  onChange={(e) => setLocalityPopulation(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Casos Activos</label>
                  <input
                    type="number"
                    min={0}
                    value={localityActiveCases}
                    onChange={(e) => setLocalityActiveCases(Number(e.target.value))}
                    className="w-full px-2 py-2 border border-slate-300 rounded-lg font-bold text-rose-700"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Curados</label>
                  <input
                    type="number"
                    min={0}
                    value={localityCuredCases}
                    onChange={(e) => setLocalityCuredCases(Number(e.target.value))}
                    className="w-full px-2 py-2 border border-slate-300 rounded-lg font-bold text-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Casos MDR</label>
                  <input
                    type="number"
                    min={0}
                    value={localityMdrCases}
                    onChange={(e) => setLocalityMdrCases(Number(e.target.value))}
                    className="w-full px-2 py-2 border border-slate-300 rounded-lg font-bold text-purple-700"
                  />
                </div>
              </div>
            </>
          )}

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100 font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-md flex items-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Confirmar Registo</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
