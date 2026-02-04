import { Building2, Sparkles, Users } from "lucide-react";

export type FeatureBlueprint = {
  title: string;
  detail: string;
  prompt: string;
};

export type PersonaBlueprint = {
  id: "developers" | "teams" | "enterprise";
  label: string;
  description: string;
  icon: typeof Sparkles;
  features: FeatureBlueprint[];
};

export const personaBlueprints: PersonaBlueprint[] = [
  {
    id: "developers",
    label: "Developers",
    description: "Feature ideas for solo builders and OSS contributors.",
    icon: Sparkles,
    features: [
      {
        title: "Repo health score",
        detail: "Summarize tests, lint, coverage, and security signals in one snapshot.",
        prompt: "Generate a repo health score and explain the biggest risk to address first.",
      },
      {
        title: "Feature impact planner",
        detail: "Estimate effort by mapping touched files and dependencies.",
        prompt: "Map the files and dependencies needed to add billing for a Pro plan.",
      },
      {
        title: "Inline change briefs",
        detail: "Generate commit summaries and upgrade guides from diffs.",
        prompt: "Summarize the last 5 commits and call out any breaking changes.",
      },
    ],
  },
  {
    id: "teams",
    label: "Teams",
    description: "Feature ideas for product and engineering teams.",
    icon: Users,
    features: [
      {
        title: "Shared knowledge base",
        detail: "Pin canonical answers and onboarding checklists per repo.",
        prompt: "Draft an onboarding checklist for this repo and list the first 3 tasks.",
      },
      {
        title: "Review-ready insights",
        detail: "Auto-create pull request checklists and risk summaries.",
        prompt: "Create a PR review checklist tailored to this codebase.",
      },
      {
        title: "Release readiness",
        detail: "Track breaking changes, migrations, and rollout steps.",
        prompt: "Identify release risks and suggest a rollout plan for the next release.",
      },
    ],
  },
  {
    id: "enterprise",
    label: "Enterprise",
    description: "Feature ideas for large orgs and compliance teams.",
    icon: Building2,
    features: [
      {
        title: "Compliance report packs",
        detail: "Bundle security, license, and audit reports on demand.",
        prompt: "Generate a compliance report pack covering security and license risks.",
      },
      {
        title: "Portfolio visibility",
        detail: "Monitor multiple repos with consolidated health dashboards.",
        prompt: "Outline the top 5 metrics to track across all repos in this org.",
      },
      {
        title: "Guardrail policies",
        detail: "Enforce architecture and dependency rules at scale.",
        prompt: "List guardrail policies to prevent risky dependency upgrades.",
      },
    ],
  },
];
