import { Link } from "react-router-dom";

/** Shown when a page needs a novelId but none was provided */
export function SelectNovelPrompt({ pageName }: { pageName: string }) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="text-5xl mb-4">📖</div>
        <h2 className="text-xl font-semibold mb-2">
          请先选择一本小说
        </h2>
        <p className="text-muted-foreground mb-6">
          {pageName}需要选择一本小说才能使用
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
        >
          前往书架
        </Link>
      </div>
    </div>
  );
}
