import { useState, useCallback } from "react";
import { aiApi } from "@/api";
import type { AiTask } from "@/types";

interface UseAiOptions {
  chapterId: string;
  onSuccess?: (task: AiTask) => void;
  onError?: (error: Error) => void;
}

export function useAi({ chapterId, onSuccess, onError }: UseAiOptions) {
  const [loading, setLoading] = useState(false);
  const [task, setTask] = useState<AiTask | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const grammarCheck = useCallback(
    async (text?: string) => {
      setLoading(true);
      setError(null);
      try {
        const result = await aiApi.grammarCheck({
          chapterId,
          text,
        });
        setTask(result);
        onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err as Error;
        setError(error);
        onError?.(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [chapterId, onSuccess, onError]
  );

  const polish = useCallback(
    async (text: string, style?: string) => {
      setLoading(true);
      setError(null);
      try {
        const result = await aiApi.polish({
          chapterId,
          text,
          style,
        });
        setTask(result);
        onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err as Error;
        setError(error);
        onError?.(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [chapterId, onSuccess, onError]
  );

  const expand = useCallback(
    async (text: string) => {
      setLoading(true);
      setError(null);
      try {
        const result = await aiApi.expand({
          chapterId,
          text,
        });
        setTask(result);
        onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err as Error;
        setError(error);
        onError?.(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [chapterId, onSuccess, onError]
  );

  const consistencyCheck = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await aiApi.consistencyCheck({
        chapterId,
      });
      setTask(result);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [chapterId, onSuccess, onError]);

  const ideaSuggestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await aiApi.ideaSuggestions({
        chapterId,
      });
      setTask(result);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [chapterId, onSuccess, onError]);

  const clearTask = useCallback(() => {
    setTask(null);
    setError(null);
  }, []);

  return {
    loading,
    task,
    error,
    grammarCheck,
    polish,
    expand,
    consistencyCheck,
    ideaSuggestions,
    clearTask,
  };
}
