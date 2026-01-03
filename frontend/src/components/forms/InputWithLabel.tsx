import { useId } from 'react';
import Input from "./Input.tsx";
import styles from "./Select.module.css";
import type { InputProps } from './commons.ts';
import type { ClassicInputProps } from './classic/ClassicInput.tsx';
import ClassicInput from './classic/ClassicInput.tsx';


type Props = {
    label?: string;
    fClassName?: string;
}

export type InputWithLabelProps = InputProps & Props & { kind: 'react' };
export type ClassicInputWithLabelProps = ClassicInputProps & Props;


export default function InputWithLabel(props: InputWithLabelProps | ClassicInputWithLabelProps) {
    const { fClassName, label } = props;
    const id = useId();
    const renderInput = () => {
        if (props.kind == "react")
            return <Input id={id} {...props} />
        else
            return <ClassicInput id={id} {...props} />
    }
    return (
        <div className={`${styles.filter} ${fClassName ?? ""}`} >
            {label && <label htmlFor={id} className="block mb-1"> {label} </label>}
            {renderInput()}
        </ div >
    );
}