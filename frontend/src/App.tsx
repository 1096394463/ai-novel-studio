import { useState, useCallback } from "react";
import { Routes, Route } from "react-router-dom";
import { NovelLibraryPage } from "./features/novels/NovelLibraryPage";
import { EditorPage } from "./features/editor/EditorPage";
import { WorldBiblePage } from "./features/world/WorldBiblePage";
import { GraphMapPage } from "./features/graph/GraphMapPage";
import { PublishingPage } from "./features/publishing/PublishingPage";
import { SettingsPage } from "./features/settings/SettingsPage";
import { Layout } from "./components/Layout";
import { BootScreen } from "./components/BootScreen";
import { ErrorBoundary } from "./components/ErrorBoundary";

function App() {
  const [booted, setBooted] = useState(false);

  const handleReady = useCallback(() => {
    setBooted(true);
  }, []);

  if (!booted) {
    return <BootScreen onReady={handleReady} />;
  }

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<NovelLibraryPage />} />
          <Route path="editor/:novelId" element={<EditorPage />} />
          <Route path="world/:novelId" element={<WorldBiblePage />} />
          <Route
            path="graph/:novelId"
            element={
              <ErrorBoundary
                fallback={
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <p className="text-lg mb-2">⚠️ 图谱加载失败</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        可能缺少 reactflow 依赖或数据格式错误
                      </p>
                      <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 border rounded"
                      >
                        重试
                      </button>
                    </div>
                  </div>
                }
              >
                <GraphMapPage />
              </ErrorBoundary>
            }
          />
          <Route path="publishing" element={<PublishingPage />} />
          <Route
            path="settings"
            element={
              <ErrorBoundary
                fallback={
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <p className="text-lg mb-2">⚠️ 设置页面加载失败</p>
                      <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 border rounded"
                      >
                        重试
                      </button>
                    </div>
                  </div>
                }
              >
                <SettingsPage />
              </ErrorBoundary>
            }
          />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
