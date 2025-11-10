import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "~/lib/utils";

interface Experiment {
  id: string;
  name: string;
  path: string;
}

const experiments: Experiment[] = [
  { id: "ai-tweet-creator", name: "AI Tweet Creator", path: "/ai-tweet-creator" },
];

interface ExperimentsLayoutProps {
  children: React.ReactNode;
}

export function ExperimentsLayout({ children }: ExperimentsLayoutProps) {
  const router = useRouterState();
  const currentPath = router.location.pathname;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-14 items-center px-4">
          <h1 className="text-lg font-semibold">Text Exploration</h1>
        </div>
      </header>

      <div className="flex flex-1">
        <main className="flex-1 overflow-y-auto p-6">{children}</main>

        <aside className="border-l bg-muted/20 w-64 p-4">
          <div className="sticky top-4">
            <h2 className="mb-4 text-sm font-semibold text-muted-foreground">
              Experiments
            </h2>
            <nav className="flex flex-col gap-1">
              {experiments.map((experiment) => {
                const isActive = currentPath === experiment.path;
                return (
                  <Link
                    key={experiment.id}
                    to={experiment.path}
                    className={cn(
                      "rounded-md px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {experiment.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>
      </div>
    </div>
  );
}
