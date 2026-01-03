import { useId } from 'react';
import styles from '../Checkbox.module.css';
import type { ClassicBaseInputProps } from '../commons';


export type ClassicCheckboxProps = ClassicBaseInputProps & {
    kind: "checkbox";
    checked: boolean;
    label?: string;
    fClassName?: string;
}


export default function ClassicCheckbox(props: ClassicCheckboxProps) {
    const { id, error, className, name, checked, label, fClassName } = props;
    const autoId = useId();
    return (
        <div className={`${styles.checkbox} ${className} ${fClassName}`}>
            <input
                id={id ?? autoId}
                type="checkbox"
                aria-invalid={!!error}
                className={`${styles.input}`}
                name={name}
                defaultChecked={checked}
            />
            <label htmlFor={id ?? autoId}> {label} </label>
            {error && <div className={styles.error}>{error}</div>}
        </div>
    );
}
