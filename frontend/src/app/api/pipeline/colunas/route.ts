import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const colunas = await prisma.pipelineColuna.findMany({
    orderBy: { ordem: "asc" },
  });

  return NextResponse.json(colunas);
}
