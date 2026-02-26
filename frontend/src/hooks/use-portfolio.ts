import { api } from "@shared/routes";
import type { InsertMessage } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/api-helpers";

/* ---------------------------------- */
/* Generic fetch helper */
/* ---------------------------------- */

async function fetchAndParse<T>(
  path: string,
  schema: { parse: (data: unknown) => T },
  errorMessage: string
): Promise<T> {
  try {
    const url = `${API_BASE_URL}${path}`;

    // We strictly use HttpOnly cookies now, so no need for Authorization header manually here
    // unless we are in a non-browser environment (not applicable here).
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

/* ---------------------------------- */
/* Queries */
/* ---------------------------------- */

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: () =>
      fetchAndParse(
        api.projects.list.path,
        api.projects.list.responses[200],
        "Failed to fetch projects"
      ),
  });
}

export function useSkills() {
  return useQuery({
    queryKey: ["skills"],
    queryFn: () =>
      fetchAndParse(
        api.skills.list.path,
        api.skills.list.responses[200],
        "Failed to fetch skills"
      ),
  });
}

export function useSkillConnections() {
  return useQuery({
    queryKey: ["skill-connections"],
    queryFn: () =>
      fetchAndParse(
        api.skills.connections.path,
        api.skills.connections.responses[200],
        "Failed to fetch skill connections"
      ),
  });
}

export function useMindset() {
  return useQuery({
    queryKey: ["mindset"],
    queryFn: () =>
      fetchAndParse(
        api.mindset.list.path,
        api.mindset.list.responses[200],
        "Failed to fetch mindset principles"
      ),
  });
}

export function useExperiences() {
  return useQuery({
    queryKey: ["experiences"],
    queryFn: () =>
      fetchAndParse(
        api.experiences.list.path,
        api.experiences.list.responses[200],
        "Failed to fetch experiences"
      ),
  });
}

export function useArticles(status?: string) {
  return useQuery({
    queryKey: ["articles", status],
    queryFn: () =>
      fetchAndParse(
        api.articles.list.path + (status ? `?status=${status}` : ""),
        api.articles.list.responses[200],
        "Failed to fetch articles"
      ),
  });
}

export function useArticle(slug: string) {
  return useQuery({
    queryKey: ["article", slug],
    queryFn: () =>
      fetchAndParse(
        api.articles.get.path.replace(":slug", slug),
        api.articles.get.responses[200],
        "Failed to fetch article"
      ),
    enabled: !!slug,
  });
}

/* ---------------------------------- */
/* Mutation */
/* ---------------------------------- */

export function useSendMessage() {
  const { toast } = useToast();

  return useMutation({
    mutationKey: ["send-message"],

    mutationFn: async (data: InsertMessage) => {
      const url = `${API_BASE_URL}${api.messages.create.path}`;
      const res = await fetch(url, {
        method: api.messages.create.method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message ?? "Validation failed");
        }

        throw new Error(`Request failed (${res.status})`);
      }

      return api.messages.create.responses[201].parse(await res.json());
    },

    onSuccess: () => {
      toast({
        title: "Message sent",
        description: "I'll get back to you soon.",
      });
    },

    onError: (error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook for admin login
 */
export function useLogin() {
  const { toast } = useToast();

  return useMutation({
    mutationKey: ["login"],
    mutationFn: async (password: string) => {
      const url = `${API_BASE_URL}/api/auth/login`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include', // Important to receive the HttpOnly cookie
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Login failed");
      }

      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Login Successful",
        description: "Welcome back, Admin!",
      });
      window.location.reload();
    },
    onError: (error) => {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useAnalyticsSummary() {
  return useQuery({
    queryKey: ["analytics-summary"],
    queryFn: () => {
      return fetchAndParse(
        "/api/analytics/summary",
        { parse: (d) => d },
        "Failed to fetch analytics summary"
      );
    },
  });
}

/**
 * Logout utility
 */
export async function logout() {
  try {
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: "POST",
      credentials: 'include'
    });
  } finally {
    window.location.reload();
  }
}

/* ---------------------------------- */
/* End of File */
/* ---------------------------------- */
