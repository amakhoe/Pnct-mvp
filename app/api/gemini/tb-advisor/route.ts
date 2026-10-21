import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt, context } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "A chave API do Gemini não está configurada no servidor." },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const systemInstruction = `Você é um Assistente Técnico Epidemiológico e Clínico especializado em Tuberculose (TB) alinhado ao Programa Nacional de Controlo da Tuberculose (PNCT/MISAU) de Moçambique e recomendações da OMS.
Suas tarefas incluem:
1. Orientar sobre protocolos de tratamento padrão para Tuberculose Sensível (2RHZE/4RH) e Tuberculose Multirresistente (MDR-TB) com esquemas modernos (incluindo Bedaquilina, Levofloxacina).
2. Analisar dados de pacientes e zonas epidemiológicas de províncias e distritos de Moçambique (ex: Maputo, Nampula, Sofala, Zambézia, Cabo Delgado, Gaza, Inhambane).
3. Fornecer sugestões de intervenção comunitária para áreas de alto risco (focos de transmissão, rastreio de contactos, Tratamento Diretamente Observado - TDO/DOTS).
4. Gerar resumos executivos de relatórios epidemiológicos com foco em tomada de decisão clínica e de saúde pública.
Responda sempre em português claro, profissional, médico e empático. Seja objetivo e utilize marcadores em negrito para facilitar a leitura.
Isenção de responsabilidade médica: Lembre que suas sugestões são de apoio técnico e a decisão clínica final cabe aos profissionais de saúde credenciados.`;

    const fullPrompt = context
      ? `[CONTEXTO DE DADOS DA APLICAÇÃO]:
${JSON.stringify(context, null, 2)}

[PERGUNTA/SOLICITAÇÃO DO USUÁRIO]:
${prompt}`
      : prompt;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: fullPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return NextResponse.json({ text: response.text || "Sem resposta gerada." });
  } catch (error: any) {
    console.error("Erro na API do Gemini TB Advisor:", error);
    return NextResponse.json(
      { error: error?.message || "Erro interno ao processar a requisição com o assistente AI." },
      { status: 500 }
    );
  }
}
