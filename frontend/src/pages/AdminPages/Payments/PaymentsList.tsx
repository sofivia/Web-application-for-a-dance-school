import { markPaid, Payment, paymentAPI, PaymentParams, voidPayment, type Page } from "@/api";
import Loading from "@/components/Loading";
import { Link } from "react-router";
import Pager from "@/components/Pager";
import Button from "@/components/Button";
import styles from "./Payments.module.css"
import tablestyles from "@/styles/listTable.module.css"
import formstyles from "@/styles/forms.module.css"
import InputWithLabel from "@/components/forms/InputWithLabel";
import SelectWithLabel from "@/components/forms/SelectWithLabel";
import type { Option } from "@/components/forms/Select";
import { getErrors, paymentStatusToPL } from "@/utils/apiutils";
import { useState, type FormEvent } from "react";
import { plainToInstance } from 'class-transformer';
import { dateToMonth } from "@/utils/dateUtils";
import { handlePost } from "@/utils/apiutils";
import LinkButton from "@/components/LinkButton";


export default function PaymentsList() {
    const [filters, setFilters] = useState<PaymentParams>();
    const [dateError, setDateError] = useState<string>();

    const options: Option[] = [
        { key: "pending", value: "pending", label: "Oczekująca" },
        { key: "paid", value: "paid", label: "Zapłacona" },
        { key: "void", value: "void", label: "Darowana" },
    ];

    return (
        <Pager>
            {(page, setPrev, setNext, setPage) => {
                const onFilter = async (e: FormEvent<HTMLFormElement>) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const params = plainToInstance(PaymentParams, Object.fromEntries(formData.entries()));
                    if ((params.period_start?.getDate() ?? 1) != 1)
                        return setDateError("Musi być pierwszy dzień miesiąca");
                    setDateError(undefined);
                    setFilters(params);
                    setPage(1);
                }
                const load = async () => {
                    const data = await paymentAPI.getMany(page, filters);
                    setPrev(data.previous != null);
                    setNext(data.next != null);
                    return data;
                }
                return (
                    <>
                        <form onSubmit={onFilter} className={`${formstyles.filtersBar} ${formstyles.panel} ${styles.page} mb-5`}>
                            <InputWithLabel name="student_name" label="Nazwisko studenta" kind="input-classic" />
                            <InputWithLabel name="product_name" label="Karnet" kind="input-classic" />
                            <InputWithLabel name="period_start" type="date" label="Pierwszy dzień miesiąca" error={dateError} kind="input-classic" />
                            <SelectWithLabel name="status" label="Karnet" options={options} prompt="Wybierz status" kind="select-classic" />

                            <Button type="submit" className={styles.filterBtn}>
                                Filtruj
                            </Button>
                        </form>
                        <div className={`${styles.page} mb-5`}>
                            <h1 className="mb-5"> Płatności </h1>
                            <div className="mb-3 space-x-2 w-fit">
                                <LinkButton to={`./generate`}> Wygeneruj płatności </LinkButton>
                                <LinkButton to={`./add`}> Dodaj płatność </LinkButton>
                            </div>
                            <div className={styles.tableWrap}>
                                <table className={`${styles.table} ${tablestyles.listTable}`}>
                                    <thead>
                                        <tr>
                                            <th> Student </th>
                                            <th> Miesiąc </th>
                                            <th> Status </th>
                                            <th>  </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <Table load={load} />
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>)
            }}
        </Pager>
    );
}

function Table(props: { load: () => Promise<Page<Payment>> }) {
    const [errors, setErrors] = useState<Record<string, string>>({});
    return (
        <Loading<Page<Payment>> load={props.load} loadingNode={<tr><td>Ładowanie</td></tr>}>
            {(data: Page<Payment>, reload) => {
                const on = async (cb: () => any) => {
                    const msg = await handlePost(() => cb());
                    if (msg !== undefined)
                        setErrors((prev) => ({ ...prev, ...getErrors(msg) }));
                    reload()
                }
                return <>
                    {data.count == 0 &&
                        <tr>
                            <td className="text-center" colSpan={4}> Brak pasujących wierszy </td>
                        </tr>}
                    {data.results.map((p, i) => {
                        const pt = plainToInstance(Payment, p);
                        const color = pt.status == "paid" ? "text-green-500"
                            : pt.status == "pending" ? "text-yellow-500" : "";

                        return (
                            <tr key={i}>
                                <td> {pt.student_name} </td>
                                <td> {`${dateToMonth(pt.period_start)}`} </td>
                                <td className={color}> {paymentStatusToPL(pt.status)} </td>
                                <td>
                                    <div className="flex justify-between flex-col md:flex-row gap-4 items-center">
                                        <Button onClick={() => on(() => markPaid(pt.id))} className="link"> Opłać </Button>
                                        <Button onClick={() => on(() => voidPayment(pt.id))} className="link"> Daruj </Button>
                                        <Link to={`./${pt.id}`} className="link"> Szczegóły </Link>
                                    </div>
                                </td>
                            </tr>)
                    })}
                    {Object.keys(errors).length != 0 && <tr>
                        <td className="text-center bg-red-400 font-bold" colSpan={4}> Błędy </td>
                    </tr>}
                    {Object.entries(errors).map(p => (
                        <tr key={p[0]}>
                            <td> {p[0]} </td>
                            <td colSpan={3}> {p[1]} </td>
                        </tr>
                    ))}
                </>
            }}
        </Loading>)
}