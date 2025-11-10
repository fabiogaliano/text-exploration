import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(authenticated)/dashboard/")({
  component: DashboardIndex,
});

function DashboardIndex() {
  return (
    <div className="flex flex-col items-center gap-1">
      Dashboard index page
      <pre className="bg-card text-card-foreground rounded-md border p-1 text-xs">
        routes/(authenticated)dashboard/index.tsx
      </pre>
    </div>
  );
}
