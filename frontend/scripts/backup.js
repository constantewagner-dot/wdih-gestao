import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..", "..");

const dbPath = path.join(rootDir, "database", "wdih.db");
const backupDir = path.join(rootDir, "backups");

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupFile = `backup-${timestamp}.db`;
const backupPath = path.join(backupDir, backupFile);

if (fs.existsSync(dbPath)) {
  fs.copyFileSync(dbPath, backupPath);
  const size = fs.statSync(backupPath).size;
  console.log(`✅ Backup criado: ${backupFile} (${(size / 1024).toFixed(1)} KB)`);
} else {
  console.error("❌ Banco de dados não encontrado em:", dbPath);
  process.exit(1);
}
