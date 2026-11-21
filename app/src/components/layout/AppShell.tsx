import type { ReactNode } from "react";
import { TopNav } from "./TopNav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <TopNav />
      <main className="app-main">{children}</main>
    </div>
  );
}
