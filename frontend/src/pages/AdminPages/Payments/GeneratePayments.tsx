import { generatePayments } from "@/api"
import type { GeneralInput } from "@/components/forms/InputList"
import FormTemplate from "@/components/FormTemplate"
import global from "@/global.module.css"

type Data = {
    year: number;
    month: number;
}

export default function GeneratePayments() {
    const fields: GeneralInput[] = [
        { name: "year", type: "number", label: "Rok", kind: "input-classic" },
        { name: "month", type: "number", label: "Miesiąc", kind: "input-classic" }
    ]
    const format = (x: Data) => new Date(x.year, x.month - 1, 1, 12).toISOString().split('T')[0];   // TODO
    return (
        <div className={global.app_container}>
            <FormTemplate<Data> redirect=".." apiCall={data => generatePayments(format(data as Data))} fields={fields} />
        </div>
    )
}
