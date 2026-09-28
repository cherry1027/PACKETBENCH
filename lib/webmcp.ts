type WebTool = {
  name: string;
  title: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
  execute: (input: unknown) => unknown | Promise<unknown>;
};

type ModelContext = {
  registerTool: (tool: WebTool, options?: { signal?: AbortSignal }) => void | Promise<void>;
};

export function registerWebTool(tool: WebTool) {
  if (typeof document === "undefined") return () => undefined;
  const context = (document as Document & { modelContext?: ModelContext }).modelContext;
  if (!context?.registerTool) return () => undefined;
  const lifecycle = new AbortController();
  try {
    void Promise.resolve(context.registerTool(tool, { signal: lifecycle.signal })).catch(() => undefined);
  } catch {
    return () => undefined;
  }
  return () => lifecycle.abort();
}
