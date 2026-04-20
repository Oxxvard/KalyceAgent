-- Catalogue d'étapes Local → National → International
-- Le `weight` pondère l'impact d'une étape dans le Scalability Score.

insert into public.checklist_templates (stage, position, title, description, weight) values
  ('local', 1, 'Structure juridique constituée', 'SAS / SARL immatriculée, statuts à jour, pacte d''associés', 2),
  ('local', 2, 'Comptabilité externalisée', 'Cabinet comptable engagé, plan comptable adapté au secteur', 1),
  ('local', 3, 'Premier client récurrent signé', 'Au moins un contrat de revenu mensuel récurrent (MRR)', 3),
  ('local', 4, 'Site web v1 + identité de marque', 'Présence en ligne professionnelle, charte graphique, hébergement stable', 1),
  ('local', 5, 'KPIs mensuels suivis', 'Tableau de bord financier (CA, trésorerie, marge) mis à jour chaque mois', 2),
  ('local', 6, 'Process commercial documenté', 'Pipeline CRM, scripts de prospection, taux de conversion mesuré', 2),

  ('national', 1, 'Marque déposée INPI', 'Protection de la marque sur les classes pertinentes', 2),
  ('national', 2, 'Équipe ≥ 5 ETP avec organigramme', 'Structuration RH, fiches de poste, premier middle management', 3),
  ('national', 3, 'CRM industrialisé', 'HubSpot/Salesforce/Pipedrive piloté, données propres, automations', 2),
  ('national', 4, 'Présence multi-villes', 'Couverture commerciale ou opérationnelle au-delà de la région d''origine', 2),
  ('national', 5, 'Financement consolidé', 'Levée Series Seed, dette bancaire structurée ou autofinancement positif 12 mois', 3),
  ('national', 6, 'Conformité RGPD documentée', 'DPO désigné, registre des traitements, mentions légales conformes', 1),
  ('national', 7, 'Contrats cadres standardisés', 'CGV/CGU validées juridiquement, modèles de contrats versionnés', 1),

  ('international', 1, 'Étude de marché par pays cible', 'Analyse concurrentielle, pricing local, persona, go-to-market', 2),
  ('international', 2, 'Entité étrangère ou agent local', 'Filiale, succursale ou agent commercial dans le marché cible', 3),
  ('international', 3, 'Site web traduit (EN minimum)', 'Version anglaise complète, SEO international', 2),
  ('international', 4, 'Conformité internationale', 'GDPR (UE), CCPA (US), TVA intra-UE / sales tax selon zones', 2),
  ('international', 5, 'Partenariats cross-border', 'Au moins 1 partenariat distributeur/intégrateur signé hors France', 2),
  ('international', 6, 'Équipe multilingue', 'Au moins un référent commercial et un référent support multilingues', 2),
  ('international', 7, 'Devises et paiements multidevises', 'Comptes multidevises, processeur de paiement international', 1);
