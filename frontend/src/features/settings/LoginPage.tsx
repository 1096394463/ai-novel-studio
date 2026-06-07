import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { LogIn, UserPlus, AlertCircle } from "lucide-react";

export function LoginPage() {
  const { login, register, isLoading, error, clearError } = useAuthStore();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    nickname: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      if (mode === "login") {
        await login(form.username, form.password);
      } else {
        if (form.password !== form.confirmPassword) {
          alert("两次密码不一致");
          return;
        }
        await register(form.username, form.email, form.password, form.nickname || undefined);
      }
    } catch {
      // Error shown via store
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm border p-8">
        <h2 className="text-2xl font-bold text-center mb-6">
          {mode === "login" ? "登录账号" : "注册账号"}
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          {mode === "login"
            ? "登录后可使用云端备份和恢复功能"
            : "注册后即可使用云端备份功能"}
        </p>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm p-3 rounded-md mb-4">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">用户名</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              minLength={3}
            />
          </div>

          {mode === "register" && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">邮箱</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">昵称（可选）</label>
                <input
                  type="text"
                  value={form.nickname}
                  onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">密码</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              minLength={6}
            />
          </div>

          {mode === "register" && (
            <div>
              <label className="block text-sm font-medium mb-1">确认密码</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                minLength={6}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white rounded-md py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? (
              "处理中..."
            ) : mode === "login" ? (
              <>
                <LogIn size={16} /> 登录
              </>
            ) : (
              <>
                <UserPlus size={16} /> 注册
              </>
            )}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-500">
          {mode === "login" ? (
            <span>
              还没有账号？{" "}
              <button onClick={() => setMode("register")} className="text-blue-600 hover:underline">
                注册
              </button>
            </span>
          ) : (
            <span>
              已有账号？{" "}
              <button onClick={() => setMode("login")} className="text-blue-600 hover:underline">
                登录
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
