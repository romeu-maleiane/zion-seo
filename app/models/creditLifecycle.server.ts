import prisma from "app/db.server";
import { PLAN_CREDITS } from "app/constants/planCredits";

export type PaidPlan = Exclude<keyof typeof PLAN_CREDITS, "free">;

function nextCycleEnd(from: Date) {
  const next = new Date(from);
  next.setUTCMonth(next.getUTCMonth() + 1);
  return next;
}

export function planFromSubscription(name: string): PaidPlan | null {
  if (name === "Starter") return "starter";
  if (name === "Pro") return "pro";
  return null;
}

export async function startCreditCycle(storeId: string, plan: PaidPlan) {
  const now = new Date();
  return prisma.store.update({
    where: { storeId },
    data: {
      activePlan: plan,
      aiCredits: PLAN_CREDITS[plan],
      creditCycleEndsAt: nextCycleEnd(now),
      cancellationAt: null,
    },
  });
}

export async function reconcileCreditCycle(storeId: string) {
  return prisma.$transaction(async (tx) => {
    const store = await tx.store.findUnique({
      where: { storeId },
      select: { activePlan: true, creditCycleEndsAt: true, cancellationAt: true },
    });
    if (!store) return store;

    if (store.activePlan === "free") {
      return tx.store.update({
        where: { storeId },
        data: { aiCredits: PLAN_CREDITS.free },
      });
    }
    if (store.activePlan !== "starter" && store.activePlan !== "pro") return store;

    const now = new Date();
    if (!store.creditCycleEndsAt || store.creditCycleEndsAt > now) return store;

    if (store.cancellationAt) {
      return tx.store.update({
        where: { storeId },
        data: { activePlan: "free", aiCredits: PLAN_CREDITS.free, creditCycleEndsAt: null, cancellationAt: null },
      });
    }

    let creditCycleEndsAt = store.creditCycleEndsAt;
    while (creditCycleEndsAt <= now) creditCycleEndsAt = nextCycleEnd(creditCycleEndsAt);

    return tx.store.update({
      where: { storeId },
      data: { aiCredits: PLAN_CREDITS[store.activePlan], creditCycleEndsAt },
    });
  });
}

export async function scheduleCancellation(storeId: string) {
  const store = await prisma.store.findUnique({
    where: { storeId },
    select: { creditCycleEndsAt: true },
  });
  if (!store) return;

  if (!store.creditCycleEndsAt || store.creditCycleEndsAt <= new Date()) {
    await prisma.store.update({
      where: { storeId },
      data: { activePlan: "free", aiCredits: PLAN_CREDITS.free, creditCycleEndsAt: null, cancellationAt: null },
    });
    return;
  }

  await prisma.store.update({ where: { storeId }, data: { cancellationAt: new Date() } });
}