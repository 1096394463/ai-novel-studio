import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import {
  Save,
  Lock,
  Unlock,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Highlighter,
  Link as LinkIcon,
  Plus,
  Trash2,
  RotateCcw,
  ChevronDown,
  Wand2,
  BookOpen,
  AlertTriangle,
  Lightbulb,
  X,
  Check,
} from "lucide-react";
import { useNovelStore, useChapterStore } from "@/stores";
import { aiApi, chapterApi, novelApi } from "@/api";
import type { ChapterVersion, AiTask } from "@/types";

export function EditorPage() {
  const { novelId } = useParams<{ novelId: string }>();
  const navigate = useNavigate();
  const { currentNovel, fetchNovel } = useNovelStore();
  const {
    chapters,
    currentChapter,
    fetchChapters,
    fetchChapter,
    createChapter,
    updateChapter,
    saveChapter,
  } = useChapterStore();

  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(
    null
  );
  const [isContentReady, setIsContentReady] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaving, setShowSaving] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [versions, setVersions] = useState<ChapterVersion[]>([]);
  const [showNewChapter, setShowNewChapter] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [aiTask, setAiTask] = useState<AiTask | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiResult, setShowAiResult] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const forceSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (novelId) {
      fetchNovel(novelId);
      fetchChapters(novelId);
      setSelectedChapterId(null); // Reset when switching novels
      setIsContentReady(false);
    }
  }, [novelId, fetchNovel, fetchChapters]);

  useEffect(() => {
    if (chapters.length > 0 && !selectedChapterId) {
      setSelectedChapterId(chapters[0].id);
      fetchChapter(chapters[0].id);
    }
  }, [chapters, selectedChapterId, fetchChapter]);

  const handleSave = useCallback(
    async (content: { contentJson: string; contentText: string }) => {
      if (!selectedChapterId) return;
      setIsSaving(true);
      // Only show "saving" indicator if save takes > 500ms
      const timer = setTimeout(() => setShowSaving(true), 500);
      try {
        await saveChapter(selectedChapterId, content);
        setLastSaved(new Date());
        // Refresh chapter list to update word count
        if (novelId) {
          fetchChapters(novelId);
          novelApi.recalculateWords(novelId).catch(() => {});
        }
      } finally {
        clearTimeout(timer);
        setIsSaving(false);
        setShowSaving(false);
      }
    },
    [selectedChapterId, saveChapter]
  );

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "开始写作...",
      }),
      CharacterCount,
      Highlight,
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: currentChapter?.contentJson
      ? JSON.parse(currentChapter.contentJson)
      : "",
    onUpdate: ({ editor }) => {
      if (!isContentReady) return; // Don't save during content sync
      // Track selected text
      const { from, to } = editor.state.selection;
      const text = editor.state.doc.textBetween(from, to, "");
      setSelectedText(text);

      // Auto-save with debounce (800ms after last input)
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        const json = editor.getJSON();
        const text = editor.getText();
        handleSave({
          contentJson: JSON.stringify(json),
          contentText: text,
        });
      }, 800);
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      const text = editor.state.doc.textBetween(from, to, "");
      setSelectedText(text);
    },
  });

  // Sync editor content when chapter changes
  useEffect(() => {
    if (editor && currentChapter) {
      setIsContentReady(false);
      try {
        const content = currentChapter.contentJson
          ? JSON.parse(currentChapter.contentJson)
          : "";
        editor.commands.setContent(content);
      } catch {
        editor.commands.setContent("");
      }
      // Small delay to prevent auto-save from firing during content sync
      setTimeout(() => setIsContentReady(true), 300);
    }
  }, [editor, currentChapter?.id]);

  // Force save every 10 seconds
  useEffect(() => {
    forceSaveIntervalRef.current = setInterval(() => {
      if (editor && editor.isFocused && isContentReady) {
        const json = editor.getJSON();
        const text = editor.getText();
        handleSave({
          contentJson: JSON.stringify(json),
          contentText: text,
        });
      }
    }, 10000);

    return () => {
      if (forceSaveIntervalRef.current) {
        clearInterval(forceSaveIntervalRef.current);
      }
    };
  }, [editor, handleSave]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Update editor content when chapter changes
  useEffect(() => {
    if (editor && currentChapter) {
      const content = currentChapter.contentJson
        ? JSON.parse(currentChapter.contentJson)
        : "";
      editor.commands.setContent(content);
    }
  }, [editor, currentChapter?.id]);

  const handleChapterSelect = async (chapterId: string) => {
    setSelectedChapterId(chapterId);
    await fetchChapter(chapterId);
  };

  const handleCreateChapter = async () => {
    if (!novelId || !newChapterTitle.trim()) return;
    try {
      const chapter = await createChapter(novelId, {
        title: newChapterTitle.trim(),
        volumeId: chapters[0]?.volumeId || "",
        sortOrder: chapters.length,
      });
      setNewChapterTitle("");
      setShowNewChapter(false);
      setSelectedChapterId(chapter.id);
    } catch (error) {
      console.error("Failed to create chapter:", error);
    }
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (!confirm("确定删除此章节？")) return;
    try {
      await chapterApi.delete(chapterId);
      const remaining = chapters.filter((c) => c.id !== chapterId);
      if (selectedChapterId === chapterId) {
        // Clear editor immediately
        if (editor) {
          setIsContentReady(false);
          editor.commands.setContent("");
        }
        if (remaining.length > 0) {
          setSelectedChapterId(remaining[0].id);
          // Fetch fresh chapter data and update editor directly
          const fresh = await chapterApi.get(remaining[0].id);
          if (editor && fresh) {
            try {
              const content = fresh.contentJson ? JSON.parse(fresh.contentJson) : "";
              editor.commands.setContent(content);
            } catch { editor.commands.setContent(""); }
            setTimeout(() => setIsContentReady(true), 300);
          }
        } else {
          setSelectedChapterId(null);
          setIsContentReady(true);
        }
      }
      // Refresh chapter list + novel word count
      if (novelId) {
        fetchChapters(novelId);
        novelApi.recalculateWords(novelId).catch(() => {});
      }
    } catch (error: any) {
      alert(error.message || "删除章节失败");
    }
  };

  const handleToggleLock = async () => {
    if (!selectedChapterId || !currentChapter) return;
    try {
      if (currentChapter.locked) {
        await chapterApi.unlock(selectedChapterId);
      } else {
        await chapterApi.lock(selectedChapterId);
      }
      fetchChapter(selectedChapterId);
      if (novelId) fetchChapters(novelId);
    } catch (error: any) {
      alert(error.message || "锁定操作失败");
    }
  };

  const handleLoadVersions = async () => {
    if (!selectedChapterId) return;
    try {
      const data = await chapterApi.versions(selectedChapterId);
      setVersions(data);
      setShowVersions(true);
    } catch (error) {
      console.error("Failed to load versions:", error);
    }
  };

  const handleRestoreVersion = async (versionId: string) => {
    if (!selectedChapterId) return;
    try {
      await chapterApi.restoreVersion(selectedChapterId, versionId);
      // Fetch fresh chapter data directly and update editor
      const freshChapter = await chapterApi.get(selectedChapterId);
      if (editor && freshChapter) {
        setIsContentReady(false);
        try {
          const content = freshChapter.contentJson
            ? JSON.parse(freshChapter.contentJson)
            : "";
          editor.commands.setContent(content);
        } catch {
          editor.commands.setContent("");
        }
        setTimeout(() => setIsContentReady(true), 300);
      }
      if (novelId) fetchChapters(novelId);
      setShowVersions(false);
    } catch (error: any) {
      alert(error.message || "恢复版本失败");
    }
  };

  const handleUpdateTitle = async (title: string) => {
    if (!selectedChapterId) return;
    try {
      await updateChapter(selectedChapterId, { title });
    } catch (error) {
      console.error("Failed to update title:", error);
    }
  };

  // AI Functions
  const handleGrammarCheck = async () => {
    if (!selectedChapterId) return;
    setAiLoading(true);
    try {
      const result = await aiApi.grammarCheck({
        chapterId: selectedChapterId,
        text: selectedText || undefined,
      });
      setAiTask(result);
      setShowAiResult(true);
    } catch (error) {
      console.error("Grammar check failed:", error);
    } finally {
      setAiLoading(false);
    }
  };

  const handlePolish = async () => {
    if (!selectedChapterId || !selectedText) {
      alert("请先选中文本");
      return;
    }
    setAiLoading(true);
    try {
      const result = await aiApi.polish({
        chapterId: selectedChapterId,
        text: selectedText,
      });
      setAiTask(result);
      setShowAiResult(true);
    } catch (error) {
      console.error("Polish failed:", error);
    } finally {
      setAiLoading(false);
    }
  };

  const handleExpand = async () => {
    if (!selectedChapterId || !selectedText) {
      alert("请先选中文本");
      return;
    }
    setAiLoading(true);
    try {
      const result = await aiApi.expand({
        chapterId: selectedChapterId,
        text: selectedText,
      });
      setAiTask(result);
      setShowAiResult(true);
    } catch (error) {
      console.error("Expand failed:", error);
    } finally {
      setAiLoading(false);
    }
  };

  const handleConsistencyCheck = async () => {
    if (!selectedChapterId) return;
    setAiLoading(true);
    try {
      const result = await aiApi.consistencyCheck({
        chapterId: selectedChapterId,
      });
      setAiTask(result);
      setShowAiResult(true);
    } catch (error) {
      console.error("Consistency check failed:", error);
    } finally {
      setAiLoading(false);
    }
  };

  const handleCustomAi = async () => {
    if (!selectedChapterId || !aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      // TODO: Implement custom AI prompt API
      setAiLoading(false);
    } catch (error) {
      console.error("Custom AI failed:", error);
      setAiLoading(false);
    }
  };

  const handleApplyAiResult = (text: string) => {
    if (editor) {
      editor.chain().focus().insertContent(text).run();
      setShowAiResult(false);
      setAiTask(null);
    }
  };

  const wordCount = editor?.storage?.characterCount?.characters?.() ?? currentChapter?.wordCount ?? 0;
  const lockedWords = currentChapter?.lockedUntilOffset || 0;

  return (
    <div className="flex h-full">
      {/* Chapter Tree */}
      <aside className="w-64 border-r bg-card overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">章节</h2>
            <button
              onClick={() => setShowNewChapter(true)}
              className="p-1 rounded hover:bg-accent"
              title="新建章节"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* New Chapter Form */}
          {showNewChapter && (
            <div className="mb-4 p-2 border rounded-md">
              <input
                type="text"
                value={newChapterTitle}
                onChange={(e) => setNewChapterTitle(e.target.value)}
                placeholder="章节标题"
                className="w-full px-2 py-1 text-sm border rounded mb-2"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateChapter();
                  if (e.key === "Escape") setShowNewChapter(false);
                }}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreateChapter}
                  className="flex-1 px-2 py-1 text-xs bg-primary text-primary-foreground rounded"
                >
                  创建
                </button>
                <button
                  onClick={() => setShowNewChapter(false)}
                  className="flex-1 px-2 py-1 text-xs border rounded"
                >
                  取消
                </button>
              </div>
            </div>
          )}

          {/* Chapter List */}
          <div className="space-y-1">
            {chapters.map((chapter) => (
              <div
                key={chapter.id}
                className={`group flex items-center justify-between px-3 py-2 rounded-md text-sm cursor-pointer transition-colors ${
                  selectedChapterId === chapter.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                }`}
                onClick={() => handleChapterSelect(chapter.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{chapter.title}</div>
                  <div className="text-xs opacity-70">
                    {chapter.wordCount.toLocaleString()} 字
                    {chapter.locked && " 🔒"}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteChapter(chapter.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 hover:text-destructive transition-opacity"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          {chapters.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              暂无章节，点击 + 创建
            </p>
          )}
        </div>
      </aside>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="border-b p-2 flex items-center gap-1">
          <button
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-accent ${
              editor?.isActive("bold") ? "bg-accent" : ""
            }`}
            title="粗体"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-accent ${
              editor?.isActive("italic") ? "bg-accent" : ""
            }`}
            title="斜体"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded hover:bg-accent ${
              editor?.isActive("underline") ? "bg-accent" : ""
            }`}
            title="下划线"
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleStrike().run()}
            className={`p-2 rounded hover:bg-accent ${
              editor?.isActive("strike") ? "bg-accent" : ""
            }`}
            title="删除线"
          >
            <Strikethrough className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleHighlight().run()}
            className={`p-2 rounded hover:bg-accent ${
              editor?.isActive("highlight") ? "bg-accent" : ""
            }`}
            title="高亮"
          >
            <Highlighter className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-border mx-1" />

          <button
            onClick={() =>
              editor?.chain().focus().setTextAlign("left").run()
            }
            className={`p-2 rounded hover:bg-accent ${
              editor?.isActive({ textAlign: "left" }) ? "bg-accent" : ""
            }`}
            title="左对齐"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() =>
              editor?.chain().focus().setTextAlign("center").run()
            }
            className={`p-2 rounded hover:bg-accent ${
              editor?.isActive({ textAlign: "center" }) ? "bg-accent" : ""
            }`}
            title="居中"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            onClick={() =>
              editor?.chain().focus().setTextAlign("right").run()
            }
            className={`p-2 rounded hover:bg-accent ${
              editor?.isActive({ textAlign: "right" }) ? "bg-accent" : ""
            }`}
            title="右对齐"
          >
            <AlignRight className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-border mx-1" />

          <button
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-accent ${
              editor?.isActive("bulletList") ? "bg-accent" : ""
            }`}
            title="无序列表"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-accent ${
              editor?.isActive("orderedList") ? "bg-accent" : ""
            }`}
            title="有序列表"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded hover:bg-accent ${
              editor?.isActive("blockquote") ? "bg-accent" : ""
            }`}
            title="引用"
          >
            <Quote className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-border mx-1" />

          <button
            onClick={() => editor?.chain().focus().undo().run()}
            className="p-2 rounded hover:bg-accent"
            title="撤销"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor?.chain().focus().redo().run()}
            className="p-2 rounded hover:bg-accent"
            title="重做"
          >
            <Redo className="w-4 h-4" />
          </button>

          <div className="flex-1" />

          {/* Version History */}
          <button
            onClick={handleLoadVersions}
            className="flex items-center gap-1 px-2 py-1 text-sm rounded hover:bg-accent"
            title="版本历史"
          >
            <RotateCcw className="w-4 h-4" />
            <span>版本</span>
          </button>

          {/* Save Status */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {showSaving ? (
              <>
                <Save className="w-4 h-4 animate-spin" />
                <span>保存中...</span>
              </>
            ) : lastSaved ? (
              <>
                <Save className="w-4 h-4" />
                <span>已保存 {lastSaved.toLocaleTimeString()}</span>
              </>
            ) : null}
          </div>

          {/* Lock Button */}
          <button
            onClick={handleToggleLock}
            className={`p-2 rounded hover:bg-accent ${
              currentChapter?.locked ? "text-destructive" : ""
            }`}
            title={currentChapter?.locked ? "解锁章节" : "锁定章节"}
          >
            {currentChapter?.locked ? (
              <Lock className="w-4 h-4" />
            ) : (
              <Unlock className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Editor Content */}
        <div
          className="flex-1 overflow-y-auto"
          onClick={() => editor?.commands.focus()}
          style={{ cursor: "text" }}
        >
          <div className="max-w-3xl mx-auto p-8 min-h-full">
            {/* Chapter Title */}
            <input
              type="text"
              value={currentChapter?.title || ""}
              onChange={(e) => handleUpdateTitle(e.target.value)}
              className="w-full text-3xl font-bold mb-6 bg-transparent border-none outline-none"
              placeholder="章节标题"
            />

            {/* Lock Info */}
            {currentChapter?.locked && (
              <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <span className="text-sm">此章节已锁定，无法编辑</span>
              </div>
            )}

            {/* Editor */}
            <EditorContent
              editor={editor}
              className="prose prose-lg max-w-none"
              style={{ minHeight: "calc(100vh - 280px)" }}
            />
          </div>
        </div>

        {/* Status Bar */}
        <div className="border-t px-4 py-2 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>本章字数: {wordCount.toLocaleString()}</span>
            {lockedWords > 0 && (
              <span className="text-destructive">
                锁定字数: {lockedWords.toLocaleString()}
              </span>
            )}
            {selectedText && (
              <span className="text-primary">
                已选中: {selectedText.length} 字
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span>
              自动保存: 输入停止 800ms 后保存，每 10 秒强制保存
            </span>
          </div>
        </div>

        {/* Version History Modal */}
        {showVersions && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background rounded-lg shadow-lg w-[600px] max-h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold">版本历史</h3>
                <button
                  onClick={() => setShowVersions(false)}
                  className="p-1 rounded hover:bg-accent"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 overflow-y-auto max-h-[60vh]">
                {versions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    暂无版本历史
                  </p>
                ) : (
                  <div className="space-y-2">
                    {versions.map((version) => (
                      <div
                        key={version.id}
                        className="flex items-center justify-between p-3 border rounded-md hover:bg-accent/50"
                      >
                        <div>
                          <p className="text-sm font-medium">
                            {version.reason === "auto_save"
                              ? "自动保存"
                              : version.reason === "manual"
                              ? "手动保存"
                              : "AI 应用"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(version.createdAt).toLocaleString()} •{" "}
                            {version.wordCount.toLocaleString()} 字
                          </p>
                        </div>
                        <button
                          onClick={() => handleRestoreVersion(version.id)}
                          className="px-3 py-1 text-sm border rounded hover:bg-accent"
                        >
                          恢复
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Side Panel */}
      <aside className="w-80 border-l bg-card overflow-y-auto">
        <div className="p-4">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Wand2 className="w-4 h-4" />
            AI 助手
          </h2>

          {/* AI Actions */}
          <div className="space-y-2 mb-6">
            <button
              onClick={handleGrammarCheck}
              disabled={aiLoading}
              className="w-full px-4 py-2 text-left rounded-md hover:bg-accent transition-colors disabled:opacity-50"
            >
              {aiLoading ? "⏳ 处理中..." : "🔍 语法纠错"}
            </button>
            <button
              onClick={handlePolish}
              disabled={aiLoading || !selectedText}
              className="w-full px-4 py-2 text-left rounded-md hover:bg-accent transition-colors disabled:opacity-50"
            >
              {aiLoading ? "⏳ 处理中..." : "✨ 润色"}
            </button>
            <button
              onClick={handleExpand}
              disabled={aiLoading || !selectedText}
              className="w-full px-4 py-2 text-left rounded-md hover:bg-accent transition-colors disabled:opacity-50"
            >
              {aiLoading ? "⏳ 处理中..." : "📝 扩写"}
            </button>
            <button
              onClick={handleConsistencyCheck}
              disabled={aiLoading}
              className="w-full px-4 py-2 text-left rounded-md hover:bg-accent transition-colors disabled:opacity-50"
            >
              {aiLoading ? "⏳ 处理中..." : "⚠️ 检查矛盾"}
            </button>
          </div>

          {/* Selected Text Info */}
          {selectedText && (
            <div className="mb-6 p-3 bg-muted rounded-md">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                已选中文本
              </p>
              <p className="text-sm line-clamp-3">{selectedText}</p>
            </div>
          )}

          {/* AI Result */}
          {showAiResult && aiTask && (
            <div className="mb-6 p-3 border rounded-md">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">AI 结果</h3>
                <button
                  onClick={() => {
                    setShowAiResult(false);
                    setAiTask(null);
                  }}
                  className="p-1 rounded hover:bg-accent"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <div className="text-sm">
                {aiTask.taskType === "grammar" && (
                  <div>
                    <p className="text-muted-foreground mb-2">语法检查结果：</p>
                    <pre className="whitespace-pre-wrap text-xs bg-muted p-2 rounded">
                      {aiTask.resultJson
                        ? JSON.stringify(aiTask.resultJson, null, 2)
                        : "无结果"}
                    </pre>
                  </div>
                )}
                {aiTask.taskType === "polish" && (
                  <div>
                    <p className="text-muted-foreground mb-2">润色结果：</p>
                    <div className="space-y-2">
                      {(aiTask.resultJson as any)?.versions?.map(
                        (v: any, i: number) => (
                          <div
                            key={i}
                            className="p-2 bg-muted rounded cursor-pointer hover:bg-accent"
                            onClick={() => handleApplyAiResult(v.text)}
                          >
                            <p className="text-xs">{v.text}</p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
                {aiTask.taskType === "consistency" && (
                  <div>
                    <p className="text-muted-foreground mb-2">一致性检查：</p>
                    <pre className="whitespace-pre-wrap text-xs bg-muted p-2 rounded">
                      {aiTask.resultJson
                        ? JSON.stringify(aiTask.resultJson, null, 2)
                        : "无冲突"}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Context Info */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2">上下文命中</h3>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>• 相关人物: 0</p>
              <p>• 相关地点: 0</p>
              <p>• 相关灵感: 0</p>
            </div>
          </div>

          {/* Custom AI Input */}
          <div>
            <h3 className="text-sm font-medium mb-2">自定义提示</h3>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="w-full p-2 border rounded-md resize-none"
              rows={4}
              placeholder="输入自定义 AI 指令..."
            />
            <button
              onClick={handleCustomAi}
              disabled={aiLoading || !aiPrompt.trim()}
              className="w-full mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {aiLoading ? "处理中..." : "执行"}
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
