interface UpdateCreditsType {
  creditsToBeSubtracted: number;
}

export const updateAiCredits = async ({ creditsToBeSubtracted }: UpdateCreditsType) => {
  try {
    const formData = new FormData();
    formData.append("creditsToBeSubtracted", creditsToBeSubtracted.toString());

    const res = await fetch("/app/api/update-ai-credits", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Update aiCredits failed");
    return await res.json();
  } catch (error) {
    console.error("Update aiCredits error: ", error);
    return null;
  }
};