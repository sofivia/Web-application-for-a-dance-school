import styles from './Input.module.css';
import { useId } from 'react';
import type { InputProps } from "./commons.ts"


export default function TextArea(props: InputProps) {
    const { values, error, onBlur, className, rows, name } = props;
    const { placeholder, value, setValue } = values;
    const id = useId();

    return (
        <div className={`${className}`}>
            <label className="block text-left mb-1" htmlFor={id}>{name}</label>
            <textarea
                id={id}
                placeholder={placeholder}
                value={value}
                onBlur={onBlur}
                aria-invalid={!!error}
                onChange={setValue}
                className={`${styles.input} mb-1`}
                rows={rows}
            />
            {error && <div className={styles.error}>{error}</div>}
        </div>
    );
}
