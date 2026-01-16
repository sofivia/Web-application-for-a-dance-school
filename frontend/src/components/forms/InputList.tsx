import type { Errors } from "./commons.ts"
import InputWithLabel from "./InputWithLabel.tsx";
import type { InputWithLabelProps, ReactInputWithLabelProps } from "./InputWithLabel.tsx";
import TextAreaWithLabel from "./TextAreaWithLabel.tsx";
import type { TextAreaWithLabelProps } from "./TextAreaWithLabel.tsx";
import SelectWithLabel from "./SelectWithLabel.tsx";
import type { SelectWithLabelProps } from "./SelectWithLabel.tsx";
import ClassicCheckbox from "./classic/ClassicCheckbox.tsx";
import type { ClassicCheckboxProps } from "./classic/ClassicCheckbox.tsx";


export type GeneralInput = InputWithLabelProps
    | TextAreaWithLabelProps
    | SelectWithLabelProps
    | ClassicCheckboxProps;


export function Element(props: GeneralInput & { key: number }) {
    if (props.kind == "textarea-classic" || props.kind == "textarea-react")
        return <TextAreaWithLabel {...props} key={props.key} />
    if (props.kind == "select-classic" || props.kind == "select-react")
        return <SelectWithLabel {...props} key={props.key} />
    if (props.kind == "checkbox-classic")
        return <ClassicCheckbox {...props} key={props.key} />
    return <InputWithLabel {...(props as ReactInputWithLabelProps)} key={props.key} />
}

export function InputList(props: { fields: GeneralInput[], errors?: Errors }) {
    return <>{props.fields.map((f, i) => Element({ ...f, error: props.errors?.[f.name], key: i }))}</>;
}