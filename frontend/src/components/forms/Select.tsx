import { useId } from "react";
import styles from './Select.module.css';

export interface ChoiceValue {
    value: string;
    setValue: React.ChangeEventHandler<HTMLSelectElement>;
};

export type Option = {
    key: string;
    value: string;
    label: string;
}

export type SelectProps = {
    values: ChoiceValue;
    className?: string;
    id?: string;
    prompt: string;
    options: Option[];
};


export default function Select(props: SelectProps) {
    const { values, className, prompt, options, id } = props;
    const { value, setValue } = values;
    const autoId = useId();
    return (
        <select
            id={id ?? autoId}
            className={`${styles.control} ${className ?? ""}`}
            value={value}
            onChange={setValue}
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
