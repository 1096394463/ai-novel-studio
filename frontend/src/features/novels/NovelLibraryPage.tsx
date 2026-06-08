import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  BookOpen,
  Target,
  Flame,
  Clock,
  X,
  Search,
} from "lucide-react";
import { useNovelStore } from "@/stores";

const statusLabels: Record<string, string> = {
  setting: "设定中",
  draft: "草稿",
  serializing: "连载中",
  paused: "暂停",
  completed: "已完结",
  locked: "锁定",
};

const statusColors: Record<string, string> = {
  setting: "bg-gray-100 text-gray-800",
  draft: "bg-yellow-100 text-yellow-800",
  serializing: "bg-green-100 text-green-800",
  paused: "bg-orange-100 text-orange-800",
  completed: "bg-blue-100 text-blue-800",
  locked: "bg-red-100 text-red-800",
};

export function NovelLibraryPage() {
  const { novels, loading, error, fetchNovels, createNovel, setCurrentNovelId } = useNovelStore();
  const navigate = useNavigate();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newNovel, setNewNovel] = useState({
    title: "",
    genre: "",
    synopsis: "",
    targetDailyWords: 2000,
  });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchNovels();
  }, [fetchNovels]);

  const handleCreateNovel = async () => {
    if (!newNovel.title.trim()) return;
    try {
      const novel = await createNovel({
        title: newNovel.title.trim(),
 genre: newNovel.genre || "其他",
        synopsis: newNovel.synopsis,
        targetDailyWords: newNovel.targetDailyWords,
        status: "draft",
      });
      setShowCreateDialog(false);
      setNewNovel({ title: "", genre: "", synopsis: "", targetDailyWords: 2000 });
      setCurrentNovelId(novel.id);
      navigate(`/editor/${novel.id}`);
    } catch (error) {
      console.error("Failed to create novel:", error);
    }
  };

  const filteredNovels = novels.filter(
    (novel) =>
      novel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      novel.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalWords = novels.reduce((sum, n) => sum + n.totalWords, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="text-destructive text-center">
          <p className="text-lg font-semibold mb-1">加载失败</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
        <button
          onClick={() => fetchNovels()}
          className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">书架</h1>
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索作品..."
              className="pl-10 pr-4 py-2 border rounded-lg text-sm"
            />
          </div>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            新建作品
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-card rounded-lg border">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <BookOpen className="w-4 h-4" />
            <span className="text-sm">作品总数</span>
          </div>
          <p className="text-2xl font-bold">{novels.length}</p>
        </div>
        <div className="p-4 bg-card rounded-lg border">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Target className="w-4 h-4" />
            <span className="text-sm">总字数</span>
          </div>
          <p className="text-2xl font-bold">{totalWords.toLocaleString()}</p>
        </div>
        <div className="p-4 bg-card rounded-lg border">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Flame className="w-4 h-4" />
            <span className="text-sm">连载中</span>
          </div>
          <p className="text-2xl font-bold">
            {novels.filter((n) => n.status === "serializing").length}
          </p>
        </div>
        <div className="p-4 bg-card rounded-lg border">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm">草稿</span>
          </div>
          <p className="text-2xl font-bold">
            {novels.filter((n) => n.status === "draft").length}
          </p>
        </div>
      </div>

      {/* Novel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredNovels.map((novel) => (
          <Link
            key={novel.id}
            to={`/editor/${novel.id}`}
            onClick={() => setCurrentNovelId(novel.id)}
            className="block p-4 bg-card rounded-lg border hover:shadow-md transition-all hover:border-primary/30 group"
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded flex items-center justify-center flex-shrink-0">
                {novel.coverPath ? (
                  <img
                    src={novel.coverPath}
                    alt={novel.title}
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <BookOpen className="w-8 h-8 text-primary/40" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                  {novel.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {novel.genre || "未分类"}
                </p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full ${
                      statusColors[novel.status] || "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {statusLabels[novel.status] || novel.status}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {novel.totalWords.toLocaleString()} 字
                  </span>
                </div>
                {novel.synopsis && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                    {novel.synopsis}
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}

        {/* Empty State */}
        {filteredNovels.length === 0 && (
          <div className="col-span-full p-12 text-center text-muted-foreground">
            <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg mb-2">
              {searchQuery ? "没有找到匹配的作品" : "还没有作品"}
            </p>
            <p className="text-sm">
              {searchQuery
                ? "尝试其他关键词"
                : '点击"新建作品"开始创作'}
            </p>
          </div>
        )}
      </div>

      {/* Create Novel Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg shadow-lg w-[500px]">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">新建作品</h3>
              <button
                onClick={() => setShowCreateDialog(false)}
                className="p-1 rounded hover:bg-accent"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-sm font-medium">作品名称 *</label>
                <input
                  type="text"
                  value={newNovel.title}
                  onChange={(e) =>
                    setNewNovel({ ...newNovel, title: e.target.value })
                  }
                  placeholder="输入作品名称"
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-sm font-medium">类型</label>
                <select
                  value={newNovel.genre}
                  onChange={(e) =>
                    setNewNovel({ ...newNovel, genre: e.target.value })
                  }
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                >
                  <option value="">选择类型</option>
                  <option value="玄幻">玄幻</option>
                  <option value="仙侠">仙侠</option>
                  <option value="都市">都市</option>
                  <option value="历史">历史</option>
                  <option value="科幻">科幻</option>
                  <option value="悬疑">悬疑</option>
                  <option value="言情">言情</option>
                  <option value="武侠">武侠</option>
                  <option value="奇幻">奇幻</option>
                  <option value="其他">其他</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">简介</label>
                <textarea
                  value={newNovel.synopsis}
                  inputMode="text"
                  onChange={(e) =>
                    setNewNovel({ ...newNovel, synopsis: e.target.value })
                  }
                  placeholder="简要描述作品内容..."
                  className="w-full mt-1 px-3 py-2 border rounded-md resize-none"
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  每日目标字数
                </label>
                <input
                  type="number"
                  value={newNovel.targetDailyWords}
                  onChange={(e) =>
                    setNewNovel({
                      ...newNovel,
                      targetDailyWords: parseInt(e.target.value) || 2000,
                    })
                  }
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <button
                onClick={() => setShowCreateDialog(false)}
                className="px-4 py-2 text-sm border rounded hover:bg-accent"
              >
                取消
              </button>
              <button
                onClick={handleCreateNovel}
                disabled={!newNovel.title.trim()}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
