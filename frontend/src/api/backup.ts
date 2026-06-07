// Backup server API client
const BACKEND_URL = import.meta.env.VITE_BACKUP_URL || "http://localhost:8443/api";

let accessToken: string | null = localStorage.getItem("accessToken");
let refreshToken: string | null = localStorage.getItem("refreshToken");

function setTokens(access: string, refresh: string) {
  accessToken = access;
  refreshToken = refresh;
  localStorage.setItem("accessToken", access);
  localStorage.setItem("refreshToken", refresh);
}

function clearTokens() {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

async function request<T>(
  path: string,
  options?: RequestInit & { raw?: boolean }
): Promise<T> {
  const headers: Record<string, string> = {
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...((options?.headers as Record<string, string>) || {}),
  };

  // Don't set Content-Type for FormData
  if (!(options?.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  let response = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers,
  });

  // Try refresh on 401
  if (response.status === 401 && refreshToken) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      headers.Authorization = `Bearer ${accessToken}`;
      response = await fetch(`${BACKEND_URL}${path}`, { ...options, headers });
    }
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: "请求失败" }));
    throw new Error(err.message || `HTTP ${response.status}`);
  }

  if (options?.raw) {
    return response as unknown as T;
  }

  return response.json();
}

async function tryRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) {
      clearTokens();
      return false;
    }
    const data = await res.json();
    if (data.success && data.data) {
      setTokens(data.data.accessToken, data.data.refreshToken);
      return true;
    }
    clearTokens();
    return false;
  } catch {
    clearTokens();
    return false;
  }
}

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  nickname: string;
  storageQuotaMb: number;
  storageUsedBytes: number;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  username: string;
  nickname: string;
}

export interface BackupInfo {
  id: string;
  version: number;
  fileSizeBytes: number;
  novelCount: number;
  chapterCount: number;
  totalWords: number;
  checksum: string;
  createdAt: string;
  deviceId?: string;
  deviceName?: string;
}

export interface DeviceInfo {
  id: string;
  deviceName: string;
  deviceType: string;
  lastSeenAt?: string;
  lastBackupAt?: string;
  createdAt: string;
}

// Auth API
export const authApi = {
  register: (data: { username: string; email: string; password: string; nickname?: string }) =>
    request<{ success: boolean; data: TokenResponse }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }).then((r) => {
      if (r.data) setTokens(r.data.accessToken, r.data.refreshToken);
      return r;
    }),

  login: (data: { username: string; password: string }) =>
    request<{ success: boolean; data: TokenResponse }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }).then((r) => {
      if (r.data) setTokens(r.data.accessToken, r.data.refreshToken);
      return r;
    }),

  logout: () => {
    clearTokens();
  },

  me: () => request<{ success: boolean; data: UserInfo }>("/auth/me"),

  isLoggedIn: () => !!accessToken,
};

// Backup API
export const backupApi = {
  upload: async (jsonContent: string, deviceId?: string) => {
    const blob = new Blob([jsonContent], { type: "application/json" });
    const formData = new FormData();
    formData.append("file", blob, "backup.json");
    if (deviceId) formData.append("deviceId", deviceId);
    return request<{ success: boolean; data: BackupInfo }>("/backup", {
      method: "POST",
      body: formData,
    });
  },

  latest: () =>
    request<{ success: boolean; data: BackupInfo }>("/backup/latest"),

  history: (page = 0, size = 20) =>
    request<{ success: boolean; data: { content: BackupInfo[]; totalElements: number } }>(
      `/backup/history?page=${page}&size=${size}`
    ),

  download: (id: string) =>
    request<Response>(`/backup/${id}/download`, { raw: true }).then((r) =>
      (r as unknown as Response).json()
    ),

  delete: (id: string) =>
    request<{ success: boolean }>(`/backup/${id}`, { method: "DELETE" }),
};

// Device API
export const deviceApi = {
  list: () =>
    request<{ success: boolean; data: DeviceInfo[] }>("/devices"),

  register: (deviceName: string, deviceType: string) =>
    request<{ success: boolean; data: DeviceInfo }>("/devices", {
      method: "POST",
      body: JSON.stringify({ deviceName, deviceType }),
    }),

  remove: (id: string) =>
    request<{ success: boolean }>(`/devices/${id}`, { method: "DELETE" }),
};
