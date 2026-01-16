import { useId } from 'react';
import styles from '../Input.module.css';
import type { ClassicBaseInputProps } from '../commons';


export type ClassicInputProps =
    ClassicBaseInputProps
    & React.InputHTMLAttributes<HTMLInputElement>
    & { kind: "input-classic"; }


export default function ClassicInput(props: ClassicInputProps) {
    const { id, error, className, name, ...rest } = props;
    const autoId = useId();
    return (
        <div className={className}>
            <input
                id={id ?? autoId}
                aria-invalid={!!error}
                className={`${styles.input}`}
                name={name}
                {...rest}
            />
            {error && <div className={styles.error}>{error}</div>}
        </div>
    );
}
