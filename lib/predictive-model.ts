import { Patient, HealthPost } from './tb-data';

export interface RiskFactor {
  factor: string;
  impact: 'Crítico' | 'Alto' | 'Médio';
  description: string;
}

export interface ProtectiveFactor {
  factor: string;
  description: string;
}

export interface PredictiveAnalysis {
  patientId: string;
  patientCode: string;
  patientName: string;
  successProbability: number; // 0 to 100%
  riskScore: number; // 0 to 100
  priorityLevel: 'Crítica (Alta Prioridade)' | 'Moderada' | 'Baixa';
  riskFactors: RiskFactor[];
  protectiveFactors: ProtectiveFactor[];
  recommendedInterventions: string[];
  summary: string;
}

/**
 * Modelo Preditivo Algorítmico do PNCT para estimar probabilidade de sucesso e risco do paciente
 */
export function calculatePatientPrediction(
  patient: Patient,
  healthPost?: HealthPost
): PredictiveAnalysis {
  let successProb = 85; // Base nacional de sucesso esperado
  let riskScore = 15; // Pontuação de risco base

  const riskFactors: RiskFactor[] = [];
  const protectiveFactors: ProtectiveFactor[] = [];
  const recommendedInterventions: string[] = [];

  // 1. Avaliação do Tipo de TB
  if (patient.tbType === 'Multirresistente (MDR)') {
    successProb -= 25;
    riskScore += 30;
    riskFactors.push({
      factor: 'Tuberculose Multirresistente (MDR)',
      impact: 'Crítico',
      description: 'Requer regime de 2ª linha prolongado (18-24 meses) com alta complexidade clínica.',
    });
    recommendedInterventions.push('Incluir no Protocolo Especializado de TB-MDR com monitoria por ECG e audiometria');
  } else if (patient.tbType === 'Pulmonar Smear+') {
    successProb -= 5;
    riskScore += 8;
    riskFactors.push({
      factor: 'Baciloscopia Positiva (Smear+)',
      impact: 'Médio',
      description: 'Elevada carga bacilar inicial com maior risco de contágio comunitário.',
    });
  } else {
    protectiveFactors.push({
      factor: 'Forma Carencial / Smear Negativo ou Extrapulmonar',
      description: 'Menor risco de transmissão direta e resposta rápida à medicação inicial.',
    });
  }

  // 2. Comorbilidades
  if (patient.comorbidities && patient.comorbidities.length > 0) {
    if (patient.comorbidities.includes('HIV')) {
      successProb -= 18;
      riskScore += 22;
      riskFactors.push({
        factor: 'Coinfeção TB/HIV',
        impact: 'Crítico',
        description: 'Malignidade imunológica acrescida e interações com medicação TARV.',
      });
      recommendedInterventions.push('Acompanhamento conjunto TB/TARV e profilaxia com Cotrimoxazol');
    }

    if (patient.comorbidities.includes('Desnutrição')) {
      successProb -= 12;
      riskScore += 14;
      riskFactors.push({
        factor: 'Estado Nutricional Vulnerável (Desnutrição)',
        impact: 'Alto',
        description: 'Comprometimento da absorção de tuberculostáticos e imunidade baixa.',
      });
      recommendedInterventions.push('Encaminhar para Programa de Apoio e Suplementação Nutricional no Centro de Saúde');
    }

    if (patient.comorbidities.includes('Diabetes')) {
      successProb -= 10;
      riskScore += 10;
      riskFactors.push({
        factor: 'Comorbilidade com Diabetes Mellitus',
        impact: 'Médio',
        description: 'Risco de controlo glicémico deficiente durante a terapia com Rifampicina.',
      });
      recommendedInterventions.push('Monitoria semanal da glicemia em jejum');
    }
  }

  // 3. Adesão do Paciente (através das consultas registradas)
  const latestConsultation = patient.consultations && patient.consultations.length > 0
    ? patient.consultations[patient.consultations.length - 1]
    : null;

  if (latestConsultation) {
    if (latestConsultation.treatmentAdherence === 'Irregular (<80%)') {
      successProb -= 30;
      riskScore += 35;
      riskFactors.push({
        factor: 'Adesão Terapêutica Irregular (<80%)',
        impact: 'Crítico',
        description: 'Altíssimo risco de desenvolvimento de resistência aos fármacos e abandono.',
      });
      recommendedInterventions.push('Visita domiciliária urgente por Agente Comunitário de Saúde (ACS)');
      recommendedInterventions.push('Revisão do plano de aconselhamento familiar de adesão');
    } else if (latestConsultation.treatmentAdherence === 'Regular (80-95%)') {
      successProb -= 10;
      riskScore += 12;
      riskFactors.push({
        factor: 'Adesão Parcial (80-95%)',
        impact: 'Médio',
        description: 'Falhas esporádicas na toma da medicação notificadas no cartão.',
      });
      recommendedInterventions.push('Aconselhamento individualizado de reforço na próxima consulta');
    } else if (latestConsultation.treatmentAdherence === 'Excelente (>95%)') {
      successProb += 10;
      riskScore -= 12;
      protectiveFactors.push({
        factor: 'Adesão Terapêutica Excelente (>95%)',
        description: 'Toma rigorosa dos fármacos registada pelo supervisor.',
      });
    }
  }

  // 4. Supervisão TDO (DOTS)
  if (patient.dotsSupervised) {
    successProb += 8;
    riskScore -= 10;
    protectiveFactors.push({
      factor: 'Tratamento Diretamente Observado (TDO/DOTS)',
      description: 'Supervisão diária por profissional ou ativista comunitário.',
    });
  } else {
    successProb -= 15;
    riskScore += 18;
    riskFactors.push({
      factor: 'Tratamento Não Supervisionado',
      impact: 'Alto',
      description: 'Ausência de supervisão direta na toma diária do esquema medicamentoso.',
    });
    recommendedInterventions.push('Atribuir ativista de TDO comunitário na zona de residência');
  }

  // 5. Idade
  if (patient.age >= 60) {
    successProb -= 8;
    riskScore += 10;
    riskFactors.push({
      factor: 'Idade Avançada (>= 60 anos)',
      impact: 'Médio',
      description: 'Maior vulnerabilidade a hepatotoxicidade e efeitos secundários.',
    });
  } else if (patient.age <= 5) {
    successProb -= 10;
    riskScore += 12;
    riskFactors.push({
      factor: 'Faixa Etária Pediátrica (<= 5 anos)',
      impact: 'Alto',
      description: 'Necessidade de ajuste rigoroso de dosagem e risco de TB disseminada.',
    });
  }

  // 6. Condições Logísticas do Centro de Saúde
  if (healthPost) {
    if (healthPost.medicineStockLevel === 'Aviso (Baixo)' || healthPost.medicineStockLevel === 'Crítico (Esgotado)') {
      successProb -= 12;
      riskScore += 15;
      riskFactors.push({
        factor: `Stock Medicamentoso na Unidade Sanitária (${healthPost.medicineStockLevel})`,
        impact: 'Alto',
        description: 'Risco iminente de rotura de stock no centro de saúde atribuído.',
      });
      recommendedInterventions.push('Notificar o Depósito Provincial de Medicamentos para reabastecimento imediato');
    } else {
      protectiveFactors.push({
        factor: 'Disponibilidade de Tuberculostáticos Garantida',
        description: 'Unidade sanitária com stock adequado para o esquema atual.',
      });
    }
  }

  // 7. Rastreio de Contactos
  if (patient.contactTracingCount === 0 && patient.status === 'Em Tratamento') {
    riskScore += 8;
    riskFactors.push({
      factor: 'Sem Contactos Familiares Rasteados',
      impact: 'Médio',
      description: 'Nenhum membro do agregado familiar foi ainda submetido a triagem.',
    });
    recommendedInterventions.push('Agendar rastreio e teste tuberculínico/RX para os contactos domiciliares');
  } else if (patient.contactTracingCount >= 3) {
    protectiveFactors.push({
      factor: 'Investigação Epidemiológica de Contactos Ativa',
      description: `${patient.contactTracingCount} contactos mapeados e sob seguimento.`,
    });
  }

  // Garantir limites
  successProb = Math.max(12, Math.min(98, Math.round(successProb)));
  riskScore = Math.max(5, Math.min(99, Math.round(riskScore)));

  // Determinar Nível de Prioridade
  let priorityLevel: 'Crítica (Alta Prioridade)' | 'Moderada' | 'Baixa' = 'Baixa';
  if (riskScore >= 50 || successProb < 65) {
    priorityLevel = 'Crítica (Alta Prioridade)';
  } else if (riskScore >= 25 || successProb < 80) {
    priorityLevel = 'Moderada';
  }

  // Intervenção padrão caso a lista esteja vazia
  if (recommendedInterventions.length === 0) {
    recommendedInterventions.push('Manter consultas mensais de seguimento e reforço da toma regular');
    recommendedInterventions.push('Realizar baciloscopia de controlo aos 2 e 5 meses');
  }

  // Resumo executivo do modelo preditivo
  const summary = `O modelo preditivo estima ${successProb}% de probabilidade de cura e pontuação de risco ${riskScore}/100. Nível de priorização médica: ${priorityLevel}. Factor chave: ${
    riskFactors.length > 0 ? riskFactors[0].factor : 'Boa tolerância e parâmetros clínicos estáveis'
  }.`;

  return {
    patientId: patient.id,
    patientCode: patient.code,
    patientName: patient.name,
    successProbability: successProb,
    riskScore,
    priorityLevel,
    riskFactors,
    protectiveFactors,
    recommendedInterventions,
    summary,
  };
}

/**
 * Avalia toda a lista de pacientes e retorna ordenado por maior risco / necessidade de priorização
 */
export function getPredictivePrioritizedPatients(
  patients: Patient[],
  healthPosts: HealthPost[]
): Array<{ patient: Patient; analysis: PredictiveAnalysis }> {
  return patients
    .map((patient) => {
      const hp = healthPosts.find((h) => h.id === patient.healthPostId);
      const analysis = calculatePatientPrediction(patient, hp);
      return { patient, analysis };
    })
    .sort((a, b) => b.analysis.riskScore - a.analysis.riskScore);
}
