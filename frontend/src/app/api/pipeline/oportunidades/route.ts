import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const oportunidades = await prisma.oportunidade.findMany({
    include: {
      cliente: { select: { id: true, nome: true } },
      programaFidelidade: {
        select: { nome: true, corIdentificadora: true },
      },
      responsavel: { select: { name: true, avatarUrl: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(oportunidades);
}
