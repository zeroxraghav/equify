import { useMutation, useQuery } from "convex/react"
import { useEffect, useState } from "react";
import {toast} from "sonner";

export const useConvexQuery = (query, ...args) => {
    const res = useQuery(query, ...args);
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (res === undefined) {
            setIsLoading(true);
        }

        else {
            try {
                setData(res);
                setError(null);
            } catch (error) {
                setError(error);
                toast.error(error.message);
            }
            finally{
                setIsLoading(false);
            }
        }

    }, [res])
    return {
            data, 
            isLoading,
            error
        }
}

export const useConvexMutation = (mut, ...args) => {
    const mutFn = useMutation(mut);
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    const mutationFunction = async(...args) => {
        setIsLoading(true);
        setError(null);
        
        try {
            const res = await mutFn(...args);
            setData(res);
            return res;
        } catch (error) {
            setError(error);
            toast.error(error.message);
            throw error;
        }

        finally {
            setIsLoading(false);
        }
    }

    return {mutationFunction, data, isLoading, error};
}