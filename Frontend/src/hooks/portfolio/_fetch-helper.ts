import { apiFetch } from "@/lib/api-helpers";

/**
 * Generic fetch + Zod parse helper shared by all portfolio hooks.
 * @internal — not exported from the barrel.
 */
export async function fetchAndParse<T>(
  path: string,
  schema: { parse: (data: unknown) => T },
  errorMessage: string
): Promise<T> {
  try {
    const jsonData = await apiFetch(path);
    return schema.parse(jsonData);
  } catch (error: unknown) {
    if (errorMessage === 'API unknown error' && !navigator.onLine) {
      throw new Error('Network error: Unable to connect to the server. Please check your internet connection or if the backend is down.', { cause: error });
    }
    if (error instanceof Error) {
      throw new Error(error.message, { cause: error });
    }
    throw new Error(`${errorMessage}: ${String(error)}`, { cause: error });
  }
}
