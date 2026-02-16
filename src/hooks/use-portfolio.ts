import { api } from "@shared/routes";
import type { InsertMessage } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

/* ---------------------------------- */
/* API Base URL */
/* ---------------------------------- */

const API_BASE_URL = import.meta.env.DEV ? "http://localhost:5000" : (import.meta.env.VITE_API_URL || "http://localhost:5000");

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
    const token = localStorage.getItem("auth_token");
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(url, { headers });

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
      throw new Error('Network error: Unable to connect to the server. Please make sure the backend is running.');
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
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Login failed");
      }

      const data = await res.json();
      return data as { token: string };
    },
    onSuccess: (data) => {
      localStorage.setItem("auth_token", data.token);
      toast({
        title: "Login Successful",
        description: "Welcome back, Admin!",
      });
      // Redirect or refresh could happen here if needed
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
      const token = localStorage.getItem("auth_token");
      if (!token) throw new Error("Unauthorized");

      return fetchAndParse(
        "/api/analytics/summary",
        { parse: (d) => d }, // Flexibly handle summary data
        "Failed to fetch analytics summary"
      );
    },
  });
}

/**
 * Logout utility
 */
export function logout() {
  localStorage.removeItem("auth_token");
  window.location.reload();
}

/* ---------------------------------- */
/* End of File */
/* ---------------------------------- */
