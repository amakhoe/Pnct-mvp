'use client';

import React, { useState } from 'react';
import { HealthPost, Province, Locality } from '@/lib/tb-data';
import { X, Building2, CheckCircle } from 'lucide-react';

interface HealthPostFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveHealthPost: (healthPost: HealthPost) => void;
  provinces: Province[];
  localities: Locality[];
  initialData?: HealthPost | null;
}

export default function HealthPostFormModal({
  isOpen,
  onClose,
  onSaveHealthPost,
  provinces,
  localities,
  initialData,
}: HealthPostFormModalProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [code, setCode] = useState(() => initialData?.code || 'CS-101');
  const [provinceId, setProvinceId] = useState(initialData?.provinceId || provinces[0]?.id || '');
  const [localityId, setLocalityId] = useState(initialData?.localityId || localities[0]?.id || '');
  const [type, setType] = useState<HealthPost['type']>(initialData?.type || 'Centro de Saúde');
  const [address, setAddress] = useState(initialData?.address || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [technicalLead, setTechnicalLead] = useState(initialData?.technicalLead || '');
  const [genexpertAvailable, setGenexpertAvailable] = useState<boolean>(initialData?.genexpertAvailable ?? true);
  const [microscopyAvailable, setMicroscopyAvailable] = useState<boolean>(initialData?.microscopyAvailable ?? true);
  const [medicineStockLevel, setMedicineStockLevel] = useState<HealthPost['medicineStockLevel']>(
    initialData?.medicineStockLevel || 'Adequado'
  );

  if (!isOpen) return null;

  const filteredLocalities = localities.filter((l) => l.provinceId === provinceId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newPost: HealthPost = {
      id: initialData?.id || `hp-${crypto.randomUUID()}`,
      name,
      code,
      provinceId,
      localityId: localityId || filteredLocalities[0]?.id || localities[0]?.id,
      type,
      address,
      phone,
      technicalLead,
      genexpertAvailable,
      microscopyAvailable,
      medicineStockLevel,
      assignedPatientsCount: initialData?.assignedPatientsCount || 0,
    };

    onSaveHealthPost(newPost);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl flex flex-col overflow-hidden">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-blue-400" />
            <h2 className="font-bold text-base">
              {initialData ? 'Editar Unidade Sanitária' : 'Registar Posto de Saúde / Centro TB'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Nome do Posto / Centro de Saúde *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Centro de Saúde de Bagamoyo"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Código Sanitário *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Tipo de Unidade *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              >
                <option value="Centro de Saúde">Centro de Saúde</option>
                <option value="Hospital Provincial">Hospital Provincial</option>
                <option value="Posto TB Comunitário">Posto TB Comunitário</option>
                <option value="Dispensário Especializado">Dispensário Especializado</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Província *</label>
              <select
                value={provinceId}
                onChange={(e) => {
                  setProvinceId(e.target.value);
                  const newLocs = localities.filter((l) => l.provinceId === e.target.value);
                  if (newLocs.length > 0) setLocalityId(newLocs[0].id);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              >
                {provinces.map((prov) => (
                  <option key={prov.id} value={prov.id}>
                    {prov.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Localidade / Município *</label>
              <select
                value={localityId}
                onChange={(e) => setLocalityId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              >
                {filteredLocalities.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Responsável Técnico / Médico</label>
              <input
                type="text"
                value={technicalLead}
                onChange={(e) => setTechnicalLead(e.target.value)}
                placeholder="Ex: Dra. Maria Esperança"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Telefone de Contacto</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ex: +244 923 000 000"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Endereço Completo</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ex: Avenida de Moçambique, Bairro Bagamoyo, Maputo"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <label className="block text-slate-900 font-bold mb-1">Capacidade Diagnóstica & Stock de Fármacos</label>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center space-x-2 text-slate-700 font-medium">
                <input
                  type="checkbox"
                  checked={genexpertAvailable}
                  onChange={(e) => setGenexpertAvailable(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Máquina GeneXpert Disponível</span>
              </label>

              <label className="flex items-center space-x-2 text-slate-700 font-medium">
                <input
                  type="checkbox"
                  checked={microscopyAvailable}
                  onChange={(e) => setMicroscopyAvailable(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Microscopia BK Operacional</span>
              </label>
            </div>

            <div className="pt-2">
              <label className="block text-slate-700 font-semibold mb-1">Nível de Stock de Medicamentos TB (RHZE)</label>
              <select
                value={medicineStockLevel}
                onChange={(e) => setMedicineStockLevel(e.target.value as any)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-semibold text-slate-800"
              >
                <option value="Adequado">Adequado (Stock Suficiente)</option>
                <option value="Aviso (Baixo)">Aviso (Stock Baixo)</option>
                <option value="Crítico (Esgotado)">Crítico (Stock Esgotado)</option>
              </select>
            </div>
          </div>

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
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md flex items-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{initialData ? 'Guardar Unidade' : 'Confirmar Registo do Posto'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
