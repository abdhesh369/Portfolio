import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "@/lib/api-helpers";

export interface ReadingItem {
    id: number;
    title: string;
    url: string;
    note: string | null;
    type: 'article' | 'video' | 'book';
    createdAt: string;
}

export function useReadingList() {
    return useQuery<ReadingItem[]>({
        queryKey: ["reading-list"],
        queryFn: async () => {
            const res = await fetch(`${API_BASE_URL}/api/v1/reading-list`);
            if (!res.ok) throw new Error("Failed to fetch reading list");
            return res.json();
        },
        staleTime: 1000 * 60 * 10, // 10 minutes
    });
}
