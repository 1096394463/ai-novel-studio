import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNovelStore, useChapterStore } from "@/stores";
import { chapterApi, annotationApi } from "@/api";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import { MessageSquare } from "lucide-react";
import type { Annotation } from "@/types";

export function ReadPage() {
  const { novelId } = useParams();
  const { currentNovel, fetchNovel } = useNovelStore();
  const { chapters, fetchChapters } = useChapterStore();
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [showAnnotationForm, setShowAnnotationForm] = useState(false);
  const [annotationContent, setAnnotationContent] = useState("");
  const [selectedRange, setSelectedRange] = useState<{from: number; to: number; text: string} | null>(null);
  const [showAnnotations, setShowAnnotations] = useState(true);

  useEffect(() => {
    if (novelId) {
      fetchNovel(novelId);
      fetchChapters(novelId);
    }
  }, [novelId, fetchNovel, fetchChapters]);

  useEffect(() => {
    if (chapters.length > 0 && !selectedChapterId) {
      // Reading order: ascending (oldest first = last in reversed sort_order DESC list)
      setSelectedChapterId(chapters[chapters.length - 1].id);
    }
  }, [chapters, selectedChapterId]);

  useEffect(() => {
    if (selectedChapterId) {
      annotationApi.listByChapter(selectedChapterId).then(setAnnotations).catch(() => setAnnotations([]));
    }
  }, [selectedChapterId]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight.configure({ multicolor: true }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false }),
    ],
    content: "",
    editable: false,
  });

  // Load chapter content
  useEffect(() => {
    if (editor && selectedChapterId) {
      chapterApi.get(selectedChapterId).then((ch) => {
        try {
          const content = ch.contentJson ? JSON.parse(ch.contentJson) : "";
          editor.commands.setContent(content);
        } catch {
          editor.commands.setContent("");
        }
      }).catch(() => {});
    }
  }, [editor, selectedChapterId]);

  // Handle text selection for annotations
  useEffect(() => {
    if (!editor) return;
    const handler = () => {
      const { from, to } = editor.state.selection;
      if (from !== to) {
        const text = editor.state.doc.textBetween(from, to, "");
        setSelectedRange({ from, to, text });
      } else {
        setSelectedRange(null);
      }
    };
    editor.on("selectionUpdate", handler);
    return () => { editor.off("selectionUpdate", handler); };
  }, [editor]);

  const handleAddAnnotation = async () => {
    if (!selectedRange || !selectedChapterId || !novelId) return;
    try {
      const ann = await annotationApi.create({
        chapterId: selectedChapterId,
        novelId,
        startOffset: selectedRange.from,
        endOffset: selectedRange.to,
        selectedText: selectedRange.text,
        content: annotationContent,
      });
      setAnnotations([...annotations, ann]);
      setShowAnnotationForm(false);
      setAnnotationContent("");
      setSelectedRange(null);
    } catch (error: any) {
      alert(error.message || "添加批注失败");
    }
  };

  const handleDeleteAnnotation = async (id: string) => {
    try {
      await annotationApi.delete(id);
      setAnnotations(annotations.filter((a) => a.id !== id));
    } catch (error: any) {
      alert(error.message || "删除批注失败");
    }
  };

  // Reading order: reverse of editor sort_order DESC = ascending
  const readingOrder = [...chapters].reverse();
  const currentChapter = chapters.find((c) => c.id === selectedChapterId);

  return (
    <div className="flex h-full">
      {/* Chapter List - ascending order for reading */}
      <aside className="w-56 border-r bg-card overflow-y-auto">
        <div className="p-4">
          <h2 className="font-semibold mb-2">{currentNovel?.title}</h2>
          <p className="text-xs text-muted-foreground mb-4">{chapters.length} 章 · 阅读模式</p>
          <div className="space-y-1">
            {readingOrder.map((chapter, idx) => (
              <button
                key={chapter.id}
                onClick={() => setSelectedChapterId(chapter.id)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  selectedChapterId === chapter.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                }`}
              >
                <span className="text-xs opacity-60 mr-1">{idx + 1}.</span>
                {chapter.title}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Reading Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-3 border-b">
          <h1 className="text-lg font-semibold">{currentChapter?.title || "选择章节开始阅读"}</h1>
          <div className="flex items-center gap-2">
            {selectedRange && (
              <button
                onClick={() => setShowAnnotationForm(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
              >
                <MessageSquare className="w-4 h-4" />
                添加批注
              </button>
            )}
            <button
              onClick={() => setShowAnnotations(!showAnnotations)}
              className="px-3 py-1.5 text-sm border rounded hover:bg-accent"
            >
              {showAnnotations ? "隐藏批注" : "显示批注"}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-3xl mx-auto prose prose-lg">
              <EditorContent editor={editor} />
            </div>
          </div>

          {/* Annotation Sidebar */}
          {showAnnotations && (
            <aside className="w-72 border-l bg-card overflow-y-auto">
              <div className="p-4">
                <h3 className="font-semibold mb-3">批注 ({annotations.length})</h3>
                <div className="space-y-3">
                  {annotations.map((ann) => (
                    <div
                      key={ann.id}
                      className="p-3 border rounded-md"
                      style={{ borderLeftColor: ann.color || "#fef08a", borderLeftWidth: 3 }}
                    >
                      <p className="text-xs text-muted-foreground mb-1 italic">"{ann.selectedText}"</p>
                      <p className="text-sm">{ann.content}</p>
                      <div className="flex justify-end mt-2">
                        <button
                          onClick={() => handleDeleteAnnotation(ann.id)}
                          className="text-xs text-destructive hover:underline"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  ))}
                  {annotations.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      选中文字后可添加批注
                    </p>
                  )}
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* Annotation Form Modal */}
      {showAnnotationForm && selectedRange && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg shadow-lg w-[400px]">
            <div className="p-4 border-b">
              <h3 className="font-semibold">添加批注</h3>
              <p className="text-xs text-muted-foreground mt-1">"{selectedRange.text}"</p>
            </div>
            <div className="p-4">
              <textarea
                value={annotationContent}
                onChange={(e) => setAnnotationContent(e.target.value)}
                placeholder="写下你的想法..."
                className="w-full p-2 border rounded-md resize-none"
                rows={4}
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <button
                onClick={() => { setShowAnnotationForm(false); setSelectedRange(null); }}
                className="px-4 py-2 text-sm border rounded hover:bg-accent"
              >
                取消
              </button>
              <button
                onClick={handleAddAnnotation}
                disabled={!annotationContent.trim()}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded disabled:opacity-50"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
