import { useId } from "react";
import styles from '../Select.module.css';
import type { ClassicBaseInputProps } from "../commons";


export type Option = {
    key: string;
    value: string;
    label: string;
}

export type ClassicSelectProps =
    ClassicBaseInputProps
    & React.SelectHTMLAttributes<HTMLSelectElement>
    & {
        kind: "select-classic";
        prompt: string;
        options: Option[];
    };


export default function ClassicSelect(props: ClassicSelectProps) {
    const { className, prompt, options, id, ...rest } = props;
    const autoId = useId();
    return (
        <select
            id={id ?? autoId}
            className={`${styles.control} ${className ?? ""}`}
            {...rest}
        >
            <option value=""> {prompt} </option>
            {
                options.map((t) => (
                    <option key={t.key} value={t.value}>
                        {t.label}
                    </option>
                ))
            }
        </select >
    );
}
