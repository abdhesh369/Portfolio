import { useMutation, useQueryClient, type UseMutationOptions, type QueryKey } from "@tanstack/react-query";
import { useToast } from "#src/hooks/use-toast";

interface AdminMutationOptions<TData, TError, TVariables, TContext>
    extends UseMutationOptions<TData, TError, TVariables, TContext> {
    queryKeyToInvalidate?: QueryKey;
    successTitle?: string;
    successDescription?: string;
    errorTitle?: string;
    route?: unknown;
    // Overriding these to be explicit about arguments
    onSuccess?: (data: TData, variables: TVariables, context: TContext) => Promise<unknown> | unknown;
    onError?: (error: TError, variables: TVariables, context: TContext | undefined) => Promise<unknown> | unknown;
}

/**
 * Standardized hook for Admin mutations.
 * Handles query invalidation and toast notifications automatically.
 */
export function useAdminMutation<
    TData = unknown,
    TError = Error,
    TVariables = void,
    TContext = unknown
>(options: AdminMutationOptions<TData, TError, TVariables, TContext>) {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const {
        queryKeyToInvalidate,
        successTitle,
        successDescription,
        errorTitle = "Action failed",
        onSuccess,
        onError,
        ...mutationOptions
    } = options;

    return useMutation<TData, TError, TVariables, TContext>({
        ...mutationOptions,
        onSuccess: async (data, variables, context) => {
            if (queryKeyToInvalidate) {
                await queryClient.invalidateQueries({ queryKey: queryKeyToInvalidate });
            }

            if (successTitle) {
                toast({
                    title: successTitle,
                    description: successDescription,
                });
            }

            if (onSuccess) {
                await onSuccess(data, variables, context);
            }
        },
        onError: (error: TError, variables, context) => {
            toast({
                title: errorTitle,
                description: (error as Error).message || "An unexpected error occurred",
                variant: "destructive",
            });

            if (onError) {
                onError(error, variables, context);
            }
        },
    });
}
