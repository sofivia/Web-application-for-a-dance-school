import { useId } from 'react';
import TextArea from './TextArea.tsx';
import ClassicTextArea from './classic/ClassicTextArea.tsx';
import type { ClassicTextAreaProps } from './classic/ClassicTextArea.tsx';
import type { ReactTextAreaProps } from './TextArea.tsx';


type Props = {
    label?: string;
    fClassName?: string;
}

export type ClassicTextAreaWithLabelProps = ClassicTextAreaProps & Props;
export type ReactTextAreaWithLabelProps = ReactTextAreaProps & Props;
export type TextAreaWithLabelProps = ClassicTextAreaWithLabelProps | ReactTextAreaWithLabelProps;

export default function TextAreaWithLabel(props: TextAreaWithLabelProps) {
    const { fClassName, label } = props;
    const id = useId();

    const renderInput = () => {
        if (props.kind == "textarea-react")
            return <TextArea id={id} {...props} />
        else
            return <ClassicTextArea id={id} {...props} />
    }

    return (
        <div className={`text-left ${fClassName ?? ""}`} >
            {label && <label htmlFor={id} className="block mb-1"> {label} </label>}
            {renderInput()}
        </ div >
    );
}