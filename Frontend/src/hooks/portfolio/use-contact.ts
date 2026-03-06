import { api } from "@portfolio/shared/routes";
import type { InsertMessage } from "@portfolio/shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/api-helpers";
import { fetchAndParse } from "./_fetch-helper";

export function useMessages() {
  return useQuery({
    queryKey: ["messages"],
    queryFn: () =>
      fetchAndParse(
        api.messages.list.path,
        api.messages.list.responses[200],
        "Failed to fetch messages"
      ),
  });
}

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
