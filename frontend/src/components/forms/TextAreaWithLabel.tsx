import { useId } from 'react';
import styles from "./Select.module.css";
import ClassicTextArea from './classic/ClassicTextArea.tsx';;
import type { ClassicTextAreaProps } from './classic/ClassicTextArea.tsx';


type Props = {
    label?: string;
    fClassName?: string;
}

export type ClassicTextAreaWithLabelProps = ClassicTextAreaProps & Props;


export default function TextAreaWithLabel(props: ClassicTextAreaWithLabelProps) {
    const { fClassName, label } = props;
    const id = useId();

    return (
        <div className={`${styles.filter} ${fClassName ?? ""}`} >
            {label && <label htmlFor={id} className="block mb-1"> {label} </label>}
            <ClassicTextArea id={id} {...props} />
        </ div >
    );
}