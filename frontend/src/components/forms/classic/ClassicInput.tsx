import { useId } from 'react';
import styles from '../Input.module.css';
import type { ClassicBaseInputProps } from '../commons';


export type ClassicInputProps = ClassicBaseInputProps & {
    kind: "input";
    type: string;
    placeholder?: string;
}


export default function ClassicInput(props: ClassicInputProps) {
    const { id, type, error, className, name, placeholder } = props;
    const autoId = useId();
    return (
        <div className={className}>
            <input
                id={id ?? autoId}
                type={type}
                placeholder={placeholder}
                aria-invalid={!!error}
                className={`${styles.input}`}
                name={name}
            />
            {error && <div className={styles.error}>{error}</div>}
        </div>
    );
}
