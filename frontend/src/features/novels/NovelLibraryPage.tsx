import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, BookOpen, Target, Flame, Clock } from "lucide-react";
import { useNovelStore } from "@/stores";

export function NovelLibraryPage() {
  const { novels, loading, error, fetchNovels } = useNovelStore();

  useEffect(() => {
    fetchNovels();
  }, [fetchNovels]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">书架</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" />
          新建作品
        </button>
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
            <span className="text-sm">今日目标</span>
          </div>
          <p className="text-2xl font-bold">0 / 2000</p>
        </div>
        <div className="p-4 bg-card rounded-lg border">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Flame className="w-4 h-4" />
            <span className="text-sm">连续写作</span>
          </div>
          <p className="text-2xl font-bold">0 天</p>
        </div>
        <div className="p-4 bg-card rounded-lg border">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm">待处理 AI</span>
          </div>
          <p className="text-2xl font-bold">0</p>
        </div>
      </div>

      {/* Novel List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {novels.map((novel) => (
          <Link
            key={novel.id}
            to={`/editor/${novel.id}`}
            className="block p-4 bg-card rounded-lg border hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-20 bg-muted rounded flex items-center justify-center">
                {novel.coverPath ? (
                  <img
                    src={novel.coverPath}
                    alt={novel.title}
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <BookOpen className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{novel.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {novel.genre}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full ${
                      novel.status === "serializing"
                        ? "bg-green-100 text-green-800"
                        : novel.status === "completed"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {novel.status === "serializing"
                      ? "连载中"
                      : novel.status === "completed"
                      ? "已完结"
                      : novel.status === "draft"
                      ? "草稿"
                      : novel.status}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {novel.totalWords.toLocaleString()} 字
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}

        {/* Empty State */}
        {novels.length === 0 && (
          <div className="col-span-full p-8 text-center text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>还没有作品，点击"新建作品"开始创作</p>
          </div>
        )}
      </div>
    </div>
  );
}
