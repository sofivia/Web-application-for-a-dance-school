import { getPassProducts, type Page, type PassProduct } from "@/api";
import { useEffect, useState } from "react";
import Loading from "@/components/Loading";
import globals from "@/global.module.css"
import Table from "@/components/Table";
import type { TableRow } from "@/components/Table";
import tablestyles from "@/styles/simpleTable.module.css"
import styles from "./Payments.module.css"
import { Link } from "react-router";

export default function AccountsList() {
    const [page, setPage] = useState(1);

    return (
        <div className={globals.app_container}>
            <div className="w-100 px-5">
                <Loading<Page<PassProduct>> load={() => getPassProducts({ page })}>
                    {(data: Page<PassProduct>) => {
                        const rows: TableRow[][] = data.results.map(p => [
                            { key: "pk", fields: ["PK", p.id ?? "-"] },
                            { key: "price_cents", fields: ["Cena", `${p.price_cents / 100} zł`] },
                            { key: "descripton", fields: ["Opis", p.description ?? "-"] },
                        ]);
                        return <>
                            {rows.map((r, i) => {
                                const passProduct = data.results[i];
                                return (<div className="text-left mb-5">
                                    <Link to={`./${passProduct.id}/edit`}
                                        className={`block font-bold text-4xl mb-1 ${!passProduct.is_active ? styles.inactive : ""}`}>
                                        {passProduct.name}
                                    </Link>
                                    <Table rows={r} className={`${tablestyles.simpleTable}`} />
                                </div >)
                            })}
                            <Link className={`${styles.addPass} block font-semibold text-xl w-full`} to={"./add"}>
                                Dodaj karnet
                            </Link>
                        </>
                    }}
                </Loading>
            </div>
        </div >
    );
}