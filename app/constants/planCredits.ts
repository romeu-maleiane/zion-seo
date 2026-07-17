export const PLAN_CREDITS = {
  free: 20,
  starter: 1800,
  pro: 4500,
} as const;

export type PlanName = keyof typeof PLAN_CREDITS;

export function normalizePlan(plan: string | null | undefined): PlanName {
  return plan === "starter" || plan === "pro" || plan === "free" ? plan : "free";
}