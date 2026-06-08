import { Outlet, Link, useLocation } from "react-router-dom";
import {
  BookOpen,
  PenTool,
  Globe,
  GitBranch,
  Send,
  Settings,
} from "lucide-react";
import { useNovelStore } from "@/stores";

export function Layout() {
  const location = useLocation();
  const currentNovelId = useNovelStore((s) => s.currentNovelId);

  const navItems = [
    { name: "书架", href: "/", icon: BookOpen },
    {
      name: "写作",
      href: currentNovelId ? `/editor/${currentNovelId}` : "/editor",
      icon: PenTool,
    },
    {
      name: "设定",
      href: currentNovelId ? `/world/${currentNovelId}` : "/world",
      icon: Globe,
    },
    {
      name: "图谱",
      href: currentNovelId ? `/graph/${currentNovelId}` : "/graph",
      icon: GitBranch,
    },
    { name: "发布", href: "/publishing", icon: Send },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-16 flex flex-col items-center py-4 border-r bg-card">
        <div className="mb-8">
          <BookOpen className="w-8 h-8 text-primary" />
        </div>
        <nav className="flex-1 flex flex-col items-center gap-4">
          {navItems.map((item) => {
            const baseHref = item.href.split("/").slice(0, 2).join("/") || "/";
            const isActive =
              location.pathname === item.href ||
              location.pathname.startsWith(baseHref + "/");
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`p-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
                title={item.name}
              >
                <item.icon className="w-5 h-5" />
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto">
          <Link
            to="/settings"
            className="p-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            title="设置"
          >
            <Settings className="w-5 h-5" />
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
