import { getClassTypes, ClassTypeRead } from "@/api";
import Loading from "@/components/Loading";
import Table from "@/components/Table";
import type { TableRow } from "@/components/Table";
import tablestyles from "@/styles/simpleTable.module.css"
import styles from "@/styles/items.module.css"
import { Link } from "react-router";
import globals from "@/global.module.css";


export default function GroupTypeList() {
    return (
        <div className={globals.app_container}>
            <div className="w-100 px-5 row-2 mb-5">
                <Loading<ClassTypeRead[]> load={getClassTypes}>
                    {(data: ClassTypeRead[]) => {
                        const rows: TableRow[][] = data.map(t => [
                            { key: "pk", fields: ["PK", t.id] },
                            { key: "name", fields: ["PK", t.name] }
                        ]);
                        return <>
                            {rows.map((r, i) => {
                                const type = data[i];
                                return (<div key={i} className="text-left mb-5">
                                    <Link to={`./${type.id}`}
                                        className={`mb-1 link ${styles.itemName} ${!type.is_active ? styles.inactive : ""}`}>
                                        {type.name}
                                    </Link>
                                    <Table rows={r} className={`${tablestyles.simpleTable}`} />
                                </div >)
                            })}
                            <Link className={`${styles.addItem} block font-semibold text-xl w-full`} to={"./add"}>
                                Dodaj typ grupy
                            </Link>
                        </>
                    }}
                </Loading>
            </div>
        </div>
    );
}