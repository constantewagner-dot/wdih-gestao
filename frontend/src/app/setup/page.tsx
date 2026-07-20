"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plane, Key, User, Building2, Mail, Lock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agencyName: "WDIH Milhas & Viagens",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Nome obrigatório";
    if (!form.email.trim()) errs.email = "Email obrigatório";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Email inválido";
    if (!form.password) errs.password = "Senha obrigatória";
    else if (form.password.length < 6) errs.password = "Mínimo 6 caracteres";
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Senhas não conferem";
    if (!form.agencyName.trim()) errs.agencyName = "Nome da agência obrigatório";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Setup concluído! Redirecionando...");
        router.push("/login");
      } else {
        const data = await res.json();
        toast.error(data.error || "Erro ao configurar");
      }
    } catch {
      toast.error("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 mb-4">
            <Plane className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">WDIH Gestão</h1>
          <p className="text-slate-400 mt-1">Configuração Inicial</p>
        </div>

        {/* Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                  s <= step
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700 text-slate-500"
                )}
              >
                {s < step ? "✓" : s}
              </div>
              {s < 3 && (
                <div
                  className={cn(
                    "w-12 h-0.5 mx-1 transition-all",
                    s < step ? "bg-blue-600" : "bg-slate-700"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <User className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-white">
                  Dados do Administrador
                </h2>
              </div>
              <InputField
                label="Nome completo"
                value={form.name}
                onChange={(v) => setForm({ ...form, name: v })}
                error={errors.name}
                icon={User}
                placeholder="Seu nome"
              />
              <InputField
                label="E-mail"
                type="email"
                value={form.email}
                onChange={(v) => setForm({ ...form, email: v })}
                error={errors.email}
                icon={Mail}
                placeholder="admin@wdih.com.br"
              />
              <InputField
                label="Senha"
                type="password"
                value={form.password}
                onChange={(v) => setForm({ ...form, password: v })}
                error={errors.password}
                icon={Lock}
                placeholder="••••••••"
              />
              <InputField
                label="Confirmar Senha"
                type="password"
                value={form.confirmPassword}
                onChange={(v) => setForm({ ...form, confirmPassword: v })}
                error={errors.confirmPassword}
                icon={Lock}
                placeholder="••••••••"
              />
              <button
                onClick={() => {
                  if (form.name && form.email && form.password && form.confirmPassword) {
                    if (form.password !== form.confirmPassword) {
                      setErrors({ confirmPassword: "Senhas não conferem" });
                      return;
                    }
                    setErrors({});
                    setStep(2);
                  } else {
                    validate();
                  }
                }}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
              >
                Continuar
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-white">
                  Dados da Agência
                </h2>
              </div>
              <InputField
                label="Nome da Agência"
                value={form.agencyName}
                onChange={(v) => setForm({ ...form, agencyName: v })}
                error={errors.agencyName}
                icon={Building2}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <Key className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-white">Confirmar</h2>
              </div>

              <div className="bg-slate-900/50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Admin:</span>
                  <span className="text-white font-medium">{form.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Email:</span>
                  <span className="text-white font-medium">{form.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Agência:</span>
                  <span className="text-white font-medium">{form.agencyName}</span>
                </div>
              </div>

              <p className="text-slate-400 text-xs text-center">
                Após confirmar, o banco de dados será inicializado com as
                configurações padrão.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Configurando...
                    </>
                  ) : (
                    "Finalizar Setup"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  error,
  icon: Icon,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  icon?: React.ElementType;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1.5">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "w-full bg-slate-900/50 border rounded-xl py-2.5 text-white placeholder:text-slate-600 transition-colors",
            Icon ? "pl-10 pr-3" : "px-3",
            error
              ? "border-red-500/50 focus:border-red-500"
              : "border-slate-700/50 focus:border-blue-500"
          )}
        />
      </div>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}
