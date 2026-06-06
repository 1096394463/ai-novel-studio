import { useState } from "react";
import {
  X,
  Check,
  Copy,
  RotateCcw,
  AlertTriangle,
  Lightbulb,
  Wand2,
} from "lucide-react";
import type { AiTask } from "@/types";

interface AiResultPanelProps {
  task: AiTask | null;
  onClose: () => void;
  onApply: (text: string) => void;
  onCopy?: (text: string) => void;
}

export function AiResultPanel({
  task,
  onClose,
  onApply,
  onCopy,
}: AiResultPanelProps) {
  const [selectedVersion, setSelectedVersion] = useState<number>(0);

  if (!task) return null;

  const result = task.resultJson as any;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg w-[700px] max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">
              {task.taskType === "grammar"
                ? "语法纠错结果"
                : task.taskType === "polish"
                ? "润色结果"
                : task.taskType === "consistency"
                ? "一致性检查结果"
                : "灵感建议"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-accent"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {/* Grammar Check Result */}
          {task.taskType === "grammar" && result && (
            <div className="space-y-4">
              {result.errors && result.errors.length > 0 ? (
                <>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    <span>发现 {result.errors.length} 个问题</span>
                  </div>
                  <div className="space-y-2">
                    {result.errors.map((error: any, index: number) => (
                      <div
                        key={index}
                        className="p-3 border rounded-md bg-yellow-50 dark:bg-yellow-950/20"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                              {error.type === "grammar"
                                ? "语法错误"
                                : error.type === "typo"
                                ? "错别字"
                                : "标点错误"}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {error.message}
                            </p>
                            {error.context && (
                              <p className="text-xs text-muted-foreground mt-1 font-mono bg-muted p-1 rounded">
                                ...{error.context}...
                              </p>
                            )}
                          </div>
                          {error.suggestion && (
                            <button
                              onClick={() => onApply(error.suggestion)}
                              className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90"
                            >
                              应用修复
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Check className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <p>未发现语法问题</p>
                </div>
              )}

              {result.correctedText && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium">修正后文本</h4>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          onCopy?.(result.correctedText)
                        }
                        className="p-1 rounded hover:bg-accent"
                        title="复制"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onApply(result.correctedText)}
                        className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
                      >
                        应用全部
                      </button>
                    </div>
                  </div>
                  <div className="p-3 bg-muted rounded-md text-sm whitespace-pre-wrap">
                    {result.correctedText}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Polish Result */}
          {task.taskType === "polish" && result && (
            <div className="space-y-4">
              {result.versions && result.versions.length > 0 ? (
                <>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Lightbulb className="w-4 h-4 text-blue-500" />
                    <span>
                      生成了 {result.versions.length} 个润色版本
                    </span>
                  </div>

                  {/* Version Tabs */}
                  <div className="flex gap-2 border-b">
                    {result.versions.map((_: any, index: number) => (
                      <button
                        key={index}
                        onClick={() => setSelectedVersion(index)}
                        className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                          selectedVersion === index
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        版本 {index + 1}
                      </button>
                    ))}
                  </div>

                  {/* Version Content */}
                  <div className="p-4 border rounded-md">
                    <p className="text-sm whitespace-pre-wrap">
                      {result.versions[selectedVersion]?.text}
                    </p>
                  </div>

                  {/* Changes */}
                  {result.versions[selectedVersion]?.changes &&
                    result.versions[selectedVersion].changes.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">
                          修改说明
                        </h4>
                        <ul className="space-y-1">
                          {result.versions[selectedVersion].changes.map(
                            (change: string, i: number) => (
                              <li
                                key={i}
                                className="text-sm text-muted-foreground flex items-start gap-2"
                              >
                                <span className="text-primary">•</span>
                                {change}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                  {/* Actions */}
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() =>
                        onCopy?.(
                          result.versions[selectedVersion]?.text
                        )
                      }
                      className="px-3 py-2 text-sm border rounded hover:bg-accent"
                    >
                      <Copy className="w-4 h-4 inline mr-1" />
                      复制
                    </button>
                    <button
                      onClick={() =>
                        onApply(
                          result.versions[selectedVersion]?.text
                        )
                      }
                      className="px-3 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
                    >
                      <Check className="w-4 h-4 inline mr-1" />
                      应用此版本
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>无润色结果</p>
                </div>
              )}
            </div>
          )}

          {/* Consistency Check Result */}
          {task.taskType === "consistency" && result && (
            <div className="space-y-4">
              {result.conflicts && result.conflicts.length > 0 ? (
                <>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span>
                      发现 {result.conflicts.length} 个冲突
                    </span>
                  </div>
                  <div className="space-y-2">
                    {result.conflicts.map(
                      (conflict: any, index: number) => (
                        <div
                          key={index}
                          className="p-3 border rounded-md bg-red-50 dark:bg-red-950/20"
                        >
                          <p className="text-sm font-medium text-red-800 dark:text-red-200">
                            {conflict.type === "character"
                              ? "人物冲突"
                              : conflict.type === "location"
                              ? "地点冲突"
                              : conflict.type === "timeline"
                              ? "时间线冲突"
                              : "设定冲突"}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {conflict.description}
                          </p>
                          {conflict.entities && (
                            <div className="flex gap-2 mt-2">
                              {conflict.entities.map(
                                (entity: string, i: number) => (
                                  <span
                                    key={i}
                                    className="px-2 py-1 text-xs bg-muted rounded"
                                  >
                                    {entity}
                                  </span>
                                )
                              )}
                            </div>
                          )}
                          {conflict.suggestion && (
                            <p className="text-xs text-muted-foreground mt-2">
                              💡 建议: {conflict.suggestion}
                            </p>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Check className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <p>未发现设定冲突</p>
                </div>
              )}

              {result.suggestions && result.suggestions.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">优化建议</h4>
                  <ul className="space-y-1">
                    {result.suggestions.map(
                      (suggestion: string, i: number) => (
                        <li
                          key={i}
                          className="text-sm text-muted-foreground flex items-start gap-2"
                        >
                          <Lightbulb className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                          {suggestion}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Idea Suggestions Result */}
          {task.taskType === "idea_suggestion" && result && (
            <div className="space-y-4">
              {result.suggestions && result.suggestions.length > 0 ? (
                <>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Lightbulb className="w-4 h-4 text-purple-500" />
                    <span>
                      推荐了 {result.suggestions.length} 个灵感
                    </span>
                  </div>
                  <div className="space-y-2">
                    {result.suggestions.map(
                      (suggestion: any, index: number) => (
                        <div
                          key={index}
                          className="p-3 border rounded-md hover:bg-accent/50 cursor-pointer"
                          onClick={() =>
                            onApply(suggestion.content || suggestion.text)
                          }
                        >
                          <p className="text-sm font-medium">
                            {suggestion.title}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {suggestion.content || suggestion.text}
                          </p>
                          {suggestion.reason && (
                            <p className="text-xs text-muted-foreground mt-2">
                              💡 {suggestion.reason}
                            </p>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>暂无灵感建议</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border rounded hover:bg-accent"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
