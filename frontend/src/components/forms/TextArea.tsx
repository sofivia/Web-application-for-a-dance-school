import styles from './Input.module.css';
import { useId } from 'react';
import type { ReactBaseInputProps } from "./commons.ts"


export type ReactTextAreaProps = ReactBaseInputProps
    & React.TextareaHTMLAttributes<HTMLTextAreaElement>
    & { kind: 'textarea-react' }

export default function TextArea(props: ReactTextAreaProps) {
    const { values, error, className, name, ...rest } = props;
    const { placeholder, value, setValue } = values;
    const id = useId();


    return (
        <div className={`${className}`}>
            <label className="block text-left mb-1" htmlFor={id}>{name}</label>
            <textarea
                id={id}
                placeholder={placeholder}
                value={value}
                aria-invalid={!!error}
                onChange={setValue}
                className={`${styles.input} mb-1`}
                {...rest}
            />
            {error && <div className={styles.error}>{error}</div>}
        </div>
    );
}
