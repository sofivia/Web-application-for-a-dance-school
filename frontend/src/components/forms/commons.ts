export interface InputValues {
    value: string;
    setValue: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
    placeholder?: string;
};

export type InputProps = {
    id?: string;
    type: string;
    values: InputValues;
    error?: string;
    onBlur?: () => void;
    className?: string;
    name?: string;
    rows?: number;
};
