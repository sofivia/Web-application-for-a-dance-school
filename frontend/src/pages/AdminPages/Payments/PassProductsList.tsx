import { getPassProducts, type PassProduct } from "@/api";
import { useEffect, useState } from "react";
import Loading from "@/components/Loading";

export default function AccountsList() {
    const [passProducts, setPassProducts] = useState<PassProduct[]>([]);
    const [page, setPage] = useState(1);

    return (
        <Loading<PassProduct[]> load={() => getPassProducts({ page })}>
            {(data: PassProduct[]) => <>{data}</>}
        </Loading>
    );
}