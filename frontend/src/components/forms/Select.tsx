import { useId } from "react";
import styles from './Input.module.css';
import type { ReactBaseInputProps } from "./commons";

export interface ChoiceValue {
    value: string;
    setValue: React.ChangeEventHandler<HTMLSelectElement>;
};

export type Option = {
    key: string;
    value: string;
    label: string;
}

export type ReactSelectProps = ReactBaseInputProps
    & React.SelectHTMLAttributes<HTMLSelectElement> & {
        kind: 'select-react';
        values: ChoiceValue;
        prompt: string;
        options: Option[];
    };


export default function Select(props: ReactSelectProps) {
    const { values, className, prompt, options, id, ...rest } = props;
    const { value, setValue } = values;
    const autoId = useId();
    return (
        <select
            id={id ?? autoId}
            className={`${styles.control} ${className ?? ""}`}
            value={value}
            onChange={setValue}
            {...rest}
        >
            <option value=""> {prompt} </option>
            {options.map((t) => (
                <option key={t.key} value={t.value}>
                    {t.label}
                </option>
            ))}
        </select>
    );
}
