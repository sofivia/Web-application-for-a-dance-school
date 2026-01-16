import styles from '../Input.module.css';
import { useId } from 'react';
import type { ClassicBaseInputProps } from '../commons';


export type ClassicTextAreaProps =
    ClassicBaseInputProps
    & React.TextareaHTMLAttributes<HTMLTextAreaElement>
    & { kind: "textarea-classic"; }

export default function ClassicTextArea(props: ClassicTextAreaProps) {
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
