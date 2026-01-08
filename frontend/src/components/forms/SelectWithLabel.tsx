import { useId } from 'react';
import Select from "./Select.tsx";
import type { ReactSelectProps } from "./Select.tsx";
import type { ClassicSelectProps } from "./classic/ClassicSelect.tsx";
import styles from "./Select.module.css";
import ClassicSelect from './classic/ClassicSelect.tsx';


type Props = {
    label?: string;
    fClassName?: string;
}

export type ReactSelectWithLabelProps = ReactSelectProps & Props;
export type ClassicSelectWithLabelProps = ClassicSelectProps & Props;
export type SelectWithLabelProps = ReactSelectWithLabelProps | ClassicSelectWithLabelProps;

export default function SelectWithLabel(props: SelectWithLabelProps) {
    const { fClassName, label } = props;
    const id = useId();
    const renderInput = () => {
        if (props.kind == "select-react")
            return <Select id={id} {...props} />
        else
            return <ClassicSelect id={id} {...props} />
    }
    return (
        <div className={`${styles.filter} ${fClassName ?? ""}`} >
            {label && <label htmlFor={id} className="block mb-1"> {label} </label>}
            {renderInput()}
        </ div >
    );
}