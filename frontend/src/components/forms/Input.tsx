import { useId } from 'react';
import styles from './Input.module.css';
import type { InputProps } from "./commons.ts"

export default function Input(props: InputProps) {
    const { id, type, values, error, onBlur, className, name } = props;
    const { placeholder, value, setValue } = values;
    const autoId = useId();
    return (
        <div className={className}>
            <input
                id={id ?? autoId}
                type={type}
                placeholder={placeholder}
                value={value}
                onBlur={onBlur}
                aria-invalid={!!error}
                onChange={setValue}
                className={`${styles.input}`}
                name={name}
            />
            {error && <div className={styles.error}>{error}</div>}
        </div>
    );
}
