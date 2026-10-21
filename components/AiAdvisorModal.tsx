'use client';

import React, { useState } from 'react';
import { Sparkles, X, Send, Bot, User, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { Province, Locality, Patient, HealthPost } from '@/lib/tb-data';

interface AiAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  provinces: Province[];
  localities: Locality[];
  patients: Patient[];
  healthPosts: HealthPost[];
  initialPrompt?: string;
  selectedPatientContext?: Patient | null;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export default function AiAdvisorModal({
  isOpen,
  onClose,
  provinces,
  localities,
  patients,
  healthPosts,
  initialPrompt = '',
  selectedPatientContext = null,
}: AiAdvisorModalProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: selectedPatientContext
        ? `Olá! Estou pronto para analisar o caso do paciente **${selectedPatientContext.name}** (${selectedPatientContext.code}) com diagnóstico de **${selectedPatientContext.tbType}**. Em que posso orientar a equipa técnica hoje?`
        : `Olá! Sou o **Assistente Epidemiológico e Clínico de Tuberculose (TB Care AI)**. Como posso apoiar a vigilância de zonas de alta e baixa incidência, orientar o esquema terapêutico DOTS ou elaborar um boletim epidemiológico para a sua região?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  if (!isOpen) return null;

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || prompt;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `msg-${crypto.randomUUID()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setPrompt('');
    setLoading(true);

    try {
      const response = await fetch('/api/gemini/tb-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          context: {
            pacienteSelecionado: selectedPatientContext,
            resumoGeral: {
              totalPacientes: patients.length,
              pacientesEmTratamento: patients.filter((p) => p.status === 'Em Tratamento').length,
              pacientesCurados: patients.filter((p) => p.status === 'Curado').length,
              pacientesMDR: patients.filter((p) => p.tbType === 'Multirresistente (MDR)').length,
              totalProvincias: provinces.length,
              totalLocalidades: localities.length,
              zonasAltaIncidencia: localities.filter((l) => l.riskLevel === 'Alto').map((l) => l.name),
              zonasBaixoIndice: localities.filter((l) => l.riskLevel === 'Baixo').map((l) => l.name),
            },
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao conectar com a inteligência artificial.');
      }

      const aiMsg: ChatMessage = {
        id: `msg-ai-${crypto.randomUUID()}`,
        sender: 'assistant',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `msg-err-${crypto.randomUUID()}`,
        sender: 'assistant',
        text: `⚠️ **Erro de Comunicação**: ${err.message || 'Não foi possível obter resposta do servidor.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'Elabore um Boletim Epidemiológico com resumo das zonas de alta e baixa incidência.',
    'Quais as orientações para gerir uma suspeita de TB Multirresistente (MDR)?',
    'Como organizar a Busca Activa de Sintomáticos Respiratórios nas comunidades?',
    'Quais são os critérios de alta para declarar a Cura Bacteriológica da TB?',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">Assistente AI Epidemiológico & Clínico TB</h2>
              <p className="text-[11px] text-slate-400">Powered by Gemini AI • Suporte à Decisão Sanitária</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center space-x-2 overflow-x-auto text-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase shrink-0">Sugestões:</span>
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(qp)}
              disabled={loading}
              className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-900 rounded-lg whitespace-nowrap text-[11px] font-medium transition-all shrink-0"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Chat Messages Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs bg-slate-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex space-x-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shrink-0 shadow">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl p-4 shadow-sm text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-rose-600 text-white font-medium rounded-tr-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none whitespace-pre-wrap'
                }`}
              >
                <div>{msg.text}</div>
                <div
                  className={`text-[9px] mt-1.5 text-right font-mono ${
                    msg.sender === 'user' ? 'text-rose-200' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white shrink-0 shadow">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white animate-pulse">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <div className="bg-white border border-slate-200 px-4 py-2.5 rounded-2xl text-xs text-slate-600 flex items-center space-x-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                <span>A analisar dados epidemiológicos e gerar resposta...</span>
              </div>
            </div>
          )}
        </div>

        {/* Chat Input Bar */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Digite a sua pergunta técnica ou solicitação de boletim..."
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl shadow flex items-center space-x-1 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
