import { useId } from "react";
import styles from '../Input.module.css';
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
    const { className, prompt, options, id, error, name, ...rest } = props;
    const autoId = useId();
    return (
        <div className={className}>
            <select
                id={id ?? autoId}
                name={name}
                aria-invalid={!!error}
                className={`${styles.control}`}
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
            </select>
            {error && <div className={styles.error}>{error}</div>}
        </div>
    );
}
