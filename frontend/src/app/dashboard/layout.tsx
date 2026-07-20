"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import {
  Plane,
  LayoutDashboard,
  Users,
  KanbanSquare,
  DollarSign,
  PlaneTakeoff,
  Settings,
  MessageCircle,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
  Database,
  ChevronDown,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    section: "Principal",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Pipeline Kanban", href: "/pipeline", icon: KanbanSquare },
    ],
  },
  {
    section: "Gestão",
    items: [
      { label: "Clientes (CRM)", href: "/clientes", icon: Users },
      { label: "Financeiro", href: "/financeiro", icon: DollarSign },
      { label: "Viagens", href: "/viagens", icon: PlaneTakeoff },
    ],
  },
  {
    section: "Ferramentas",
    items: [
      { label: "WhatsApp", href: "/whatsapp", icon: MessageCircle },
      { label: "Backups", href: "/backups", icon: Database },
      { label: "Configurações", href: "/configuracoes", icon: Settings },
    ],
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Plane className="w-8 h-8 text-blue-400 animate-bounce" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300",
          sidebarOpen ? "w-64" : "w-20",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0 lg:relative"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-800">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
            <Plane className="w-5 h-5 text-white" />
          </div>
          {sidebarOpen && (
            <span className="font-bold text-white text-sm leading-tight">
              WDIH
              <br />
              Milhas & Viagens
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {menuItems.map((section) => (
            <div key={section.section}>
              {sidebarOpen && (
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3">
                  {section.section}
                </p>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                        isActive
                          ? "bg-blue-600/20 text-blue-400"
                          : "text-slate-400 hover:text-white hover:bg-slate-800"
                      )}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {sidebarOpen && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-slate-800 p-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
              {session?.user?.name?.charAt(0) || "U"}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {session?.user?.name}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {session?.user?.role === "ADMIN" ? "Admin" : "Agente"}
                </p>
              </div>
            )}
            <button
              onClick={() => signOut()}
              className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        {/* Topbar */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:block p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-white">
              {menuItems
                .flatMap((s) => s.items)
                .find((i) => pathname === i.href || pathname.startsWith(i.href + "/"))
                ?.label || "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </div>
  );
}
