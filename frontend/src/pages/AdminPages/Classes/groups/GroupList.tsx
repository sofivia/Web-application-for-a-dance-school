import { getClassGroups, type Page, ClassGroupRead } from "@/api";
import Loading from "@/components/Loading";
import Table from "@/components/Table";
import type { TableRow } from "@/components/Table";
import tablestyles from "@/styles/simpleTable.module.css"
import styles from "@/styles/items.module.css"
import { Link } from "react-router";
import Pager from "@/components/Pager";


export default function GroupList() {
    return (
        <Pager>
            {(page, setPrev, setNext, _) => {
                const load = async () => {
                    const data = await getClassGroups({ page });
                    setPrev(data.previous != null);
                    setNext(data.next != null);
                    return data;
                }
                return (
                    <div className="w-100 px-5 row-2 mb-5">
                        <Loading<Page<ClassGroupRead>> load={load}>
                            {(data: Page<ClassGroupRead>) => {
                                const rows: TableRow[][] = data.results.map(p => [
                                    { key: "pk", fields: ["PK", p.pk] },
                                    { key: "instructor", fields: ["Instruktor", p.primary_instructor.getName()] },
                                    { key: "fill", fields: ["Zapełnienie", `${p.nr_enrolled} / ${p.effective_capacity}`] },

                                ]);
                                return <>
                                    {rows.map((r, i) => {
                                        const group = data.results[i];
                                        return (<div key={i} className="text-left mb-5">
                                            <Link to={`./${group.pk}/edit`}
                                                className={`mb-1 link ${styles.itemName} ${!group.is_active ? styles.inactive : ""}`}>
                                                {group.name}
                                            </Link>
                                            <Table rows={r} className={`${tablestyles.simpleTable}`} />
                                        </div >)
                                    })}
                                    <Link className={`${styles.addItem} block font-semibold text-xl w-full`} to={"./add"}>
                                        Dodaj grupę
                                    </Link>
                                </>
                            }}
                        </Loading>
                    </div>)
            }}
        </Pager>
    );
}