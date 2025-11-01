import { useState, useCallback } from "react";
import toast from "react-hot-toast";

export function useOptimistic<T>(initialData: T) {
    const [data, setData] = useState<T>(initialData);
    const [isLoading, setIsLoading] = useState(false);

    const optimisticUpdate = useCallback(
        async <R>(
            optimisticData: T,
            action: () => Promise<R>,
            options?: {
                successMessage?: string;
                errorMessage?: string;
                onSuccess?: (result: R) => void;
                onError?: (error: Error) => void;
            }
        ): Promise<R | undefined> => {
            const previousData = data;
            setIsLoading(true);

            // Optimistically update the UI
            setData(optimisticData);

            try {
                const result = await action();

                if (options?.successMessage) {
                    toast.success(options.successMessage);
                }

                if (options?.onSuccess) {
                    options.onSuccess(result);
                }

                return result;
            } catch (error) {
                // Revert to previous state on error
                setData(previousData);

                const errorMessage =
                    options?.errorMessage ||
                    (error instanceof Error ? error.message : "An error occurred");

                toast.error(errorMessage);

                if (options?.onError && error instanceof Error) {
                    options.onError(error);
                }

                return undefined;
            } finally {
                setIsLoading(false);
            }
        },
        [data]
    );

    const setOptimisticData = useCallback((newData: T) => {
        setData(newData);
    }, []);

    return {
        data,
        isLoading,
        optimisticUpdate,
        setData: setOptimisticData,
    };
}
