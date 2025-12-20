export interface InputValues {
    value: string;
    setValue: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
    placeholder: string;
};

export type InputProps = {
    type: string;
    values: InputValues;
    error: string | undefined;
    onBlur?: () => void;
    className?: string;
    name?: string;
    rows?: number;
};
