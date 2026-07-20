# WDIH Gestão — Sistema de Gestão para Agência de Viagens

Sistema web full-stack para gestão completa da agência **WDIH Milhas & Viagens**.

## 🚀 Stack

- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Banco:** SQLite (Prisma ORM)
- **Autenticação:** NextAuth.js v5
- **Kanban:** @hello-pangea/dnd
- **Gráficos:** Recharts

## 📦 Instalação

```bash
# 1. Clone o repositório
git clone <repo-url>
cd wdih-gestao

# 2. Instale as dependências
cd frontend
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas configurações

# 4. Execute as migrations
npx prisma migrate dev --name init

# 5. Inicie o sistema
npm run dev
