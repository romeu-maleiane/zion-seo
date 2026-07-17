import { BlockStack, Text, Button, Card, InlineStack, ProgressBar } from "@shopify/polaris";
import { PLAN_CREDITS, normalizePlan } from "app/constants/planCredits";

interface CardAiSeoOptimizerType {
  activePlan: string | null;
  aiCredits: number | null;
}

function CardAiSeoOptimizer({ activePlan, aiCredits }: CardAiSeoOptimizerType) {
  const plan = normalizePlan(activePlan);
  const creditLimit = PLAN_CREDITS[plan];
  const availableCredits = Math.max(0, Math.min(aiCredits ?? 0, creditLimit));
  const usedCredits = creditLimit - availableCredits;
  const progressPercentage = Math.round((usedCredits / creditLimit) * 100);

  return (
    <Card>
      <BlockStack gap="200">
        <InlineStack align="space-between" blockAlign="start">
          <div>
            <Text as="h3" variant="headingSm" fontWeight="bold">AI SEO Optimizer</Text>
            <Text as="p" variant="bodyMd" fontWeight="regular">({creditLimit.toLocaleString()} AI credits)</Text>
          </div>
          <Button variant="primary" url="/app/billing">Increase limit</Button>
        </InlineStack>

        <BlockStack gap="100">
          <Text as="p" variant="bodyMd" fontWeight="regular">
            {usedCredits.toLocaleString()}/{creditLimit.toLocaleString()} Credits used
          </Text>
          <ProgressBar progress={progressPercentage} size="small" />
        </BlockStack>
      </BlockStack>
    </Card>
  );
}

export default CardAiSeoOptimizer;