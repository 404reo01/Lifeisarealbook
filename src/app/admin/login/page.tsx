"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Identifiants incorrects. Réessayez.");
      setLoading(false);
    } else {
      router.push("/admin");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/logo.png"
            alt="Sabbah de Babel"
            width={140}
            height={48}
            className="h-10 w-auto object-contain"
          />
        </div>

        {/* Card */}
        <div className="glass-strong border rounded-xl p-8">
          <h1 className="font-serif text-2xl font-normal text-center mb-1">
            Espace admin
          </h1>
          <p className="font-sans text-sm text-muted text-center mb-8">
            Connectez-vous pour accéder au tableau de bord.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="admin-label">Adresse e-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                placeholder="admin@sabbah.fr"
                className="admin-input"
              />
            </div>
            <div>
              <label className="admin-label">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="admin-input"
              />
            </div>

            {error && (
              <p className="font-sans text-sm text-red-400 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="admin-btn-primary w-full justify-center mt-2"
            >
              {loading ? (
                <><Loader2 size={14} className="animate-spin inline mr-1.5" />Connexion…</>
              ) : "Se connecter"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
