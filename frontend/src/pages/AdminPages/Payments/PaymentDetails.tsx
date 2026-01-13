import global from "@/global.module.css";
import Table, { type TableRow } from "@/components/Table";
import Button from "@/components/Button";
import { Navigate, useNavigate, useParams } from "react-router";
import Loading from "@/components/Loading";
import liststyles from "@/styles/list.module.css"
import tablestyles from "@/styles/simpleTable.module.css"
import { Payment, paymentAPI } from "@/api";
import { plainToInstance } from "class-transformer";
import { dateToMonth } from "@/utils/dateUtils";
import { paymentStatusToPL } from "@/utils/apiutils";


export default function PaymentDetails() {
    const nav = useNavigate();
    const { id } = useParams();

    if (!id)
        return <Navigate to="../payments" />

    const deletePayment = async () => {
        await paymentAPI.delete(id);
        nav(`../payments`);
    }

    return (
        <div className={global.app_container}>
            <div className={liststyles.listPane}>
                <Loading<Payment> load={() => paymentAPI.get(id)}>
                    {(data: Payment, _) => {
                        const p = plainToInstance(Payment, data);
                        const rows: TableRow[] = [
                            { key: "PK", fields: ["PK", p.id] },
                            { key: "student_name", fields: ["Student", p.student_name] },
                            { key: "product", fields: ["Karnet", p.product_name] },
                            { key: "period_start", fields: ["Miesiąc", dateToMonth(p.period_start)] },
                            { key: "status", fields: ["Status", paymentStatusToPL(p.status)] },
                        ];
                        return (<>
                            <Table rows={rows} className={`${tablestyles.simpleTable} mb-3`} style={{ overflowWrap: "anywhere" }} />
                            <div className="space-x-3">
                                <Button onClick={deletePayment} className="bg-red-500!"> Usuń </Button>
                            </div>
                        </>
                        )
                    }}
                </Loading>
            </div >
        </div >)
}