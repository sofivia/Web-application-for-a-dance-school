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
    const { values, error, name, className, prompt, options, id, ...rest } = props;
    const { value, setValue } = values;
    const autoId = useId();
    return (
        <div className={className}>
            <select
                id={id ?? autoId}
                name={name}
                aria-invalid={!!error}
                className={`${styles.control}`}
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
            {error && <div className={styles.error}>{error}</div>}
        </div>
    );
}
