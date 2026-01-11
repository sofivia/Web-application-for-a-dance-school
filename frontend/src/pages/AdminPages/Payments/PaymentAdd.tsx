import Loading from "@/components/Loading";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { getAccounts, PaymentPost, createPayment, passProductAPI, PassProduct, type Page } from "@/api";

import globals from "@/global.module.css"
import InputWithLabel from "@/components/forms/InputWithLabel";
import { handlePost2, getErrors } from "@/utils/apiutils";
import toast from 'react-hot-toast';
import formstyle from '@/styles/forms.module.css'
import SelectWithLabel from "@/components/forms/SelectWithLabel";
import { firstOfTheNextMonth } from "@/utils/dateUtils";


export default function PaymentAdd() {
    const nav = useNavigate();

    const [studentId, setStudentId] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const getStudentOptions = async (inputValue: string) => {
        const res = await getAccounts({ page: 1, surname: inputValue });
        return res.results
            .filter(acc => acc.studentInfo)
            .map(student => ({
                value: student.pk,
                label: `${student.studentInfo?.first_name} ${student.studentInfo?.last_name}`
            }));
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!studentId)
            return;

        const formData = new FormData(e.currentTarget);
        const rawData = Object.fromEntries(formData.entries()) as Record<string, string>;
        const { year, month } = rawData;
        const payment = {
            ...rawData, student: studentId, period_start: `${year}-${month}-01`,
            period_end: firstOfTheNextMonth(parseInt(year), parseInt(month))
        } as any as PaymentPost;
        toast.promise(handlePost2(() => createPayment(payment)), {
            loading: 'Ładowanie...',
            success: () => {
                setTimeout(() => nav(`../payments`), 300);
                return <b> Sukces </b>;
            },
            error: (err) => {
                setErrors(getErrors(err));
                return <b> Błąd </b>
            }
        });
    };

    const statusOptions = [
        { key: "1", label: "Oczekująca", value: "pending" },
        { key: "2", label: "Opłacona", value: "paid" },
        { key: "3", label: "Darowana", value: "void" },
    ];
    const methodOptions = [
        { key: "1", label: "Gotówka", value: "cash" },
        { key: "2", label: "Przelew", value: "transfer" },
        { key: "3", label: "Karta", value: "card" },
    ];

    return (
        <div className={globals.app_container}>
            <div className="flex flex-col gap-3 w-full max-w-150 px-2">
                <Loading<Page<PassProduct>> load={() => passProductAPI.getMany(1, { is_active: true })}>
                    {(data: Page<PassProduct>) => {
                        const options = data.results.map(p => ({ key: p.id as string, label: p.name, value: p.id as string }))
                        return (
                            <form onSubmit={handleSubmit} noValidate className="space-y-3">
                                <SelectWithLabel label="Nazwisko studenta" getOptions={getStudentOptions} onSelect={id => setStudentId(id)} kind="async-select" />
                                <SelectWithLabel name="product" prompt="Wybierz" options={options} label="Karnet" error={errors["product"]} kind="select-classic" />
                                <InputWithLabel name="year" type="number" label="Rok" error={errors["period_start"]} kind="input-classic" />
                                <InputWithLabel name="month" type="number" label="Miesiąc (liczba)" kind="input-classic" />
                                <SelectWithLabel name="status" prompt="Wybierz" options={statusOptions} label="Status" error={errors["status"]} kind="select-classic" />
                                <SelectWithLabel name="method" prompt="Wybierz" options={methodOptions} label="Metoda płatności" error={errors["method"]} kind="select-classic" />
                                <button type="submit" className={`${formstyle.button} w-full mt-5`}>
                                    Zatwierdź
                                </button>
                            </form>)
                    }}
                </Loading>
            </div>
        </div>
    );
}