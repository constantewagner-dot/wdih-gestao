"use client";

import { useEffect, useState, useCallback } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  Plus,
  MoreVertical,
  Phone,
  MessageCircle,
  Clock,
  AlertTriangle,
  User,
  Calendar,
  Tag,
} from "lucide-react";
import { cn, formatCurrency, formatDate, daysBetween } from "@/lib/utils";
import toast from "react-hot-toast";

// ─── Tipos ──────────────────────────────────────────

interface Coluna {
  id: string;
  nome: string;
  ordem: number;
  cor: string;
}

interface Oportunidade {
  id: string;
  titulo: string;
  cliente: { id: string; nome: string };
  tipoNegocio: string;
  programaFidelidade?: { nome: string; corIdentificadora: string } | null;
  valorEstimado: number | null;
  pipelineColunaId: string;
  responsavel?: { name: string; avatarUrl: string | null } | null;
  prazoDeadline: string | null;
  tags: string | null;
  diasNaColuna: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Cores por coluna de encerramento ───────────────

const COLUNAS_ENCERRAMENTO: Record<string, { titulo: string; cor: string }> = {
  Fechamento: { titulo: "Fechamento", cor: "bg-pink-500/10 border-pink-500/30" },
  "Negociação Perdida": {
    titulo: "Negociação Perdida",
    cor: "bg-red-500/10 border-red-500/30",
  },
  "Negociação Futura": {
    titulo: "Negociação Futura",
    cor: "bg-amber-500/10 border-amber-500/30",
  },
};

// ─── Dias críticos por coluna ───────────────────────

const DIAS_ALERTA: Record<number, number> = {
  4: 1, // Pendente Envio Orçamento: 1 dia → alerta
};

// ─── Página ─────────────────────────────────────────

export default function PipelinePage() {
  const [colunas, setColunas] = useState<Coluna[]>([]);
  const [oportunidades, setOportunidades] = useState<Oportunidade[]>([]);
  const [modalEncerramento, setModalEncerramento] = useState<{
    coluna: string;
    oportunidadeId: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Carregar dados
  const carregarDados = useCallback(async () => {
    try {
      const [colRes, opRes] = await Promise.all([
        fetch("/api/pipeline/colunas"),
        fetch("/api/pipeline/oportunidades"),
      ]);
      setColunas(await colRes.json());
      setOportunidades(await opRes.json());
    } catch {
      toast.error("Erro ao carregar pipeline");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // Drag & Drop
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const novaColunaId = destination.droppableId;

    // Otimista: atualizar UI
    setOportunidades((prev) =>
      prev.map((o) =>
        o.id === draggableId ? { ...o, pipelineColunaId: novaColunaId } : o
      )
    );

    // Verificar se é coluna de encerramento
    const colunaDestino = colunas.find((c) => c.id === novaColunaId);
    const isEncerramento =
      colunaDestino &&
      Object.keys(COLUNAS_ENCERRAMENTO).some((k) =>
        colunaDestino.nome.includes(k)
      );

    if (isEncerramento) {
      // Bloquear e abrir modal
      setOportunidades((prev) =>
        prev.map((o) =>
          o.id === draggableId
            ? { ...o, pipelineColunaId: result.source.droppableId }
            : o
        )
      );
      setModalEncerramento({
        coluna: colunaDestino!.nome,
        oportunidadeId: draggableId,
      });
      return;
    }

    // Salvar no backend
    try {
      await fetch(`/api/pipeline/oportunidades/${draggableId}/mover`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          novaColunaId,
          colunaAnteriorId: result.source.droppableId,
        }),
      });
      carregarDados(); // Recarregar para sincronizar
    } catch {
      toast.error("Erro ao mover card");
      carregarDados();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Pipeline de Vendas</h2>
          <p className="text-sm text-slate-400 mt-1">
            {oportunidades.length} oportunidades ativas
          </p>
        </div>
        <button
          onClick={() => toast.success("Modal de nova oportunidade (implementar)")}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Oportunidade
        </button>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 min-h-[70vh]">
          {colunas
            .sort((a, b) => a.ordem - b.ordem)
            .map((coluna) => {
              const cards = oportunidades.filter(
                (o) => o.pipelineColunaId === coluna.id
              );
              const isColunaOrcamento = coluna.nome.includes("Pendente Envio");

              return (
                <div
                  key={coluna.id}
                  className="flex-shrink-0 w-80 flex flex-col bg-slate-900/50 border border-slate-800 rounded-2xl"
                >
                  {/* Cabeçalho */}
                  <div
                    className="px-4 py-3 border-b border-slate-800 flex items-center justify-between"
                    style={{ borderTopColor: coluna.cor }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: coluna.cor }}
                      />
                      <h3 className="font-semibold text-white text-sm">
                        {coluna.nome}
                      </h3>
                    </div>
                    <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full text-slate-400 font-medium">
                      {cards.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <Droppable droppableId={coluna.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                          "flex-1 p-3 space-y-3 overflow-y-auto transition-colors min-h-[100px]",
                          snapshot.isDraggingOver && "bg-slate-800/30"
                        )}
                      >
                        {cards.map((card, index) => (
                          <Draggable
                            key={card.id}
                            draggableId={card.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={cn(
                                  "bg-slate-800 border border-slate-700/50 rounded-xl p-4 transition-all hover:border-slate-600",
                                  snapshot.isDragging &&
                                    "shadow-2xl shadow-blue-500/20 rotate-2 scale-105 border-blue-500/50",
                                  isColunaOrcamento &&
                                    card.diasNaColuna >= 3 &&
                                    "border-red-500/30 bg-red-500/5",
                                  isColunaOrcamento &&
                                    card.diasNaColuna >= 1 &&
                                    card.diasNaColuna < 3 &&
                                    "border-amber-500/30 bg-amber-500/5"
                                )}
                              >
                                {/* Badge Tipo de Negócio */}
                                <div className="flex items-center gap-2 mb-3">
                                  <span
                                    className={cn(
                                      "text-xs font-bold px-2 py-0.5 rounded-full",
                                      card.tipoNegocio === "PONTOS_MILHAS"
                                        ? "bg-purple-500/20 text-purple-300"
                                        : "bg-emerald-500/20 text-emerald-300"
                                    )}
                                  >
                                    {card.tipoNegocio === "PONTOS_MILHAS"
                                      ? "✈️ Pontos & Milhas"
                                      : "💰 Venda Normal"}
                                  </span>
                                  {card.programaFidelidade && (
                                    <span
                                      className="text-xs px-2 py-0.5 rounded-full text-white"
                                      style={{
                                        backgroundColor:
                                          card.programaFidelidade.corIdentificadora +
                                          "30",
                                        color:
                                          card.programaFidelidade.corIdentificadora,
                                      }}
                                    >
                                      {card.programaFidelidade.nome}
                                    </span>
                                  )}
                                </div>

                                {/* Título */}
                                <h4 className="font-semibold text-white text-sm mb-2">
                                  {card.titulo}
                                </h4>

                                {/* Cliente */}
                                <div className="flex items-center gap-2 mb-2 text-xs text-slate-400">
                                  <User className="w-3.5 h-3.5" />
                                  <span>{card.cliente.nome}</span>
                                </div>

                                {/* Valor */}
                                {card.valorEstimado && (
                                  <p className="text-sm font-bold text-blue-400 mb-2">
                                    {formatCurrency(card.valorEstimado)}
                                  </p>
                                )}

                                {/* Footer */}
                                <div className="flex items-center justify-between text-xs text-slate-500 mt-3 pt-3 border-t border-slate-700/50">
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span
                                      className={cn(
                                        card.diasNaColuna >= 3 && "text-red-400",
                                        card.diasNaColuna >= 1 &&
                                          card.diasNaColuna < 3 &&
                                          "text-amber-400"
                                      )}
                                    >
                                      {card.diasNaColuna}d
                                    </span>
                                  </div>
                                  {card.responsavel && (
                                    <span>{card.responsavel.name}</span>
                                  )}
                                </div>

                                {/* Tags */}
                                {card.tags && (
                                  <div className="flex gap-1 mt-2 flex-wrap">
                                    {card.tags.split(",").map((tag) => (
                                      <span
                                        key={tag}
                                        className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300"
                                      >
                                        {tag.trim()}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
        </div>
      </DragDropContext>

      {/* Modal de Encerramento */}
      {modalEncerramento && (
        <ModalEncerramento
          coluna={modalEncerramento.coluna}
          oportunidadeId={modalEncerramento.oportunidadeId}
          onClose={() => setModalEncerramento(null)}
          onConfirm={async () => {
            setModalEncerramento(null);
            await carregarDados();
            toast.success("Card movido com sucesso!");
          }}
        />
      )}
    </>
  );
}

// ─── Modal de Encerramento ──────────────────────────

function ModalEncerramento({
  coluna,
  oportunidadeId,
  onClose,
  onConfirm,
}: {
  coluna: string;
  oportunidadeId: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [form, setForm] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  const isFechamento = coluna.includes("Fechamento") && !coluna.includes("Negociação");
  const isPerdida = coluna.includes("Negociação Perdida");
  const isFutura = coluna.includes("Negociação Futura");

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await fetch(`/api/pipeline/oportunidades/${oportunidadeId}/encerrar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coluna, ...form }),
      });
      onConfirm();
    } catch {
      toast.error("Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className={cn(
          "w-full max-w-md rounded-2xl border-2 p-6",
          isFechamento
            ? "bg-slate-900 border-pink-500/50"
            : isPerdida
            ? "bg-slate-900 border-red-500/50"
            : "bg-slate-900 border-amber-500/50"
        )}
      >
        {/* Badge */}
        <div
          className={cn(
            "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-4",
            isFechamento
              ? "bg-pink-500/20 text-pink-300"
              : isPerdida
              ? "bg-red-500/20 text-red-300"
              : "bg-amber-500/20 text-amber-300"
          )}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          AÇÃO NECESSÁRIA
        </div>

        <h3 className="text-xl font-bold text-white mb-1">
          {isFechamento
            ? "Informações de Fechamento"
            : isPerdida
            ? "Negociação Perdida"
            : "Negociação Futura"}
        </h3>
        <p className="text-sm text-slate-400 mb-6">
          Preencha os campos obrigatórios para concluir a movimentação.
        </p>

        {isFechamento && (
          <div className="space-y-4">
            <SelectField
              label="Forma de Pagamento"
              options={[
                "Dinheiro",
                "PIX",
                "Cartão de Crédito",
                "Parcelado",
                "Milhas + Dinheiro",
              ]}
              value={form.formaPagamento}
              onChange={(v) => setForm({ ...form, formaPagamento: v })}
              required
            />
            <InputField
              label="Valor Final Fechado (R$)"
              type="number"
              value={form.valorFinalFechado}
              onChange={(v) => setForm({ ...form, valorFinalFechado: v })}
              required
            />
            <InputField
              label="Prazo para Pagamento"
              type="date"
              value={form.prazoPagamento}
              onChange={(v) => setForm({ ...form, prazoPagamento: v })}
              required
            />
            <InputField
              label="Documentação Pendente"
              value={form.documentacaoPendente}
              onChange={(v) => setForm({ ...form, documentacaoPendente: v })}
              placeholder="Passaporte, visto..."
            />
            <textarea
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm"
              rows={2}
              placeholder="Observações de fechamento"
              value={form.observacoesFechamento || ""}
              onChange={(e) =>
                setForm({ ...form, observacoesFechamento: e.target.value })
              }
            />
          </div>
        )}

        {isPerdida && (
          <div className="space-y-4">
            <SelectField
              label="Motivo da Perda"
              options={["Preço", "Concorrência", "Desistência", "Sem contato", "Outro"]}
              value={form.motivoPerda}
              onChange={(v) => setForm({ ...form, motivoPerda: v })}
              required
            />
            <textarea
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm"
              rows={2}
              placeholder="Detalhamento do motivo"
              value={form.detalhamentoPerda || ""}
              onChange={(e) =>
                setForm({ ...form, detalhamentoPerda: e.target.value })
              }
            />
            <SelectField
              label="Cliente aceita contato futuro?"
              options={["Sim", "Não"]}
              value={form.aceitaContatoFuturo}
              onChange={(v) =>
                setForm({ ...form, aceitaContatoFuturo: v === "Sim" })
              }
            />
          </div>
        )}

        {isFutura && (
          <div className="space-y-4">
            <SelectField
              label="Motivo do Adiamento"
              options={[
                "Cliente pediu prazo",
                "Aguardando definição de datas",
                "Aguardando orçamento familiar",
                "Outro",
              ]}
              value={form.motivoAdiamento}
              onChange={(v) => setForm({ ...form, motivoAdiamento: v })}
              required
            />
            <InputField
              label="Data Prevista para Retomada"
              type="date"
              value={form.dataRetomada}
              onChange={(v) => setForm({ ...form, dataRetomada: v })}
              required
            />
            <textarea
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm"
              rows={2}
              placeholder="Observações"
              value={form.observacoesAdiamento || ""}
              onChange={(e) =>
                setForm({ ...form, observacoesAdiamento: e.target.value })
              }
            />
          </div>
        )}

        {/* Botões */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className={cn(
              "flex-1 py-2.5 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50",
              isFechamento
                ? "bg-pink-600 hover:bg-pink-700"
                : isPerdida
                ? "bg-red-600 hover:bg-red-700"
                : "bg-amber-600 hover:bg-amber-700"
            )}
          >
            {saving ? "Salvando..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Componentes auxiliares do modal ────────────────

function InputField({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  value: any;
  onChange: (v: any) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-white text-sm focus:border-blue-500 transition-colors"
      />
    </div>
  );
}

function SelectField({
  label,
  options,
  value,
  onChange,
  required,
}: {
  label: string;
  options: string[];
  value: any;
  onChange: (v: any) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-white text-sm focus:border-blue-500 transition-colors"
      >
        <option value="">Selecione...</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
