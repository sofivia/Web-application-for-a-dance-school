import { useId } from 'react';
import Select from "./Select.tsx";
import type { ReactSelectProps } from "./Select.tsx";
import type { ClassicSelectProps } from "./classic/ClassicSelect.tsx";
import type { Props as AsyncProps } from "./MyAsyncSelect.tsx";
import ClassicSelect from './classic/ClassicSelect.tsx';
import MyAsyncSelect from './MyAsyncSelect.tsx';


type Props = {
    label?: string;
    fClassName?: string;
}

export type ReactSelectWithLabelProps = ReactSelectProps & Props;
export type ClassicSelectWithLabelProps = ClassicSelectProps & Props;
export type AsyncSelectWithLabelProps = AsyncProps & Props;
export type SelectWithLabelProps = ReactSelectWithLabelProps
    | ClassicSelectWithLabelProps
    | AsyncSelectWithLabelProps;

export default function SelectWithLabel(props: SelectWithLabelProps) {
    const { fClassName, label } = props;
    const id = useId();
    const renderInput = () => {
        if (props.kind == "select-react")
            return <Select id={id} {...props} />
        else if (props.kind == "select-classic")
            return <ClassicSelect id={id} {...props} />
        return <MyAsyncSelect id={id} {...props} />
    }
    return (
        <div className={`text-left ${fClassName ?? ""}`} >
            {label && <label htmlFor={id} className="block mb-1"> {label} </label>}
            {renderInput()}
        </ div >
    );
}