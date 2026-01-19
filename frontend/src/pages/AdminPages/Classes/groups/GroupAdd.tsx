import Loading from "@/components/Loading";
import { useId, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router";
import { getAccounts, ClassTypeRead, getClassTypes, getLocations, createClassGroup, getClassGroup } from "@/api";
import type { ClassGroupRead, ClassGroupWrite, Location } from "@/api.ts";

import globals from "@/global.module.css"
import InputWithLabel from "@/components/forms/InputWithLabel";
import { handlePost2, getErrors } from "@/utils/apiutils";
import toast from 'react-hot-toast';
import formstyle from '@/styles/forms.module.css'
import SelectWithLabel from "@/components/forms/SelectWithLabel";
import { weekdays } from "@/utils/apiutils";
import { getWeekday, formatDate } from "@/utils/dateUtils";
import ClassicCheckbox from "@/components/forms/classic/ClassicCheckbox";


type Results = {
    locations: Location[];
    classTypes: ClassTypeRead[];
    dft?: ClassGroupRead;
};

export default function GroupAdd() {
    const { id } = useParams();
    const nav = useNavigate();

    const [instructorId, setInstructorId] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const load = async () => {
        const t1 = getClassTypes();
        const t2 = getLocations();
        const t3 = id ? getClassGroup.do(id) : new Promise(() => undefined);
        const [r1, r2, r3] = await Promise.all([t1, t2, t3]);
        return { classTypes: r1, locations: r2, dft: r3 } as Results;
    }

    const getInstructorOptions = async (inputValue: string) => {
        const res = await getAccounts({ page: 1, surname: inputValue });
        return res.results
            .filter(acc => acc.instructorInfo)
            .map(instructor => ({
                value: instructor.instructorInfo?.id ?? "",
                label: `${instructor.instructorInfo?.first_name} ${instructor.instructorInfo?.last_name}`
            }));
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!instructorId) {
            setErrors(x => ({ ...x, primary_instructor: "wybierz instruktora" }));
            return;
        }

        const formData = new FormData(e.currentTarget);
        const rawData = Object.fromEntries(formData.entries()) as Record<string, string>;
        const group = { ...rawData, primary_instructor: instructorId } as ClassGroupWrite;
        toast.promise(handlePost2(() => createClassGroup(group)), {
            loading: 'Ładowanie...',
            success: () => {
                setTimeout(() => nav(`../groups`), 300);
                return <b> Sukces </b>;
            },
            error: (err) => {
                setErrors(getErrors(err));
                return <b> Błąd </b>
            }
        });
    };

    return (
        <div className={globals.app_container}>
            <div className="flex flex-col gap-3 w-full max-w-150 px-2">
                <Loading<Results> load={load}>
                    {(results: Results) => {
                        const optionsL = results.locations.map(l => ({ key: l.pk, label: l.name, value: l.pk }))
                        const optionsT = results.classTypes.map(t => ({ key: t.id, label: t.name, value: t.id }))
                        const dft = results.dft;
                        return (
                            <form onSubmit={handleSubmit} noValidate className="space-y-3">
                                <InputWithLabel name="name" label="Nazwa" defaultValue={dft?.name} kind="input-classic" />
                                <SelectWithLabel name="class_type" prompt="Wybierz" options={optionsT} label="Typ" error={errors["product"]} kind="select-classic" />
                                <SelectWithLabel name="primary_instructor" label="Nazwisko instruktora" error={errors["primary_instructor"]}
                                    getOptions={getInstructorOptions} onSelect={id => setInstructorId(id)} kind="async-select" />
                                <SelectWithLabel name="weekday" label="Dzień tygodnia" prompt="Wybierz" defaultValue={dft?.weekday && getWeekday(dft.weekday)} options={weekdays} kind="select-classic" />
                                <InputWithLabel name="start_time" type="time" label="Czas rozpoczęcia" defaultValue={dft?.start_time} error={errors["start_time"]} kind="input-classic" />
                                <InputWithLabel name="end_time" type="time" label="Czas zakończenia" defaultValue={dft?.end_time} error={errors["end_time"]} kind="input-classic" />
                                <SelectWithLabel name="location" label="Studio" prompt="Wybierz" options={optionsL} kind="select-classic" />
                                <InputWithLabel name="capacity" type="number" label="Liczba uczestników" defaultValue={dft?.effective_capacity} error={errors["capacity"]} kind="input-classic" />
                                <InputWithLabel name="start_date" type="date" label="Dzień rozpoczęcia" defaultValue={dft?.start_date && formatDate(dft.start_date)} error={errors["start_date"]} kind="input-classic" />
                                <InputWithLabel name="end_date" type="date" label="Dzień zakończenia" defaultValue={dft?.end_date && formatDate(dft.end_date)} error={errors["end_date"]} kind="input-classic" />
                                <ClassicCheckbox name="is_active" label="Czy aktywny" kind="checkbox-classic" defaultChecked={!dft || dft.is_active} />
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