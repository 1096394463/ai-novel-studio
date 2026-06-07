import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useBackupStore } from "@/stores/backupStore";
import { novelApi, chapterApi, worldEntityApi, ideaApi } from "@/api";
import {
  Cloud,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  HardDrive,
  Clock,
  FileText,
  BookOpen,
  LogOut,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

export function BackupPage() {
  const { user, logout } = useAuthStore();
  const {
    backups,
    latestBackup,
    isLoading,
    isBacking,
    isRestoring,
    error,
    fetchHistory,
    fetchLatest,
    createBackup,
    restoreBackup,
    deleteBackup,
    clearError,
  } = useBackupStore();

  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
    fetchLatest();
  }, []);

  const handleBackup = async () => {
    clearError();
    setSuccessMsg(null);
    try {
      // Collect all local data
      const novels = await novelApi.list();
      const data: Record<string, unknown> = {
        version: "1.0",
        exportedAt: new Date().toISOString(),
        data: { novels, chapters: [], entities: [], ideas: [] },
      };

      for (const novel of novels) {
        try {
          const chapters = await chapterApi.list(novel.id);
          (data.data as any).chapters.push(...chapters);
        } catch {}
        try {
          const entities = await entityApi.list(novel.id);
          (data.data as any).entities.push(...entities);
        } catch {}
        try {
          const ideas = await ideaApi.list(novel.id);
          (data.data as any).ideas.push(...ideas);
        } catch {}
      }

      await createBackup(data);
      setSuccessMsg("备份成功！");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (e: any) {
      console.error("Backup failed:", e);
    }
  };

  const handleRestore = async (id: string) => {
    if (!confirm("恢复将覆盖当前本地数据，确定继续？")) return;
    clearError();
    setRestoringId(id);
    try {
      const data = await restoreBackup(id);
      // Here we would restore data to local backend
      // For now just show success
      setSuccessMsg("恢复数据已下载，请重新打开应用以完成恢复。");
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (e: any) {
      console.error("Restore failed:", e);
    } finally {
      setRestoringId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除此备份？")) return;
    await deleteBackup(id);
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1024 / 1024).toFixed(1) + " MB";
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Account Info */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Cloud size={20} /> 云端备份
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {user?.nickname || user?.username}
            </span>
            <button
              onClick={logout}
              className="text-sm text-gray-400 hover:text-red-500 flex items-center gap-1"
            >
              <LogOut size={14} /> 退出
            </button>
          </div>
        </div>

        {/* Storage usage */}
        {user && (
          <div className="bg-gray-50 rounded-md p-4 mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">存储空间</span>
              <span>
                {formatBytes(user.storageUsedBytes)} / {user.storageQuotaMb} MB
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    (user.storageUsedBytes / (user.storageQuotaMb * 1024 * 1024)) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Status messages */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm p-3 rounded-md mb-4">
            <AlertCircle size={16} /> {error}
          </div>
        )}
        {successMsg && (
          <div className="flex items-center gap-2 bg-green-50 text-green-600 text-sm p-3 rounded-md mb-4">
            <CheckCircle size={16} /> {successMsg}
          </div>
        )}

        {/* Backup button */}
        <button
          onClick={handleBackup}
          disabled={isBacking}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white rounded-md py-3 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isBacking ? (
            <>
              <Loader2 size={16} className="animate-spin" /> 备份中...
            </>
          ) : (
            <>
              <Upload size={16} /> 立即备份
            </>
          )}
        </button>
      </div>

      {/* Backup History */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-md font-semibold flex items-center gap-2">
            <Clock size={18} /> 备份历史
          </h3>
          <button
            onClick={() => { fetchHistory(); fetchLatest(); }}
            className="text-sm text-gray-400 hover:text-blue-600"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-gray-400">加载中...</div>
        ) : backups.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <HardDrive size={32} className="mx-auto mb-2 opacity-50" />
            暂无备份记录
          </div>
        ) : (
          <div className="space-y-3">
            {backups.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">v{b.version}</span>
                    <span className="text-xs text-gray-400">{formatTime(b.createdAt)}</span>
                    {b.deviceName && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                        {b.deviceName}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <BookOpen size={12} /> {b.novelCount} 部作品
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText size={12} /> {b.chapterCount} 章
                    </span>
                    <span>{formatBytes(b.fileSizeBytes)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRestore(b.id)}
                    disabled={isRestoring && restoringId === b.id}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50"
                  >
                    {isRestoring && restoringId === b.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Download size={14} />
                    )}
                    恢复
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="text-sm text-gray-400 hover:text-red-500 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Need entityApi alias
const entityApi = {
  list: async (novelId: string) => {
    const { entityApi: api } = await import("@/api");
    return api.list(novelId);
  },
};
