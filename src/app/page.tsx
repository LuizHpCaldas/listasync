"use client";

import Link from "next/link";

import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-zinc-950 text-white">
      <section className="relative mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 0.15, y: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_45%)]"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <span className="rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-400">
            🛒 Organize suas compras de forma inteligente
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="mt-8 max-w-5xl text-5xl font-black leading-tight md:text-7xl"
        >
          Gerencie listas de compras com IA e colaboração em tempo real
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7 }}
          className="mx-auto mt-8 max-w-2xl text-lg text-zinc-400 md:text-xl"
        >
          Crie listas, acompanhe gastos, compartilhe com sua família e tenha
          relatórios inteligentes sobre seu consumo mensal.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link
            href="/login"
            className="rounded-2xl bg-white px-8 py-4 text-lg font-bold text-black transition hover:scale-105 hover:opacity-90"
          >
            Começar agora
          </Link>

          <Link
            href="/premium"
            className="rounded-2xl border border-zinc-700 bg-zinc-900 px-8 py-4 text-lg font-semibold transition hover:border-zinc-500 hover:bg-zinc-800"
          >
            Conhecer Premium
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 1 }}
          className="mt-24 grid w-full max-w-6xl gap-6 md:grid-cols-3"
        >
          <motion.div
            whileHover={{ y: -6, scale: 1.02 }}
            className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-8 backdrop-blur"
          >
            <div className="text-4xl">📊</div>

            <h2 className="mt-5 text-2xl font-bold">Analytics Inteligente</h2>

            <p className="mt-3 text-zinc-400">
              Descubra onde você mais gasta e receba relatórios automáticos.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -6, scale: 1.02 }}
            className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-8 backdrop-blur"
          >
            <div className="text-4xl">👨‍👩‍👧‍👦</div>

            <h2 className="mt-5 text-2xl font-bold">Compartilhamento</h2>

            <p className="mt-3 text-zinc-400">
              Compartilhe listas com família e amigos em tempo real.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -6, scale: 1.02 }}
            className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-8 backdrop-blur"
          >
            <div className="text-4xl">⚡</div>

            <h2 className="mt-5 text-2xl font-bold">Rápido e Moderno</h2>

            <p className="mt-3 text-zinc-400">
              Interface moderna, responsiva e otimizada para celular.
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="pointer-events-none absolute -bottom-40 h-96 w-96 rounded-full bg-white blur-3xl"
        />
      </section>
    </main>
  );
}
