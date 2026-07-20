import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";

const execAsync = promisify(exec);

export async function POST(req: Request) {
  try {
    // Verificar se já existe configuração
    const existingConfig = await prisma.systemConfig.findFirst();
    if (existingConfig?.setupDone) {
      return NextResponse.json(
        { error: "Sistema já configurado" },
        { status: 400 }
      );
    }

    const { name, email, password, agencyName } = await req.json();

    if (!name || !email || !password || !agencyName) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Criar admin
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    // Configurar sistema
    await prisma.systemConfig.create({
      data: {
        agencyName,
        setupDone: true,
        adminEmail: email,
      },
    });

    // Criar colunas padrão do pipeline
    const colunas = [
      { nome: "Lead / Primeiro Contato", ordem: 1, cor: "#8B5CF6" },
      { nome: "Qualificação", ordem: 2, cor: "#3B82F6" },
      { nome: "Alinhamento de Roteiro", ordem: 3, cor: "#06B6D4" },
      { nome: "Pendente Envio Orçamento", ordem: 4, cor: "#F59E0B" },
      { nome: "Orçamento Enviado", ordem: 5, cor: "#10B981" },
      { nome: "Negociação", ordem: 6, cor: "#6366F1" },
      { nome: "Fechamento", ordem: 7, cor: "#EC4899" },
      { nome: "Pagamento Confirmado", ordem: 8, cor: "#22C55E" },
      { nome: "Negociação Perdida", ordem: 9, cor: "#EF4444" },
      { nome: "Negociação Futura", ordem: 10, cor: "#F97316" },
    ];

    for (const coluna of colunas) {
      await prisma.pipelineColuna.create({ data: coluna });
    }

    // Criar serviços padrão
    const servicosPadrao = [
      { nome: "Seguro Viagem", tipo: "SERVICO", precoBase: 0, comissaoPadrao: 15 },
      { nome: "Aluguel de Carro", tipo: "SERVICO", precoBase: 0, comissaoPadrao: 10 },
      { nome: "Translado", tipo: "SERVICO", precoBase: 0, comissaoPadrao: 10 },
      { nome: "Passeios", tipo: "SERVICO", precoBase: 0, comissaoPadrao: 12 },
      { nome: "Passagem Aérea", tipo: "PRODUTO", precoBase: 0, comissaoPadrao: 5 },
      { nome: "Hospedagem", tipo: "PRODUTO", precoBase: 0, comissaoPadrao: 8 },
      { nome: "Pacote Completo", tipo: "PRODUTO", precoBase: 0, comissaoPadrao: 10 },
    ];

    for (const s of servicosPadrao) {
      await prisma.servicoOferecido.create({ data: s });
    }

    // Criar backup inicial
    const backupDir = path.join(process.cwd(), "..", "backups");
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const dbPath = path.join(process.cwd(), "..", "database", "wdih.db");
    const backupPath = path.join(backupDir, `backup-inicial-${timestamp}.db`);

    if (fs.existsSync(dbPath)) {
      fs.copyFileSync(dbPath, backupPath);
    }

    await prisma.backupLog.create({
      data: {
        filename: `backup-inicial-${timestamp}.db`,
        size: fs.existsSync(backupPath) ? fs.statSync(backupPath).size : 0,
        type: "AUTOMATICO",
        status: "SUCESSO",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Setup error:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao configurar sistema" },
      { status: 500 }
    );
  }
}
