import { useEffect, useState } from "react";
import { ideaApi } from "@/api";
import { Plus, Trash2, Lightbulb, X } from "lucide-react";
import type { Idea } from "@/types";

export function InspirationPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ideaApi.listGlobal().then(setIdeas).catch((e) => setError(e.message));
  }, []);

  const handleCreate = async () => {
    if (!title.trim() && !content.trim()) return;
    try {
      const idea = await ideaApi.createGlobal({
        title: title.trim() || "无标题灵感",
        content: content.trim(),
      });
      setIdeas([idea, ...ideas]);
      setTitle("");
      setContent("");
      setShowCreate(false);
    } catch (error: any) {
      setError(error.message || "创建灵感失败");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await ideaApi.delete(id);
      setIdeas(ideas.filter((i) => i.id !== id));
    } catch (error: any) {
      setError(error.message || "删除灵感失败");
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Lightbulb className="w-6 h-6 text-yellow-500" />
            <h1 className="text-2xl font-bold">灵感池</h1>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            记录灵感
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-destructive/10 text-destructive px-4 py-2 rounded-md flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
          </div>
        )}

        {showCreate && (
          <div className="mb-6 p-4 border rounded-lg bg-card">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="灵感标题（可选）"
              className="w-full mb-3 px-3 py-2 border rounded-md"
              autoFocus
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="记录你的灵感..."
              className="w-full px-3 py-2 border rounded-md resize-none"
              rows={4}
            />
            <div className="flex justify-end gap-2 mt-3">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm border rounded">取消</button>
              <button
                onClick={handleCreate}
                disabled={!title.trim() && !content.trim()}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded disabled:opacity-50"
              >
                保存
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {ideas.map((idea) => (
            <div key={idea.id} className="p-4 border rounded-lg bg-card hover:shadow-sm transition-shadow group">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium">{idea.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{idea.content}</p>
                  <span className="text-xs text-muted-foreground mt-2 inline-block">
                    {idea.createdAt ? new Date(idea.createdAt).toLocaleDateString() : ""}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(idea.id)}
                  className="p-1.5 rounded opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {ideas.length === 0 && !showCreate && (
            <div className="text-center py-12">
              <Lightbulb className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">随时记录灵感，点击上方"记录灵感"开始</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
