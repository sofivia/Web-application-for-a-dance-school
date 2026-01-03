import { useNavigate } from "react-router-dom";
import { useState, type FormEvent } from "react";
import { handlePost2, getErrors } from "@/utils/apiutils.ts";
import InputWithLabel, { type ClassicInputWithLabelProps } from "./forms/InputWithLabel";
import SelectWithLabel, { type ClassicSelectWithLabelProps } from "./forms/SelectWithLabel";
import TextAreaWithLabel, { type ClassicTextAreaWithLabelProps } from "./forms/TextAreaWithLabel"
import ClassicCheckbox, { type ClassicCheckboxProps } from "./forms/classic/ClassicCheckbox";
import toast from 'react-hot-toast';


import "@/index.css";
import formstyle from "@/styles/forms.module.css";


type Errors = Record<string, string>;
export type ApiCall<T> = (data: Record<string, any>) => Promise<T>;

export type Field = ClassicInputWithLabelProps
    | ClassicTextAreaWithLabelProps
    | ClassicSelectWithLabelProps
    | ClassicCheckboxProps;

export type Props<T> = {
    apiCall: ApiCall<T>;
    fields: Field[];
    redirect: string;
};


function Element(props: Field) {
    console.log(props.kind)
    if (props.kind == "textarea")
        return <TextAreaWithLabel {...props} />
    if (props.kind == "select")
        return <SelectWithLabel {...props} />
    if (props.kind == "checkbox")
        return <ClassicCheckbox {...props} />
    return <InputWithLabel {...props} />
}

export default function FormTemplate<T>(props: Props<T>) {
    const { apiCall, fields, redirect } = props;
    const navigate = useNavigate();

    const [isLoading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Errors>({});

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const rawData = Object.fromEntries(formData.entries()) as Record<string, any>;
        const data = Object.fromEntries(fields.map(f => [f.name, rawData[f.name] ?? false]));
        toast.promise(handlePost2(() => apiCall(data)), {
            loading: 'Ładowanie...',
            success: () => {
                setLoading(false);
                setTimeout(() => navigate(redirect), 300);
                return <b> Sukces </b>;
            },
            error: (err) => {
                setLoading(false);
                setErrors(getErrors(err));
                return <b> Błąd </b>
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className={formstyle.form} noValidate>
            {fields.map(f => Element({ ...f, error: errors[f.name], fClassName: "mb-2" }))}
            <div className="mb-3" />

            <button type="submit" className={formstyle.button} disabled={isLoading}>
                {isLoading ? "Przetwarzanie" : "Zatwierdź"}
            </button>
        </form>
    );
}
