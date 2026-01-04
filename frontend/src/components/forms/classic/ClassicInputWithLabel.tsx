import { useId } from 'react';
import Input from "./ClassicInput.tsx";
import styles from "./Select.module.css";
import type { ClassicInputProps } from './ClassicInput.tsx';


export type Props = ClassicInputProps & {
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