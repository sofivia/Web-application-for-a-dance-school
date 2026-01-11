import { useEffect, useState } from "react";

export type Props<T> = {
    children: (data: T) => React.ReactNode;
    load: () => Promise<T>;
    loadingNode?: React.ReactNode;
}

export default function Loading<T>(props: Props<T>) {
    const { children, load, loadingNode } = props;
    const [data, setData] = useState<T | null>(null);

    useEffect(() => {
        async function doLoad() {
            setData(await props.load())
        }
        doLoad();
    }, [load])

    if (!data)
        return loadingNode ?? <> Ładowanie </>;
    else
        return children(data);
}