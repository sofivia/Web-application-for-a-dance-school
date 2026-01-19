import global from "@/global.module.css";
import Table, { type TableRow } from "@/components/Table";
import Button from "@/components/Button";
import { Navigate, useNavigate, useParams } from "react-router";
import Loading from "@/components/Loading";
import liststyles from "@/styles/list.module.css"
import tablestyles from "@/styles/simpleTable.module.css"
import { deleteClassGroup, ClassTypeRead, getClassType } from "@/api";


export default function GroupTypeDetails() {
    const nav = useNavigate();
    const { id } = useParams();

    if (!id)
        return <Navigate to="../types" />

    const onDelete = async () => {
        await deleteClassGroup.do(id);
        nav(`../types`);
    }

    return (
        <div className={global.app_container}>
            <div className={liststyles.listPane}>
                <Loading<ClassTypeRead> load={() => getClassType.do(id)}>
                    {(data: ClassTypeRead, _) => {
                        const rows: TableRow[] = [
                            { key: "PK", fields: ["PK", data.id] },
                            { key: "name", fields: ["Nazwa", data.name] },
                            { key: "level", fields: ["Poziom", data.level] },
                            { key: "duration", fields: ["Czas trwania (minuty)", `${data.duration_minutes}`] },
                            { key: "capacity", fields: ["Domyślna liczba uczestników", `${data.default_capacity}`] },
                            { key: "description", fields: ["Opis", data.description] },
                            { key: "is_active", fields: ["Czy aktywna", data.is_active ? "Tak" : "Nie"] },
                        ];
                        return (<>
                            <Table rows={rows} className={`${tablestyles.simpleTable} mb-3`} style={{ overflowWrap: "anywhere" }} />
                            <div className="space-x-3">
                                <Button onClick={onDelete} className="bg-red-500!"> Usuń </Button>
                                <Button onClick={() => nav(`./edit`)}> Edytuj </Button>
                            </div>
                        </>
                        )
                    }}
                </Loading>
            </div >
        </div >)
}