import { paymentAPI, type Page, type Payment, type PaymentParams } from "@/api";
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
import { paymentStatusToPL } from "@/utils/apiutils";
import { useState, type FormEvent } from "react";


export default function PaymentsList() {
    const [filters, setFilters] = useState<PaymentParams>();

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
                    setFilters(Object.fromEntries(formData.entries()) as PaymentParams);
                    setPage(1);
                }
                const load = async () => {
                    const data = await paymentAPI.getMany({ ...filters, page });
                    setPrev(data.previous != null);
                    setNext(data.next != null);
                    return data;
                }
                return (
                    <>
                        <form onSubmit={onFilter} className={`${formstyles.filtersBar} ${formstyles.panel} ${styles.page} mb-5`}>
                            <InputWithLabel name="student_name" label="Nazwisko studenta" kind="input-classic" />
                            <InputWithLabel name="product_name" label="Karnet" kind="input-classic" />
                            <SelectWithLabel name="status" label="Karnet" options={options} prompt="Wybierz status" kind="select-classic" />

                            <Button type="submit" className={styles.filterBtn}>
                                Filtruj
                            </Button>
                        </form>
                        <div className={`${styles.page} mb-5`}>
                            <h1 className="mb-5"> Płatności </h1>
                            <div className={styles.tableWrap}>
                                <table className={`${styles.table} ${tablestyles.listTable}`}>
                                    <thead>
                                        <tr>
                                            <th> Student </th>
                                            <th> Karnet </th>
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
    return (
        <Loading<Page<Payment>> load={props.load} loadingNode={<tr><td>Ładowanie</td></tr>}>
            {(data: Page<Payment>) => {
                return <>
                    {data.count == 0 &&
                        <tr>
                            <td className="text-center" colSpan={4}> Brak pasujących wierszy </td>
                        </tr>}
                    {data.results.map((p, i) => (
                        <tr key={i}>
                            <td> {p.student_name} </td>
                            <td> {p.product_name} </td>
                            <td> {paymentStatusToPL(p.status)} </td>
                            <td>
                                <Link to={`./${p.id}`} className="link"> Szczegóły </Link>
                            </td>
                        </tr>
                    ))}
                </>
            }}
        </Loading>)
}