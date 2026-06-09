import { create } from "zustand";
import type { Novel, Chapter, WorldEntity, Idea } from "@/types";
import { novelApi, chapterApi, entityApi, ideaApi } from "@/api";

// API retry helper - waits for backend to be ready
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 10, delayMs = 1000): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw new Error("unreachable");
}

interface NovelStore {
  novels: Novel[];
  currentNovel: Novel | null;
  currentNovelId: string | null;
  loading: boolean;
  error: string | null;

  fetchNovels: () => Promise<void>;
  fetchNovel: (id: string) => Promise<void>;
  createNovel: (data: Partial<Novel>) => Promise<Novel>;
  updateNovel: (id: string, data: Partial<Novel>) => Promise<void>;
  setCurrentNovelId: (id: string) => void;
}

export const useNovelStore = create<NovelStore>((set) => ({
  novels: [],
  currentNovel: null,
  currentNovelId: null,
  loading: false,
  error: null,

  fetchNovels: async () => {
    set({ loading: true, error: null });
    try {
      const novels = await withRetry(() => novelApi.list());
      set({ novels, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchNovel: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const novel = await novelApi.get(id);
      set({ currentNovel: novel, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  createNovel: async (data: Partial<Novel>) => {
    set({ loading: true, error: null });
    try {
      const novel = await novelApi.create(data);
      set((state) => ({
        novels: [...state.novels, novel],
        loading: false,
      }));
      return novel;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  updateNovel: async (id: string, data: Partial<Novel>) => {
    set({ loading: true, error: null });
    try {
      const novel = await novelApi.update(id, data);
      set((state) => ({
        novels: state.novels.map((n) => (n.id === id ? novel : n)),
        currentNovel:
          state.currentNovel?.id === id ? novel : state.currentNovel,
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  setCurrentNovelId: (id: string) => set({ currentNovelId: id }),
}));

interface ChapterStore {
  chapters: Chapter[];
  currentChapter: Chapter | null;
  loading: boolean;
  error: string | null;

  fetchChapters: (novelId: string) => Promise<void>;
  fetchChapter: (id: string) => Promise<void>;
  resetChapters: () => void;
  createChapter: (novelId: string, data: Partial<Chapter>) => Promise<Chapter>;
  updateChapter: (id: string, data: Partial<Chapter>) => Promise<void>;
  saveChapter: (
    id: string,
    content: { contentJson: string; contentText: string }
  ) => Promise<void>;
}

export const useChapterStore = create<ChapterStore>((set) => ({
  chapters: [],
  currentChapter: null,
  loading: false,
  error: null,

  fetchChapters: async (novelId: string) => {
    set({ loading: true, error: null });
    try {
      const chapters = await withRetry(() => chapterApi.list(novelId));
      set({ chapters, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchChapter: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const chapter = await chapterApi.get(id);
      set({ currentChapter: chapter, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  createChapter: async (novelId: string, data: Partial<Chapter>) => {
    set({ loading: true, error: null });
    try {
      const chapter = await chapterApi.create(novelId, data);
      set((state) => ({
        chapters: [...state.chapters, chapter],
        loading: false,
      }));
      return chapter;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  updateChapter: async (id: string, data: Partial<Chapter>) => {
    set({ loading: true, error: null });
    try {
      const chapter = await chapterApi.update(id, data);
      set((state) => ({
        chapters: state.chapters.map((c) => (c.id === id ? chapter : c)),
        currentChapter:
          state.currentChapter?.id === id ? chapter : state.currentChapter,
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  saveChapter: async (
    id: string,
    content: { contentJson: string; contentText: string }
  ) => {
    try {
      await chapterApi.save(id, content);
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  resetChapters: () => {
    set({ chapters: [], currentChapter: null });
  },
}));

interface WorldStore {
  entities: WorldEntity[];
  currentEntity: WorldEntity | null;
  loading: boolean;
  error: string | null;

  fetchEntities: (novelId: string, type?: string) => Promise<void>;
  fetchEntity: (id: string) => Promise<void>;
  createEntity: (
    novelId: string,
    data: Partial<WorldEntity>
  ) => Promise<WorldEntity>;
  updateEntity: (id: string, data: Partial<WorldEntity>) => Promise<void>;
}

export const useWorldStore = create<WorldStore>((set) => ({
  entities: [],
  currentEntity: null,
  loading: false,
  error: null,

  fetchEntities: async (novelId: string, type?: string) => {
    set({ loading: true, error: null });
    try {
      const entities = await entityApi.list(novelId, type);
      set({ entities, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchEntity: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const entity = await entityApi.get(id);
      set({ currentEntity: entity, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  createEntity: async (novelId: string, data: Partial<WorldEntity>) => {
    set({ loading: true, error: null });
    try {
      const entity = await entityApi.create(novelId, data);
      set((state) => ({
        entities: [...state.entities, entity],
        loading: false,
      }));
      return entity;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  updateEntity: async (id: string, data: Partial<WorldEntity>) => {
    set({ loading: true, error: null });
    try {
      const entity = await entityApi.update(id, data);
      set((state) => ({
        entities: state.entities.map((e) => (e.id === id ? entity : e)),
        currentEntity:
          state.currentEntity?.id === id ? entity : state.currentEntity,
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
}));

interface IdeaStore {
  ideas: Idea[];
  loading: boolean;
  error: string | null;

  fetchIdeas: (novelId: string) => Promise<void>;
  createIdea: (novelId: string, data: Partial<Idea>) => Promise<Idea>;
  updateIdea: (id: string, data: Partial<Idea>) => Promise<void>;
}

export const useIdeaStore = create<IdeaStore>((set) => ({
  ideas: [],
  loading: false,
  error: null,

  fetchIdeas: async (novelId: string) => {
    set({ loading: true, error: null });
    try {
      const ideas = await ideaApi.list(novelId);
      set({ ideas, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  createIdea: async (novelId: string, data: Partial<Idea>) => {
    set({ loading: true, error: null });
    try {
      const idea = await ideaApi.create(novelId, data);
      set((state) => ({
        ideas: [...state.ideas, idea],
        loading: false,
      }));
      return idea;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  updateIdea: async (id: string, data: Partial<Idea>) => {
    set({ loading: true, error: null });
    try {
      const idea = await ideaApi.update(id, data);
      set((state) => ({
        ideas: state.ideas.map((i) => (i.id === id ? idea : i)),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
}));
