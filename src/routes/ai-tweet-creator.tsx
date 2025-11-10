import { createFileRoute } from "@tanstack/react-router";
import { ExperimentsLayout } from "~/components/experiments-layout";
import { AiTweetCreator } from "~/components/ai-tweet-creator";

export const Route = createFileRoute("/ai-tweet-creator")({
  component: AiTweetCreatorPage,
});

function AiTweetCreatorPage() {
  return (
    <ExperimentsLayout>
      <AiTweetCreator />
    </ExperimentsLayout>
  );
}
