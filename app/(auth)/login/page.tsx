import { TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { signIn } from "@/app/actions/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center bg-midnight px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl">
        <div className="mb-8 flex items-center gap-3 text-midnight">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-midnight text-white">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Growth OS</h1>
            <p className="text-xs text-slate-deep/70">Portail de pilotage PME</p>
          </div>
        </div>

        <form action={signIn} className="space-y-4">
          <input type="hidden" name="next" value={next ?? ""} />
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div>
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
          {error && (
            <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
          )}
          <Button type="submit" className="w-full">
            Se connecter
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-deep/60">
          Compte client créé par votre consultant Growth OS.
        </p>
      </div>
    </main>
  );
}
