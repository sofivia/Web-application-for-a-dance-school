import { useId } from 'react';
import styles from '../Checkbox.module.css';
import type { ClassicBaseInputProps } from '../commons';


export type ClassicCheckboxProps = ClassicBaseInputProps
    & React.InputHTMLAttributes<HTMLInputElement>
    & {
        kind: "checkbox-classic";
        label?: string;
        fClassName?: string;
    };


export default function ClassicCheckbox(props: ClassicCheckboxProps) {
    const { id, error, className, name, label, fClassName, ...rest } = props;
    const autoId = useId();
    return (
        <div className={`${styles.checkbox} ${className} ${fClassName}`}>
            <input
                id={id ?? autoId}
                type="checkbox"
                aria-invalid={!!error}
                className={`${styles.input}`}
                name={name}
                {...rest}
            />
            <label htmlFor={id ?? autoId}> {label} </label>
            {error && <div className={styles.error}>{error}</div>}
        </div>
    );
}
