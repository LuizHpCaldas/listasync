"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  MessageCircle,
  ShoppingCart,
  Store,
  Users,
  Sparkles,
  BarChart3,
  Check,
} from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-black text-white">
      {/* BACKGROUND */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-violet-600/15 blur-[180px]" />

        <div className="absolute right-0 top-40 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[140px]" />

        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-fuchsia-600/10 blur-[140px]" />
      </div>

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="ListaSync"
              width={42}
              height={42}
              priority
            />

            <span className="text-xl font-bold tracking-tight">ListaSync</span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
            <a href="#features" className="hover:text-white">
              Recursos
            </a>

            <a href="#premium" className="hover:text-white">
              Premium
            </a>
          </nav>

          <Link
            href="/login"
            className="rounded-xl border border-zinc-800 px-5 py-3 text-sm font-medium transition hover:border-zinc-600"
          >
            Entrar
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-24">
        <div className="grid items-center gap-20 lg:grid-cols-2">
          {/* LEFT */}
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-sm text-violet-300">
              <Sparkles size={14} className="mr-2" />
              IA para economia doméstica
            </div>

            <h1
              className="
mt-8
text-4xl
font-black
leading-[1]
tracking-tight
sm:text-5xl
md:text-6xl
lg:text-7xl"
            >
              Economize mais.
              <br />
              Organize tudo.
              <br />
              Compre melhor.
            </h1>

            <p className="mt-8 max-w-xl text-lg leading-relaxed text-zinc-400 md:text-xl">
              O ListaSync combina listas compartilhadas, mensagens em tempo
              real, histórico de preços e inteligência artificial para ajudar
              sua família a gastar menos e comprar melhor.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 font-bold text-black transition hover:scale-105"
              >
                Começar gratuitamente
                <ArrowRight size={18} />
              </Link>

              <Link
                href="#premium"
                className="rounded-2xl border border-zinc-800 bg-zinc-900 px-8 py-4 font-semibold transition hover:border-violet-500"
              >
                Conhecer Premium
              </Link>
            </div>

            <div className="mt-16 grid grid-cols-3 gap-8">
              <div>
                <h3 className="text-3xl font-black text-violet-400">+34%</h3>

                <p className="mt-1 text-sm text-zinc-500">economia média</p>
              </div>

              <div>
                <h3 className="text-3xl font-black">12.500+</h3>

                <p className="mt-1 text-sm text-zinc-500">listas criadas</p>
              </div>

              <div>
                <h3 className="text-3xl font-black text-green-400">R$184</h3>

                <p className="mt-1 text-sm text-zinc-500">economia sugerida</p>
              </div>
            </div>
          </motion.div>

          {/* RIGHT */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 rounded-[40px] bg-violet-600/20 blur-3xl" />

            <div className="relative rounded-[40px] border border-white/10 bg-zinc-900/80 p-8 shadow-2xl backdrop-blur-xl">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-500">Dashboard Inteligente</p>

                  <h3 className="text-2xl font-bold">Economia em tempo real</h3>
                </div>

                <Brain className="text-violet-400" />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <MetricCard
                  title="Gastos"
                  value="R$ 1.294"
                  color="text-green-400"
                  subtitle="-14% este mês"
                />

                <MetricCard
                  title="Economia"
                  value="R$ 184"
                  color="text-violet-400"
                  subtitle="Detectada pela IA"
                />

                <MetricCard
                  title="Produtos"
                  value="312"
                  color="text-blue-400"
                  subtitle="Monitorados"
                />
              </div>

              <div className="mt-6 rounded-3xl border border-zinc-800 bg-black p-6">
                <p className="mb-4 text-sm text-zinc-500">
                  Insight Inteligente
                </p>

                <p className="leading-relaxed text-zinc-300">
                  Você gastou 18% mais em bebidas neste mês. Comprando no
                  mercado com melhor custo-benefício, poderia economizar
                  aproximadamente R$ 48 nesta categoria.
                </p>
              </div>

              <div className="mt-8 space-y-4">
                <Progress value="85%" />
                <Progress value="62%" />
                <Progress value="93%" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-black">Tudo que você precisa</h2>

          <p className="mt-4 text-zinc-400">
            Menos aplicativos. Mais organização.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={<ShoppingCart />}
            title="Listas Inteligentes"
            description="Crie listas rápidas e organizadas."
          />

          <FeatureCard
            icon={<Users />}
            title="Compartilhamento"
            description="Toda a família sincronizada."
          />

          <FeatureCard
            icon={<MessageCircle />}
            title="Mensagens"
            description="Converse sem sair do app."
          />

          <FeatureCard
            icon={<Store />}
            title="Mercados"
            description="Compare preços facilmente."
          />
        </div>
      </section>

      {/* PREMIUM */}
      <section id="premium" className="mx-auto max-w-7xl px-6 pb-32">
        <div className="overflow-hidden rounded-[40px] border border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 via-zinc-900 to-black p-12">
          <span className="font-semibold tracking-widest text-yellow-400">
            LISTASYNC PREMIUM
          </span>

          <h2 className="mt-4 text-4xl font-black md:text-6xl">
            Transforme dados em economia.
          </h2>

          <p className="mt-6 max-w-3xl text-lg text-zinc-400">
            O Premium utiliza inteligência artificial para analisar hábitos,
            identificar desperdícios, comparar mercados automaticamente e gerar
            relatórios avançados para sua família.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <PremiumItem text="IA detecta oportunidades de economia" />
            <PremiumItem text="Histórico completo de preços" />
            <PremiumItem text="Comparação automática entre mercados" />
            <PremiumItem text="Relatórios financeiros avançados" />
            <PremiumItem text="Estatísticas detalhadas de consumo" />
            <PremiumItem text="Planejamento inteligente de compras" />
          </div>

          <div className="mt-12">
            <Link
              href="/premium"
              className="inline-flex items-center gap-2 rounded-2xl bg-yellow-400 px-8 py-4 font-bold text-black transition hover:scale-105"
            >
              Conhecer Premium
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  color,
}: {
  title: string;
  value: string;
  subtitle: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-black p-5">
      <p className="text-sm text-zinc-500">{title}</p>

      <h4 className="mt-2 text-3xl font-black">{value}</h4>

      <span className={`text-sm ${color}`}>{subtitle}</span>
    </div>
  );
}

function Progress({ value }: { value: string }) {
  return (
    <div className="h-3 w-full rounded-full bg-zinc-800">
      <div
        className="h-3 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
        style={{ width: value }}
      />
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-8 transition hover:-translate-y-1 hover:border-violet-500/40">
      <div className="text-violet-400">{icon}</div>

      <h3 className="mt-4 text-xl font-bold">{title}</h3>

      <p className="mt-3 text-zinc-400">{description}</p>
    </div>
  );
}

function PremiumItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-black/40 p-5">
      <Check size={18} className="text-yellow-400" />

      <span>{text}</span>
    </div>
  );
}
