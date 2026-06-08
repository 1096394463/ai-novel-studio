import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { LoginPage } from "./LoginPage";
import { BackupPage } from "./BackupPage";

export function SettingsPage() {
  const { isLoggedIn, checkAuth, error } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth().finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">加载中…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-destructive mb-2">加载失败: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 border rounded"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginPage />;
  }

  return <BackupPage />;
}
