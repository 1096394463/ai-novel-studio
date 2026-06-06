import { Routes, Route } from "react-router-dom";
import { NovelLibraryPage } from "./features/novels/NovelLibraryPage";
import { EditorPage } from "./features/editor/EditorPage";
import { WorldBiblePage } from "./features/world/WorldBiblePage";
import { GraphMapPage } from "./features/graph/GraphMapPage";
import { PublishingPage } from "./features/publishing/PublishingPage";
import { Layout } from "./components/Layout";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<NovelLibraryPage />} />
        <Route path="editor/:novelId" element={<EditorPage />} />
        <Route path="world/:novelId" element={<WorldBiblePage />} />
        <Route path="graph/:novelId" element={<GraphMapPage />} />
        <Route path="publishing" element={<PublishingPage />} />
      </Route>
    </Routes>
  );
}

export default App;
