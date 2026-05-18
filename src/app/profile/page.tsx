"use client";

import Image from "next/image";

import { useCallback, useEffect, useState } from "react";

import AppLayout from "../../components/AppLayout";

import { createClient } from "../../lib/supabase/client";

export default function ProfilePage() {
  const supabase = createClient();

  const [fullName, setFullName] = useState("");

  const [avatarUrl, setAvatarUrl] = useState("");

  const [uploading, setUploading] = useState(false);

  const [saving, setSaving] = useState(false);

  const loadProfile = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) {
      setFullName(data.full_name || "");

      setAvatarUrl(data.avatar_url || "");
    }
  }, [supabase]);

  useEffect(() => {
    queueMicrotask(() => {
      loadProfile();
    });
  }, [loadProfile]);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true);

      const file = event.target.files?.[0];

      if (!file) return;

      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

      if (!allowedTypes.includes(file.type)) {
        alert("Formato inválido");

        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        alert("Imagem muito grande (máx 2MB)");

        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const fileExt = file.name.split(".").pop();

      const fileName = `${crypto.randomUUID()}.${fileExt}`;

      const filePath = `${user.id}/${fileName}`;

      const { error } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error(error);

        alert("Erro no upload");

        return;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

      setAvatarUrl(data.publicUrl);
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  }

  async function saveProfile() {
    try {
      setSaving(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: fullName,
        avatar_url: avatarUrl,
      });

      if (error) {
        console.error(error);

        alert("Erro ao salvar perfil");

        return;
      }

      alert("Perfil salvo!");
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppLayout>
      <main className="min-h-screen bg-zinc-950 p-4 text-white md:p-6">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 md:p-8">
            <h1 className="text-4xl font-bold">Meu Perfil</h1>

            <p className="mt-2 text-zinc-400">Gerencie suas informações</p>

            <div className="mt-10 flex flex-col items-center">
              <div className="relative h-40 w-40 overflow-hidden rounded-full border-4 border-zinc-800 bg-zinc-800">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="Avatar"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-5xl">
                    👤
                  </div>
                )}
              </div>

              <label className="mt-5 cursor-pointer rounded-2xl bg-white px-6 py-3 font-semibold text-black transition hover:opacity-90">
                {uploading ? "Enviando..." : "Enviar foto"}

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="mt-10">
              <label className="mb-2 block text-sm text-zinc-400">
                Nome completo
              </label>

              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-2xl border border-zinc-700 bg-zinc-800 px-5 py-4 outline-none"
              />
            </div>

            <button
              onClick={saveProfile}
              disabled={saving}
              className="mt-8 w-full rounded-2xl bg-green-500 px-6 py-4 text-lg font-bold text-black transition hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Salvando..." : "Salvar perfil"}
            </button>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}
