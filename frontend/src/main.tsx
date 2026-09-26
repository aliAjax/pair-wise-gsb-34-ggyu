import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { routes } from "./router/routes";
import { Roles, RoleText, type Role } from "./constants/roles";
import { useSessionStore } from "./stores/SessionStore";
import { DashboardPage } from "./pages/DashboardPage";
import { DevicesPage } from "./pages/DevicesPage";
import { TasksPage } from "./pages/TasksPage";
import { HazardsPage } from "./pages/HazardsPage";
import { ReportsPage } from "./pages/ReportsPage";
import "./styles.css";

const PAGES: Record<string, () => React.JSX.Element> = {
  "/dashboard": DashboardPage,
  "/devices": DevicesPage,
  "/tasks": TasksPage,
  "/hazards": HazardsPage,
  "/reports": ReportsPage
};

function RoleSwitcher() {
  const role = useSessionStore((s) => s.role);
  const setRole = useSessionStore((s) => s.setRole);
  return (
    <label className="role-switcher">
      当前角色
      <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
        {Roles.map((r) => (
          <option key={r} value={r}>{RoleText[r]}</option>
        ))}
      </select>
    </label>
  );
}

function App() {
  const [active, setActive] = useState<string>("/hazards");
  const current = routes.find((route) => route.route === active) ?? routes[0];
  const Page = PAGES[current?.route ?? "/hazards"] ?? HazardsPage;
  return (
    <div className="shell">
      <aside>
        <div className="brand">消防设施巡检维保平台</div>
        <nav>
          {routes.map((route) => (
            <button key={route.route} className={active === route.route ? "active" : ""} onClick={() => setActive(route.route)}>
              {route.name}
            </button>
          ))}
        </nav>
        <RoleSwitcher />
      </aside>
      <Page />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
