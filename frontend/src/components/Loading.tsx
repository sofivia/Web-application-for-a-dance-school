import { useEffect, useState } from "react";

export default function Loading<T>(props: { children: (data: T) => React.ReactNode; load: () => Promise<T> }) {
    const { children, load } = props;
    const [data, setData] = useState<T | null>(null);

    useEffect(() => {
        async function doLoad() {
            setData(await props.load())
        }
        doLoad();
    }, [load])

    if (!data)
        return <> Ładowanie </>
    else
        return children(data);
}