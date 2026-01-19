import global from "@/global.module.css";
import Table, { type TableRow } from "@/components/Table";
import Button from "@/components/Button";
import { Navigate, useNavigate, useParams } from "react-router";
import Loading from "@/components/Loading";
import liststyles from "@/styles/list.module.css"
import tablestyles from "@/styles/simpleTable.module.css"
import { deleteClassGroup, getClassGroup, ClassGroupRead } from "@/api";
import { getWeekday, formatDate } from "@/utils/dateUtils";


export default function GroupDetails() {
    const nav = useNavigate();
    const { id } = useParams();

    if (!id)
        return <Navigate to="../groups" />

    const onDelete = async () => {
        await deleteClassGroup.do(id);
        nav(`../groups`);
    }

    return (
        <div className={global.app_container}>
            <div className={liststyles.listPane}>
                <Loading<ClassGroupRead> load={() => getClassGroup.do(id)}>
                    {(data: ClassGroupRead, _) => {
                        const rows: TableRow[] = [
                            { key: "PK", fields: ["PK", data.pk] },
                            { key: "name", fields: ["Nazwa", data.name] },
                            { key: "weekday", fields: ["Dzień tygodnia", getWeekday(data.weekday)] },
                            { key: "start_time", fields: ["Godzina rozpoczęcia", data.start_time] },
                            { key: "end_time", fields: ["Godzina zakończenia", data.end_time] },
                            { key: "location", fields: ["Studio", data.location.name] },
                            { key: "fill", fields: ["Zapełnienie", `${data.nr_enrolled} / ${data.effective_capacity}`] },
                            { key: "start_data", fields: ["Dzień rozpoczęcia", formatDate(data.start_date)] },
                            { key: "end_data", fields: ["Dzień zakończenia", formatDate(data.end_date)] },
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