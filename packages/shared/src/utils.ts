/**
 * Replaces placeholders in a URL path with actual values.
 * Example: interpolatePath("/api/v1/projects/:id", { id: 123 }) -> "/api/v1/projects/123"
 */
export function interpolatePath(path: string, params: Record<string, string | number>): string {
    let interpolated = path;
    for (const [key, value] of Object.entries(params)) {
        interpolated = interpolated.replace(`:${key}`, String(value));
    }
    return interpolated;
}
