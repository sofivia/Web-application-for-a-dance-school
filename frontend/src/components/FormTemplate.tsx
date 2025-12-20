import { useNavigate } from "react-router-dom";
import { useState, type FormEvent } from "react";
import type { AxiosResponse } from "axios";
import Input from "@/components/forms/Input.tsx";
import type { InputValues } from "@/components/forms/commons.ts";
import { handlePost, getErrors } from "@/utils/apiutils.ts";

import "@/index.css";
import inputstyles from "@/components/forms/Input.module.css";
import formstyle from "@/styles/forms.module.css";
import TextArea from "./forms/TextArea";

type Errors = Record<string, string>;

export interface BaseField {
    type: string;
    key: string;
    placeholder: string;
    name?: string;
}

export interface TextAreaField extends BaseField {
    type: "textarea";
    rows?: number;
}

export type ApiCall = (data: Record<string, string>) => Promise<AxiosResponse<any, any, {}>>;

type Props = {
    apiCall: ApiCall;
    fields: BaseField[];
    redirect: string;
};

export default function FormTemplate(props: Props) {
    const { apiCall, fields, redirect } = props;
    const navigate = useNavigate();

    const [isLoading, setLoading] = useState(false);
    const [data, setData] = useState(Object.fromEntries(fields.map(field => [field.key, ""])));
    const [errors, setErrors] = useState<Errors>({});

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log("submit");
        setLoading(true);
        const msg = await handlePost(() => apiCall(data));
        if (msg === undefined) navigate(redirect);
        else setErrors(getErrors(msg));
        setLoading(false);
    };

    const types = Object.fromEntries(fields.map(f => [f.key, f.type]));
    const extra = Object.fromEntries(fields.map(f => [f.key, { "name": f.name, "rows": (f as TextAreaField)?.rows }]));
    const values: Record<string, InputValues> = Object.fromEntries(fields.map(f => [f.key, {
        value: data[f.key],
        setValue: e => setData(old => ({ ...old, [f.key]: e.target.value })),
        placeholder: f.placeholder,
    }]));

    return (
        <form onSubmit={handleSubmit} className={formstyle.form} noValidate>
            {errors.account && <p className={`${inputstyles.error} mb-1`}>{errors.account}</p>}

            {Object.entries(values).map(([k, v]) => {
                const Element = types[k] == "textarea" ? TextArea : Input;
                return <Element type={types[k]} key={k} values={v} error={errors[k]} className="mb-3" {...extra[k]} />
            })}
            <div className="mb-2" />

            <button type="submit" className={formstyle.button} disabled={isLoading}>
                {isLoading ? "Przetwarzanie" : "Zatwierdź"}
            </button>
        </form>
    );
}
