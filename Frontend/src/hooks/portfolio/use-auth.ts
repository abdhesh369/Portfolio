import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/api-helpers";
import { queryClient } from "@/lib/queryClient";
import { AUTH_QUERY_KEY } from "@/lib/query-keys";

/**
 * Hook for admin login
 */
export function useLogin() {
  const { toast } = useToast();

  return useMutation({
    mutationKey: ["login"],
    mutationFn: async (password: string) => {
      const url = `${API_BASE_URL}/api/v1/auth/login`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
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
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
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
