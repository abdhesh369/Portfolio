import { API_BASE_URL } from "@/lib/api-helpers";

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
    const url = `${API_BASE_URL}${path}`;

    const res = await fetch(url, {
      credentials: 'include'
    });

    if (!res.ok) {
      const errorText = await res.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      throw new Error(errorData.message || `${errorMessage} (${res.status})`);
    }

    const jsonData = await res.json();
    return schema.parse(jsonData);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the server. Please check your internet connection or if the backend is down.');
    }
    throw new Error(`${errorMessage}: ${String(error)}`);
  }
}
