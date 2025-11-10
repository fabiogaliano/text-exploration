import { createFileRoute, Link } from "@tanstack/react-router";
import { api } from "../../convex/_generated/api";
import { ThemeToggle } from "~/components/theme-toggle";
import { Button } from "~/components/ui/button";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-10 p-2">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-3xl font-bold sm:text-4xl">React TanStarter</h1>
        <div className="text-foreground/80 flex items-center gap-2 text-sm max-sm:flex-col">
          This is an unprotected page:
          <pre className="bg-card text-card-foreground rounded-md border p-1">
            routes/index.tsx
          </pre>
        </div>
      </div>

      <Button type="button" asChild className="mb-2 w-fit" size="lg">
        <Link to="/dashboard">Go to Dashboard</Link>
      </Button>

      <div className="flex flex-col items-center gap-2">
        <p className="text-foreground/80 max-sm:text-xs">
          A minimal starter template for{" "}
          <a
            className="text-foreground group"
            href="https://tanstack.com/start/latest"
            target="_blank"
            rel="noreferrer noopener"
          >
            🏝️ <span className="group-hover:underline">TanStack Start</span>
          </a>
          .
        </p>
        <div className="flex items-center gap-3">
          <a
            className="text-foreground/80 hover:text-foreground underline max-sm:text-sm"
            href="https://github.com/dotnize/react-tanstarter"
            target="_blank"
            title="Template repository on GitHub"
            rel="noreferrer noopener"
          >
            dotnize/react-tanstarter
          </a>

          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
