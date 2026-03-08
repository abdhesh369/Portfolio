import { useQuery } from "@tanstack/react-query";
import { api } from "@portfolio/shared";

export const useLatestCommit = () => {
    return useQuery({
        queryKey: ["latest-commit"],
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
