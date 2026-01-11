import { useId } from 'react';
import Input from "./Input.tsx";
import styles from "./Input.module.css";
import type { ReactInputProps } from './Input.tsx';
import type { ClassicInputProps } from './classic/ClassicInput.tsx';
import ClassicInput from './classic/ClassicInput.tsx';


type Props = {
    label?: string;
    fClassName?: string;
}

export type ReactInputWithLabelProps = ReactInputProps & Props;
export type ClassicInputWithLabelProps = ClassicInputProps & Props;
export type InputWithLabelProps = ReactInputWithLabelProps | ClassicInputWithLabelProps


export default function InputWithLabel(props: InputWithLabelProps) {
    const { fClassName, label } = props;
    const id = useId();
    const renderInput = () => {
        if (props.kind == "input-react")
            return <Input id={id} {...props} />
        else
            return <ClassicInput id={id} {...props} />
    }
    return (
        <div className={`text-left ${fClassName ?? ""}`} >
            {label && <label htmlFor={id} className="block mb-1"> {label} </label>}
            {renderInput()}
        </ div >
    );
}