import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticateAdminShop } from "app/utils/authenticatedShop.server";
import prisma from "app/db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const { shopId } = await authenticateAdminShop(request);
    const formData = await request.formData();
    const value = formData.get("creditsToBeSubtracted");

    if (typeof value !== "string") {
      return Response.json({ message: "Missing credit deduction" }, { status: 400 });
    }

    const credits = Number(value);
    if (!Number.isInteger(credits) || credits <= 0 || credits > 100) {
      return Response.json({ message: "Invalid credit deduction" }, { status: 400 });
    }

    const updated = await prisma.store.updateMany({
      where: { storeId: shopId, aiCredits: { gte: credits } },
      data: { aiCredits: { decrement: credits } },
    });

    if (updated.count !== 1) {
      return Response.json({ message: "Insufficient credits" }, { status: 409 });
    }

    const store = await prisma.store.findUniqueOrThrow({
      where: { storeId: shopId },
      select: { aiCredits: true },
    });

    return Response.json(store, { status: 200 });
  } catch (error) {
    console.error("Update aiCredits Error: ", error);
    return Response.json({ message: "An error occurred updating AI credits" }, { status: 500 });
  }
};