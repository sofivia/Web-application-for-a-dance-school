import { useId } from 'react';
import Select from "./Select.tsx";
import type { SelectProps } from "./Select.tsx";
import styles from "./Select.module.css";


export type Props = SelectProps & {
    label: string;
    fClassName?: string;
}

export default function SelectWithLabel(props: Props) {
    const { fClassName, label } = props;
    const id = useId();
    return (
        <div className={`${styles.filter} ${fClassName ?? ""}`} >
            <label htmlFor={id} className="block mb-1"> {label} </label>
            <Select id={id} {...props} />
        </ div >
    );
}