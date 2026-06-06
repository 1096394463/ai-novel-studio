import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
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
} from "lucide-react";
import { useNovelStore, useChapterStore } from "@/stores";

export function EditorPage() {
  const { novelId } = useParams<{ novelId: string }>();
  const { currentNovel, fetchNovel } = useNovelStore();
  const {
    chapters,
    currentChapter,
    fetchChapters,
    fetchChapter,
    saveChapter,
  } = useChapterStore();

  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(
    null
  );
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const forceSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (novelId) {
      fetchNovel(novelId);
      fetchChapters(novelId);
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
      try {
        await saveChapter(selectedChapterId, content);
        setLastSaved(new Date());
      } finally {
        setIsSaving(false);
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
  });

  // Force save every 10 seconds
  useEffect(() => {
    forceSaveIntervalRef.current = setInterval(() => {
      if (editor && editor.isFocused) {
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

  const handleChapterSelect = async (chapterId: string) => {
    setSelectedChapterId(chapterId);
    await fetchChapter(chapterId);
  };

  const wordCount = currentChapter?.wordCount || 0;
  const lockedWords = currentChapter?.lockedUntilOffset || 0;

  return (
    <div className="flex h-full">
      {/* Chapter Tree */}
      <aside className="w-64 border-r bg-card overflow-y-auto">
        <div className="p-4">
          <h2 className="font-semibold mb-4">章节</h2>
          <div className="space-y-1">
            {chapters.map((chapter) => (
              <button
                key={chapter.id}
                onClick={() => handleChapterSelect(chapter.id)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  selectedChapterId === chapter.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                }`}
              >
                <div className="font-medium truncate">{chapter.title}</div>
                <div className="text-xs opacity-70">
                  {chapter.wordCount.toLocaleString()} 字
                </div>
              </button>
            ))}
          </div>
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
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-accent ${
              editor?.isActive("italic") ? "bg-accent" : ""
            }`}
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded hover:bg-accent ${
              editor?.isActive("underline") ? "bg-accent" : ""
            }`}
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleStrike().run()}
            className={`p-2 rounded hover:bg-accent ${
              editor?.isActive("strike") ? "bg-accent" : ""
            }`}
          >
            <Strikethrough className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleHighlight().run()}
            className={`p-2 rounded hover:bg-accent ${
              editor?.isActive("highlight") ? "bg-accent" : ""
            }`}
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
          >
            <AlignRight className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-border mx-1" />

          <button
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-accent ${
              editor?.isActive("bulletList") ? "bg-accent" : ""
            }`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-accent ${
              editor?.isActive("orderedList") ? "bg-accent" : ""
            }`}
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded hover:bg-accent ${
              editor?.isActive("blockquote") ? "bg-accent" : ""
            }`}
          >
            <Quote className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-border mx-1" />

          <button
            onClick={() => editor?.chain().focus().undo().run()}
            className="p-2 rounded hover:bg-accent"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor?.chain().focus().redo().run()}
            className="p-2 rounded hover:bg-accent"
          >
            <Redo className="w-4 h-4" />
          </button>

          <div className="flex-1" />

          {/* Save Status */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {isSaving ? (
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
            className={`p-2 rounded hover:bg-accent ${
              currentChapter?.locked ? "text-destructive" : ""
            }`}
          >
            {currentChapter?.locked ? (
              <Lock className="w-4 h-4" />
            ) : (
              <Unlock className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Editor Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl mx-auto">
            {/* Chapter Title */}
            <input
              type="text"
              value={currentChapter?.title || ""}
              onChange={(e) => {
                // TODO: Update chapter title
              }}
              className="w-full text-3xl font-bold mb-6 bg-transparent border-none outline-none"
              placeholder="章节标题"
            />

            {/* Editor */}
            <EditorContent
              editor={editor}
              className="prose prose-lg max-w-none"
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
          </div>
          <div className="flex items-center gap-4">
            <span>
              自动保存: 输入停止 800ms 后保存，每 10 秒强制保存
            </span>
          </div>
        </div>
      </div>

      {/* AI Side Panel */}
      <aside className="w-80 border-l bg-card overflow-y-auto">
        <div className="p-4">
          <h2 className="font-semibold mb-4">AI 助手</h2>

          {/* AI Actions */}
          <div className="space-y-2 mb-6">
            <button className="w-full px-4 py-2 text-left rounded-md hover:bg-accent transition-colors">
              🔍 语法纠错
            </button>
            <button className="w-full px-4 py-2 text-left rounded-md hover:bg-accent transition-colors">
              ✨ 润色
            </button>
            <button className="w-full px-4 py-2 text-left rounded-md hover:bg-accent transition-colors">
              📝 扩写
            </button>
            <button className="w-full px-4 py-2 text-left rounded-md hover:bg-accent transition-colors">
              ⚠️ 检查矛盾
            </button>
          </div>

          {/* Context Info */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2">上下文命中</h3>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>• 相关人物: 0</p>
              <p>• 相关地点: 0</p>
              <p>• 相关灵感: 0</p>
            </div>
          </div>

          {/* AI Input */}
          <div>
            <h3 className="text-sm font-medium mb-2">自定义提示</h3>
            <textarea
              className="w-full p-2 border rounded-md resize-none"
              rows={4}
              placeholder="输入自定义 AI 指令..."
            />
            <button className="w-full mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
              执行
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
