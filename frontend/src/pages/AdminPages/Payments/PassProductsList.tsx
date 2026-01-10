import { passProductAPI, type Page, type PassProduct } from "@/api";
import Loading from "@/components/Loading";
import Table from "@/components/Table";
import type { TableRow } from "@/components/Table";
import tablestyles from "@/styles/simpleTable.module.css"
import styles from "./Payments.module.css"
import { Link } from "react-router";
import Pager from "@/components/Pager";


export default function AccountsList() {
    return (
        <Pager>
            {(page, setPrev, setNext) => {
                const load = async () => {
                    const data = await passProductAPI.getMany({ page });
                    setPrev(data.previous != null);
                    setNext(data.next != null);
                    return data;
                }
                return (
                    <div className="w-100 px-5 row-2 mb-5">
                        <Loading<Page<PassProduct>> load={load}>
                            {(data: Page<PassProduct>) => {
                                const rows: TableRow[][] = data.results.map(p => [
                                    { key: "pk", fields: ["PK", p.id ?? "-"] },
                                    { key: "price_cents", fields: ["Cena", `${p.price_cents / 100} zł`] },
                                    { key: "descripton", fields: ["Opis", p.description ?? "-"] },
                                ]);
                                return <>
                                    {rows.map((r, i) => {
                                        const passProduct = data.results[i];
                                        return (<div key={i} className="text-left mb-5">
                                            <Link to={`./${passProduct.id}/edit`}
                                                className={`mb-1 ${styles.passName} ${!passProduct.is_active ? styles.inactive : ""}`}>
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
                    </div>)
            }}
        </Pager>
    );
}