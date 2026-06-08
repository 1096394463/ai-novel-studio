import { useState, useCallback } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
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
          <Route path="editor" element={<Navigate to="/" replace />} />
          <Route path="world/:novelId" element={<WorldBiblePage />} />
          <Route path="world" element={<Navigate to="/" replace />} />
          <Route
            path="graph/:novelId"
            element={
              <ErrorBoundary>
                <GraphMapPage />
              </ErrorBoundary>
            }
          />
          <Route path="graph" element={<Navigate to="/" replace />} />
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
