import { useId } from 'react';
import styles from './Input.module.css';
import type { ReactBaseInputProps, InputValues } from "./commons.ts"

export type ReactInputProps =
    ReactBaseInputProps
    & React.InputHTMLAttributes<HTMLInputElement>
    & { kind: "input-react"; values: InputValues; }

export default function Input(props: ReactInputProps) {
    const { id, values, error, name, className, ...other } = props;
    const { placeholder, value, setValue } = values;
    const autoId = useId();
    return (
        <div className={className}>
            <input
                id={id ?? autoId}
                name={name}
                placeholder={placeholder}
                value={value}
                aria-invalid={!!error}
                onChange={setValue}
                className={`${styles.input}`}
                {...other}
            />
            {error && <div className={styles.error}>{error}</div>}
        </div>
    );
}
