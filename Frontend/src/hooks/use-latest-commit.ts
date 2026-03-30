import { useQuery } from "@tanstack/react-query";
import { api } from "#shared";
import { QUERY_KEYS } from "#src/lib/query-keys";

export const useLatestCommit = () => {
    return useQuery({
        queryKey: QUERY_KEYS.github.latestCommit,
        queryFn: async () => {
            const response = await fetch(api.github.latestCommit.path);
            if (!response.ok) {
                throw new Error("Failed to fetch latest commit");
            }
            return response.json();
        },
        refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
    });
};
