"use client";

import { useState } from "react";
import { createClient } from "../../lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Login realizado!");
  }

  async function handleRegister() {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Conta criada!");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">
        <h1 className="mb-2 text-4xl font-bold text-white">ListaSync</h1>

        <p className="mb-8 text-zinc-400">
          Controle inteligente das suas compras
        </p>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-3 text-white outline-none transition focus:border-zinc-500"
          />

          <input
            type="password"
            placeholder="Sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-3 text-white outline-none transition focus:border-zinc-500"
          />

          <button
            onClick={handleLogin}
            className="w-full rounded-lg bg-white p-3 font-semibold text-black transition hover:opacity-90"
          >
            Entrar
          </button>

          <button
            onClick={handleRegister}
            className="w-full rounded-lg border border-zinc-700 p-3 font-semibold text-white transition hover:bg-zinc-800"
          >
            Criar conta
          </button>
        </div>
      </div>
    </div>
  );
}
