import prisma from "app/db.server";
import { PLAN_CREDITS } from "app/constants/planCredits";

export type PaidPlan = Exclude<keyof typeof PLAN_CREDITS, "free">;
export type SubscriptionStatus = "none" | "active" | "cancel_scheduled" | "expired";

function fallbackCycleEnd(from: Date) {
  const next = new Date(from);
  next.setUTCMonth(next.getUTCMonth() + 1);
  return next;
}

function validFuturePeriodEnd(value: Date | string | null | undefined) {
  if (!value) return null;
  const periodEnd = new Date(value);
  return Number.isNaN(periodEnd.valueOf()) || periodEnd <= new Date() ? null : periodEnd;
}

export function planFromSubscription(name: string): PaidPlan | null {
  if (name === "Starter") return "starter";
  if (name === "Pro") return "pro";
  return null;
}

export async function startCreditCycle(storeId: string, plan: PaidPlan, subscription?: { id: string; currentPeriodEnd?: string | Date | null }) {
  const now = new Date();
  return prisma.store.update({
    where: { storeId },
    data: {
      activePlan: plan,
      aiCredits: PLAN_CREDITS[plan],
      creditCycleEndsAt: validFuturePeriodEnd(subscription?.currentPeriodEnd) ?? fallbackCycleEnd(now),
      cancellationAt: null,
      shopifySubscriptionId: subscription?.id,
      subscriptionStatus: "active",
    },
  });
}

export async function syncActiveSubscription(storeId: string, plan: PaidPlan, subscription: { id: string; currentPeriodEnd?: string | Date | null }) {
  const store = await prisma.store.findUnique({
    where: { storeId },
    select: { activePlan: true, shopifySubscriptionId: true, subscriptionStatus: true, creditCycleEndsAt: true },
  });
  if (store?.activePlan === plan && store.shopifySubscriptionId === subscription.id && store.subscriptionStatus === "active" && store.creditCycleEndsAt && store.creditCycleEndsAt > new Date()) {
    const creditCycleEndsAt = validFuturePeriodEnd(subscription.currentPeriodEnd);
    if (creditCycleEndsAt) {
      return prisma.store.update({ where: { storeId }, data: { creditCycleEndsAt } });
    }
    return store;
  }
  return startCreditCycle(storeId, plan, subscription);
}
/** Enforces the persisted access end date. Cancellation never downgrades early. */
export async function reconcileCreditCycle(storeId: string) {
  return prisma.$transaction(async (tx) => {
    const store = await tx.store.findUnique({
      where: { storeId },
      select: { activePlan: true, creditCycleEndsAt: true, cancellationAt: true, subscriptionStatus: true },
    });
    if (!store) return store;
    if (store.activePlan === "free") {
      return tx.store.update({ where: { storeId }, data: { aiCredits: PLAN_CREDITS.free } });
    }
    if (store.activePlan !== "starter" && store.activePlan !== "pro") return store;

    const now = new Date();
    if (!store.creditCycleEndsAt || store.creditCycleEndsAt > now) return store;
    if (store.cancellationAt || store.subscriptionStatus === "cancel_scheduled") {
      return tx.store.update({
        where: { storeId },
        data: {
          activePlan: "free",
          aiCredits: PLAN_CREDITS.free,
          creditCycleEndsAt: null,
          cancellationAt: null,
          shopifySubscriptionId: null,
          subscriptionStatus: "expired",
        },
      });
    }

    let creditCycleEndsAt = store.creditCycleEndsAt;
    while (creditCycleEndsAt <= now) creditCycleEndsAt = fallbackCycleEnd(creditCycleEndsAt);

    return tx.store.update({
      where: { storeId },
      data: { aiCredits: PLAN_CREDITS[store.activePlan], creditCycleEndsAt },
    });
  });
}

export async function scheduleCancellation(
  storeId: string,
  subscription: { id: string; currentPeriodEnd?: string | Date | null },
  options: { force?: boolean } = {},
) {
  const currentPeriodEnd = validFuturePeriodEnd(subscription.currentPeriodEnd);
  if (!currentPeriodEnd) throw new Error("Shopify did not provide a future subscription end date");

  const store = await prisma.store.findUnique({
    where: { storeId },
    select: { shopifySubscriptionId: true },
  });
  // Ignore a delayed cancellation event for a subscription already replaced by a new one.
  if (!options.force && store?.shopifySubscriptionId && store.shopifySubscriptionId !== subscription.id) return false;

  await prisma.store.update({
    where: { storeId },
    data: {
      creditCycleEndsAt: currentPeriodEnd,
      cancellationAt: new Date(),
      shopifySubscriptionId: subscription.id,
      subscriptionStatus: "cancel_scheduled",
    },
  });
  return true;
}