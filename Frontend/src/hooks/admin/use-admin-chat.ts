import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { ChatConversation } from "@portfolio/shared/schema";

export function useAdminChatLogs() {
  return useQuery({
    queryKey: QUERY_KEYS.chat.logs,
    queryFn: async () => {
      const { apiFetch } = await import("@/lib/api-helpers");
      const res = await apiFetch("/api/v1/chat/admin/logs");
      return res.data as ChatConversation[];
    },
  });
}
