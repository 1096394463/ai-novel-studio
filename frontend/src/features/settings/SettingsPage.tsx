import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { LoginPage } from "./LoginPage";
import { BackupPage } from "./BackupPage";

export function SettingsPage() {
  const { isLoggedIn, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  if (!isLoggedIn) {
    return <LoginPage />;
  }

  return <BackupPage />;
}
