'use client';

import React, { useState } from 'react';
import {
  Patient,
  Province,
  Locality,
  HealthPost,
  TBType,
  PatientStatus,
  TreatmentPhase,
} from '@/lib/tb-data';
import { X, UserPlus, CheckCircle, AlertCircle } from 'lucide-react';

interface PatientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePatient: (patient: Patient) => void;
  provinces: Province[];
  localities: Locality[];
  healthPosts: HealthPost[];
  initialData?: Patient | null;
}

export default function PatientFormModal({
  isOpen,
  onClose,
  onSavePatient,
  provinces,
  localities,
  healthPosts,
  initialData,
}: PatientFormModalProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [age, setAge] = useState<number>(initialData?.age || 30);
  const [gender, setGender] = useState<'Masculino' | 'Feminino'>(initialData?.gender || 'Masculino');
  const [identityDoc, setIdentityDoc] = useState(initialData?.identityDoc || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [address, setAddress] = useState(initialData?.address || '');

  const [provinceId, setProvinceId] = useState(initialData?.provinceId || provinces[0]?.id || '');
  const [localityId, setLocalityId] = useState(initialData?.localityId || localities[0]?.id || '');
  const [healthPostId, setHealthPostId] = useState(initialData?.healthPostId || healthPosts[0]?.id || '');

  const [tbType, setTbType] = useState<TBType>(initialData?.tbType || 'Pulmonar Smear+');
  const [status, setStatus] = useState<PatientStatus>(initialData?.status || 'Em Tratamento');
  const [treatmentPhase, setTreatmentPhase] = useState<TreatmentPhase>(initialData?.treatmentPhase || 'Fase Intensiva (2RHZE)');
  const [sputumSmearResult, setSputumSmearResult] = useState(initialData?.sputumSmearResult || 'Positivo (++)');
  const [dotsSupervised, setDotsSupervised] = useState<boolean>(initialData?.dotsSupervised ?? true);
  const [contactTracingCount, setContactTracingCount] = useState<number>(initialData?.contactTracingCount || 3);
  const [comorbiditiesInput, setComorbiditiesInput] = useState<string>(initialData?.comorbidities?.join(', ') || 'HIV');
  const [notes, setNotes] = useState(initialData?.notes || '');

  if (!isOpen) return null;

  // Filter localities by selected province
  const filteredLocalities = localities.filter((l) => l.provinceId === provinceId);
  const filteredHealthPosts = healthPosts.filter((hp) => hp.provinceId === provinceId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    const comorbidities = comorbiditiesInput
      .split(',')
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    const codeNum = Math.floor(100 + (typeof window !== 'undefined' && window.crypto ? (window.crypto.getRandomValues(new Uint32Array(1))[0] % 900) : 123));
    const generatedCode = initialData?.code || `TB-${new Date().getFullYear()}-${codeNum}`;

    const newPatient: Patient = {
      id: initialData?.id || `pat-${crypto.randomUUID()}`,
      code: generatedCode,
      name,
      age: Number(age),
      gender,
      identityDoc,
      phone,
      address,
      provinceId,
      localityId: localityId || filteredLocalities[0]?.id || localities[0]?.id,
      healthPostId: healthPostId || filteredHealthPosts[0]?.id || healthPosts[0]?.id,
      tbType,
      status,
      treatmentPhase,
      startDate: initialData?.startDate || new Date().toISOString().split('T')[0],
      dotsSupervised,
      contactTracingCount: Number(contactTracingCount),
      comorbidities,
      sputumSmearResult,
      notes,
    };

    onSavePatient(newPatient);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-rose-400" />
            <h2 className="font-bold text-base">
              {initialData ? 'Editar Registo do Paciente' : 'Registar Novo Paciente com Tuberculose'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* Section 1: Dados Pessoais */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1.5 flex items-center justify-between">
              <span>1. Identificação do Paciente</span>
              <span className="text-[10px] text-slate-500 font-normal">Campos obrigatórios (*)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Manuel Domingos"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Idade *</label>
                <input
                  type="number"
                  required
                  min={0}
                  max={120}
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Género</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white"
                >
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nº BI / Documento</label>
                <input
                  type="text"
                  value={identityDoc}
                  onChange={(e) => setIdentityDoc(e.target.value)}
                  placeholder="Ex: 004582191LA042"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Telefone / Contacto</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ex: +244 923 000 000"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Localização e Atribuição */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1.5">
              2. Localização Territorial & Posto de Saúde de Referência
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Província *</label>
                <select
                  value={provinceId}
                  onChange={(e) => {
                    setProvinceId(e.target.value);
                    const newLocs = localities.filter((l) => l.provinceId === e.target.value);
                    if (newLocs.length > 0) setLocalityId(newLocs[0].id);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white"
                >
                  {provinces.map((prov) => (
                    <option key={prov.id} value={prov.id}>
                      {prov.name} ({prov.riskLevel})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Localidade / Município *</label>
                <select
                  value={localityId}
                  onChange={(e) => setLocalityId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white"
                >
                  {filteredLocalities.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} (Risco {loc.riskLevel})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Posto de Saúde *</label>
                <select
                  value={healthPostId}
                  onChange={(e) => setHealthPostId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white"
                >
                  {filteredHealthPosts.map((hp) => (
                    <option key={hp.id} value={hp.id}>
                      {hp.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-slate-700 font-semibold mb-1">Endereço Residencial Detalhado</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ex: Bairro Bagamoyo, Quarteirão 14, Casa Nº 8, Maputo"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Diagnóstico e Regime de Tratamento */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1.5">
              3. Classificação Diagnóstica & Tratamento DOTS
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Tipo de Tuberculose *</label>
                <select
                  value={tbType}
                  onChange={(e) => setTbType(e.target.value as TBType)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white font-medium"
                >
                  <option value="Pulmonar Smear+">Pulmonar Smear+ (Baciloscopia Positiva)</option>
                  <option value="Pulmonar Smear-">Pulmonar Smear- (Baciloscopia Negativa)</option>
                  <option value="Extrapulmonar">Extrapulmonar (Ganglionar, Pleural, etc.)</option>
                  <option value="Multirresistente (MDR)">Multirresistente (MDR-TB)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Estado Clínico Atual *</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as PatientStatus)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white font-semibold text-rose-700"
                >
                  <option value="Em Tratamento">Em Tratamento</option>
                  <option value="Suspeito">Suspeito (Em Investigação)</option>
                  <option value="Curado">Curado (Alta Médica)</option>
                  <option value="Abandono">Abandono de Tratamento</option>
                  <option value="Óbito">Óbito</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Fase do Esquema *</label>
                <select
                  value={treatmentPhase}
                  onChange={(e) => setTreatmentPhase(e.target.value as TreatmentPhase)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white"
                >
                  <option value="Fase Intensiva (2RHZE)">Fase Intensiva (2RHZE)</option>
                  <option value="Fase de Manutenção (4RH)">Fase de Manutenção (4RH)</option>
                  <option value="Tratamento MDR (18-24M)">Tratamento MDR (18-24M)</option>
                  <option value="Concluído">Concluído</option>
                  <option value="Não Iniciado">Não Iniciado</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Exame de Escarro (Baciloscopia)</label>
                <select
                  value={sputumSmearResult}
                  onChange={(e) => setSputumSmearResult(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white"
                >
                  <option value="Positivo (+++)">Positivo (+++)</option>
                  <option value="Positivo (++)">Positivo (++)</option>
                  <option value="Positivo (+)">Positivo (+)</option>
                  <option value="Negativo">Negativo</option>
                  <option value="Pendente">Pendente</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Contactos para Rastreio (Família)</label>
                <input
                  type="number"
                  min={0}
                  value={contactTracingCount}
                  onChange={(e) => setContactTracingCount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center space-x-2 pt-5">
                <input
                  type="checkbox"
                  id="dots"
                  checked={dotsSupervised}
                  onChange={(e) => setDotsSupervised(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
                />
                <label htmlFor="dots" className="text-slate-800 font-semibold text-xs cursor-pointer">
                  Tratamento sob Supervisão Directa (DOTS)
                </label>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-slate-700 font-semibold mb-1">Comorbilidades (separadas por vírgula)</label>
                <input
                  type="text"
                  value={comorbiditiesInput}
                  onChange={(e) => setComorbiditiesInput(e.target.value)}
                  placeholder="Ex: HIV, Diabetes, Desnutrição, Alcoolemia"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-slate-700 font-semibold mb-1">Observações Médicas / Notas de Seguimento</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Anotações técnicas do enfermeiro ou médico responsável..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
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
              <span>{initialData ? 'Guardar Alterações' : 'Confirmar Registo do Paciente'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
