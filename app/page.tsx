// Landing : le middleware redirige selon l'état d'auth + le rôle.
// Si on arrive ici, c'est que le middleware n'a pas (encore) statué.
export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-slate-deep/70">Redirection en cours…</p>
    </main>
  );
}
