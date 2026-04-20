import { Input, Label } from "@/components/ui/input";
import { signIn } from "@/app/actions/auth";
import { KalyceLogo } from "@/components/shell/kalyce-logo";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-4">
      {/* Subtle glow */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(230,196,136,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-[400px]">
        {/* Card */}
        <div className="rounded-2xl border border-line bg-ink-soft px-8 py-9 shadow-glow">
          <div className="mb-8 flex flex-col items-center gap-3">
            <KalyceLogo size="lg" />
            <div className="mt-1 text-center">
              <p className="text-[13px] text-muted">Portail de pilotage stratégique</p>
            </div>
          </div>

          <form action={signIn} className="space-y-4">
            <input type="hidden" name="next" value={next ?? ""} />
            <div>
              <Label htmlFor="email">Adresse email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="vous@entreprise.fr"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                required
              />
            </div>
            {error && (
              <p className="rounded-lg border border-ember/40 bg-ember/10 px-3 py-2.5 text-[12px] text-ember">
                {error}
              </p>
            )}
            <button
              type="submit"
              className="mt-1 w-full rounded-lg bg-gold py-3 text-[14px] font-semibold text-ink transition-colors hover:bg-gold-soft"
            >
              Se connecter
            </button>
          </form>

          <p className="mt-6 text-center text-[11px] text-muted">
            Accès réservé — compte créé par votre consultant Kalyce.
          </p>
        </div>
      </div>
    </main>
  );
}
