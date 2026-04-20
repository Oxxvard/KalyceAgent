# Growth OS

Portail hybride pour cabinet de conseil PME. Deux interfaces sur la même base :

- **`/admin`** — back-office consultant (saisie de données, validation des roadmaps, gestion multi-clients).
- **`/dashboard`** — front-office client (Scalability Score, courbes de croissance, progression, livrables).

## Stack

- **Next.js 15** (App Router, RSC)
- **Supabase** — Postgres + Auth (email/password) + Storage, cloisonné par **Row Level Security**
- **Tailwind CSS** — thème Business (bleu nuit `#0B1E3F`, ardoise, blanc)
- **lucide-react** + **recharts**
- **TypeScript** strict

## Phase 1 — livrée

| Domaine | Livrable |
|---|---|
| Schéma | 7 tables (`profiles`, `organizations`, `growth_metrics`, `checklist_templates`, `checklists`, `documents`, `scalability_scores`) + 4 enums + triggers `handle_new_user` / `touch_updated_at` |
| RLS | Policies par rôle (`consultant` voit tout, `client` voit son `organization_id`) — 2 helpers SQL `current_role()` / `current_org_id()` pour rester DRY |
| Storage | Bucket privé `documents` cloisonné par dossier `{organization_id}/...` |
| Algo | `lib/scalability-score.ts` — score /100 pondéré (40% financier, 30% opérationnel, 30% maturité) |
| Auth | Middleware Next.js qui rafraîchit la session puis redirige selon `profiles.role` |
| Seed | 1 consultant + 1 client + 1 PME démo + 3 trimestres de métriques |

## Setup local

Pré-requis : Node 20+, Docker (pour la stack Supabase locale).

```bash
# 1. Dépendances
npm install

# 2. Stack Supabase locale (Postgres + GoTrue + Storage + Studio)
npx supabase start

# 3. Reset DB : applique les 4 migrations + supabase/seed.sql
npx supabase db reset

# 4. Variables d'env
cp .env.local.example .env.local
# Remplir NEXT_PUBLIC_SUPABASE_ANON_KEY et SUPABASE_SERVICE_ROLE_KEY
# (visibles via `npx supabase status`)

# 5. (Optionnel) Régénérer les types TS
npm run db:gen-types

# 6. Dev server
npm run dev
```

Studio Supabase : <http://127.0.0.1:54323>
App : <http://localhost:3000>

### Comptes seed (mot de passe `growthos2026`)

- `consultant@growth-os.dev` → redirigé vers `/admin`
- `client@growth-os.dev` → redirigé vers `/dashboard`

## Tests

```bash
npm run test:score    # tests unitaires du Scalability Score
npm run type-check    # vérification TypeScript
```

## Vérification RLS

Dans le SQL Editor du Studio :

```sql
-- Sous l'identité du client démo, la requête ne doit retourner que SON organisation
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000002';
select * from organizations;
```

## Arborescence

```
app/                    # Next.js App Router (placeholders Phase 2)
  (auth)/login
  (admin)/admin
  (client)/dashboard
components/             # rempli en Phase 2
lib/
  scalability-score.ts  # algo pur, testable
  supabase/             # client browser + server + helper middleware
  utils.ts
middleware.ts           # redirection role-based
supabase/
  config.toml
  migrations/           # 4 migrations SQL
  seed.sql
types/database.ts       # types générés (placeholder pré-`db:gen-types`)
```

## Phase 2 — à venir

UI : login, layouts admin/client, formulaires de saisie, page Roadmap interactive, graphiques Recharts, upload Supabase Storage, route API `/api/scalability-score/[orgId]`.
