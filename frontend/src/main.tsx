import { useState } from "react";
import { createRoot } from "react-dom/client";
import { DashboardPage } from "./pages/DashboardPage";
import { DevicesPage } from "./pages/DevicesPage";
import { TasksPage } from "./pages/TasksPage";
import { HazardsPage } from "./pages/HazardsPage";
import { ReportsPage } from "./pages/ReportsPage";
import { routes } from "./router/routes";
import "./styles.css";

const pageComponents = {
  "/dashboard": DashboardPage,
  "/devices": DevicesPage,
  "/tasks": TasksPage,
  "/hazards": HazardsPage,
  "/reports": ReportsPage
} as const;

function App() {
  const [active, setActive] = useState<string>(routes[0]?.route ?? "/dashboard");
  const CurrentPage = pageComponents[active as keyof typeof pageComponents] ?? DashboardPage;

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
      </aside>
      <CurrentPage />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
