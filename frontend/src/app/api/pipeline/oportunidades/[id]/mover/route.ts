import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { novaColunaId, colunaAnteriorId } = await req.json();

  // Buscar nomes das colunas
  const [colunaAnterior, colunaNova] = await Promise.all([
    prisma.pipelineColuna.findUnique({ where: { id: colunaAnteriorId } }),
    prisma.pipelineColuna.findUnique({ where: { id: novaColunaId } }),
  ]);

  // Atualizar oportunidade
  await prisma.oportunidade.update({
    where: { id: params.id },
    data: {
      pipelineColunaId: novaColunaId,
      diasNaColuna: 0,
      ultimaAtualizacao: new Date(),
    },
  });

  // Registrar histórico
  await prisma.historicoPipeline.create({
    data: {
      oportunidadeId: params.id,
      colunaAnterior: colunaAnterior?.nome || "Desconhecida",
      colunaNova: colunaNova?.nome || "Desconhecida",
      usuarioId: session.user.id,
    },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "MOVER_CARD",
      entity: "Oportunidade",
      entityId: params.id,
      details: `${colunaAnterior?.nome} → ${colunaNova?.nome}`,
    },
  });

  return NextResponse.json({ success: true });
}
