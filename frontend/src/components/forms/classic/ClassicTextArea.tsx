import styles from '../Input.module.css';
import { useId } from 'react';
import type { ClassicBaseInputProps } from '../commons';


export type ClassicTextAreaProps = ClassicBaseInputProps & {
    kind: "textarea";
    placeholder?: string;
    rows?: number;
}

export default function TextArea(props: ClassicTextAreaProps) {
    const { id, error, className, name, placeholder, rows } = props;
    const autoId = useId();

    return (
        <div className={`${className}`}>
            <textarea
                id={id ?? autoId}
                name={name}
                placeholder={placeholder}
                rows={rows}
                aria-invalid={!!error}
                className={`${styles.input} mb-1`}
            />
            {error && <div className={styles.error}>{error}</div>}
        </div>
    );
}
