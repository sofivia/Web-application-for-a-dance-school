import { useState, useEffect } from "react";
import type { AxiosResponse } from "axios";


type FetchFunc<T> = (ctrl: AbortController) => Promise<AxiosResponse<T>>;

export default function useFetch<T>(fetchfunc: FetchFunc<T>) {
    const [data, setData] = useState<T>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError(null);

        fetchfunc(controller)
            .then(res => setData(res.data))
            .catch(err => { setError(err); })
            .finally(() => setLoading(false));

        return () => controller.abort();
    }, [fetchfunc]);

    return { data, loading, error };
}