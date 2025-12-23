import { useId } from 'react';
import Input from "./Input.tsx";
import styles from "./Select.module.css";
import type { InputProps } from './commons.ts';


export type Props = InputProps & {
    label: string;
    fClassName?: string;
}

export default function InputWithLabel(props: Props) {
    const { fClassName, label } = props;
    const id = useId();
    return (
        <div className={`${styles.filter} ${fClassName ?? ""}`} >
            <label htmlFor={id} className="block mb-1"> {label} </label>
            <Input id={id} {...props} />
        </ div >
    );
}