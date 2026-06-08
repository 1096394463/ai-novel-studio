import { useState, useCallback } from "react";
import { Routes, Route, useParams } from "react-router-dom";
import { NovelLibraryPage } from "./features/novels/NovelLibraryPage";
import { EditorPage } from "./features/editor/EditorPage";
import { WorldBiblePage } from "./features/world/WorldBiblePage";
import { GraphMapPage } from "./features/graph/GraphMapPage";
import { PublishingPage } from "./features/publishing/PublishingPage";
import { SettingsPage } from "./features/settings/SettingsPage";
import { Layout } from "./components/Layout";
import { BootScreen } from "./components/BootScreen";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { SelectNovelPrompt } from "./components/SelectNovelPrompt";

function EditorWrapper() {
  const { novelId } = useParams();
  if (!novelId) return <SelectNovelPrompt pageName="写作" />;
  return <EditorPage />;
}

function WorldWrapper() {
  const { novelId } = useParams();
  if (!novelId) return <SelectNovelPrompt pageName="设定" />;
  return <WorldBiblePage />;
}

function GraphWrapper() {
  const { novelId } = useParams();
  if (!novelId) return <SelectNovelPrompt pageName="图谱" />;
  return (
    <ErrorBoundary>
      <GraphMapPage />
    </ErrorBoundary>
  );
}

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
          <Route path="editor/:novelId" element={<EditorWrapper />} />
          <Route path="editor" element={<EditorWrapper />} />
          <Route path="world/:novelId" element={<WorldWrapper />} />
          <Route path="world" element={<WorldWrapper />} />
          <Route path="graph/:novelId" element={<GraphWrapper />} />
          <Route path="graph" element={<GraphWrapper />} />
          <Route path="publishing" element={<PublishingPage />} />
          <Route
            path="settings"
            element={
              <ErrorBoundary>
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
