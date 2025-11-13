import { createFileRoute } from "@tanstack/react-router";
import { ExperimentsLayout } from "~/components/experiments-layout";
import { ReadingTutor } from "~/components/reading-tutor";

export const Route = createFileRoute("/reading-tutor")({
  component: ReadingTutorPage,
});

function ReadingTutorPage() {
  return (
    <ExperimentsLayout>
      <ReadingTutor />
    </ExperimentsLayout>
  );
}
