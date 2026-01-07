import styles from '../Input.module.css';
import { useId } from 'react';
import type { ClassicBaseInputProps } from '../commons';


export type ClassicTextAreaProps =
    ClassicBaseInputProps
    & React.HTMLAttributes<HTMLTextAreaElement>
    & { kind: "textarea"; }

export default function TextArea(props: ClassicTextAreaProps) {
    const { id, error, className, name, ...rest } = props;
    const autoId = useId();

    return (
        <div className={`${className}`}>
            <textarea
                id={id ?? autoId}
                name={name}
                aria-invalid={!!error}
                className={`${styles.input} mb-1`}
                {...rest}
            />
            {error && <div className={styles.error}>{error}</div>}
        </div>
    );
}
