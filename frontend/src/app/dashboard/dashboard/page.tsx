"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  DollarSign,
  Percent,
  PlaneTakeoff,
  Clock,
  Users,
  AlertTriangle,
  Gift,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const metricas = [
  { label: "Vendas do Mês", value: "12", icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { label: "Receita Total", value: "R$ 45.800", icon: DollarSign, color: "text-blue-400", bg: "bg-blue-500/10" },
  { label: "Taxa de Conversão", value: "34%", icon: Percent, color: "text-violet-400", bg: "bg-violet-500/10" },
  { label: "Viagens Ativas", value: "5", icon: PlaneTakeoff, color: "text-amber-400", bg: "bg-amber-500/10" },
];

const dadosGrafico = [
  { mes: "Jan", vendasNormais: 28000, pontosMilhas: 15000 },
  { mes: "Fev", vendasNormais: 32000, pontosMilhas: 18000 },
  { mes: "Mar", vendasNormais: 25000, pontosMilhas: 22000 },
  { mes: "Abr", vendasNormais: 38000, pontosMilhas: 19000 },
  { mes: "Mai", vendasNormais: 35000, pontosMilhas: 25000 },
  { mes: "Jun", vendasNormais: 42000, pontosMilhas: 28000 },
  { mes: "Jul", vendasNormais: 30000, pontosMilhas: 15800 },
];

const pipelineResumo = [
  { coluna: "Lead", quantidade: 12, cor: "#8B5CF6" },
  { coluna: "Qualificação", quantidade: 5, cor: "#3B82F6" },
  { coluna: "Alinhamento", quantidade: 4, cor: "#06B6D4" },
  { coluna: "Pend. Orçamento", quantidade: 3, cor: "#F59E0B" },
  { coluna: "Orç. Enviado", quantidade: 4, cor: "#10B981" },
  { coluna: "Negociação", quantidade: 5, cor: "#6366F1" },
  { coluna: "Fechamento", quantidade: 3, cor: "#EC4899" },
  { coluna: "Confirmado", quantidade: 8, cor: "#22C55E" },
];

const orcamentosPendentes = [
  { cliente: "Maria Santos", dias: 4, status: "crítico" },
  { cliente: "Pedro Lima", dias: 1, status: "atenção" },
  { cliente: "Ana Oliveira", dias: 0.2, status: "ok" },
  { cliente: "Carlos Eduardo", dias: 2, status: "médio" },
];

const followUpsHoje = [
  { cliente: "João Silva", horario: "14:00", tipo: "Ligação" },
  { cliente: "Ana Costa", horario: "16:30", tipo: "WhatsApp" },
  { cliente: "Carlos R.", horario: "11:00", tipo: "Ligação" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricas.map((m) => (
          <div
            key={m.label}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">{m.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{m.value}</p>
              </div>
              <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", m.bg)}>
                <m.icon className={cn("w-5 h-5", m.color)} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Gráfico + Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            📈 Faturamento Mensal
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosGrafico}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="mes" stroke="#64748B" fontSize={12} />
              <YAxis stroke="#64748B" fontSize={12} tickFormatter={(v) => `R$${v / 1000}k`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1E293B",
                  border: "1px solid #334155",
                  borderRadius: "12px",
                  color: "#F1F5F9",
                }}
              />
              <Bar dataKey="vendasNormais" name="Vendas Normais" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pontosMilhas" name="Pontos & Milhas" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pipeline Resumo */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            📋 Pipeline Resumo
          </h3>
          <div className="space-y-2">
            {pipelineResumo.map((p) => (
              <div key={p.coluna} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.cor }} />
                  <span className="text-sm text-slate-300">{p.coluna}</span>
                </div>
                <span
                  className={cn(
                    "text-sm font-semibold px-2 py-0.5 rounded-lg",
                    p.quantidade >= 5 ? "text-white" : "text-slate-400"
                  )}
                  style={{ backgroundColor: p.cor + "20" }}
                >
                  {p.quantidade}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cards Inferiores */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Follow-ups */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            🔔 Follow-ups Hoje
          </h3>
          <div className="space-y-3">
            {followUpsHoje.map((f) => (
              <div
                key={f.cliente}
                className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl"
              >
                <div>
                  <p className="text-sm font-medium text-white">{f.cliente}</p>
                  <p className="text-xs text-slate-400">{f.tipo}</p>
                </div>
                <span className="text-sm text-blue-400 font-medium">{f.horario}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Orçamentos Pendentes (SLA) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            ⚠️ Orçamentos Pendentes
          </h3>
          <div className="space-y-3">
            {orcamentosPendentes.map((o) => (
              <div
                key={o.cliente}
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl",
                  o.status === "crítico"
                    ? "bg-red-500/10 border border-red-500/30"
                    : o.status === "médio" || o.status === "atenção"
                    ? "bg-amber-500/10 border border-amber-500/30"
                    : "bg-emerald-500/10 border border-emerald-500/30"
                )}
              >
                <div>
                  <p className="text-sm font-medium text-white">{o.cliente}</p>
                  <p className="text-xs text-slate-400">
                    {o.dias < 1 ? "Recém-entrou" : `${Math.floor(o.dias)} dia(s) parado`}
                  </p>
                </div>
                <div
                  className={cn(
                    "w-3 h-3 rounded-full animate-pulse",
                    o.status === "crítico"
                      ? "bg-red-500"
                      : o.status === "médio" || o.status === "atenção"
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  )}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Aniversariantes + Alertas */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Gift className="w-5 h-5 text-pink-400" />
              🎂 Aniversariantes
            </h3>
            <div className="space-y-2">
              {[
                { nome: "Maria Santos", data: "15/07" },
                { nome: "Pedro Lima", data: "22/07" },
                { nome: "Ana Oliveira", data: "28/07" },
              ].map((a) => (
                <div key={a.nome} className="flex justify-between text-sm py-1.5 border-b border-slate-800/50 last:border-0">
                  <span className="text-slate-300">{a.nome}</span>
                  <span className="text-pink-400">{a.data}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">⚠️ Alertas</h3>
            <div className="space-y-2 text-sm text-slate-400">
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full" />
                Passaporte João vence em 30 dias
              </p>
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-500 rounded-full" />
                Repasse Hotel X atrasado
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
