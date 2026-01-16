export interface InputValues {
    value: string;
    setValue: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
    placeholder?: string;
};

export type ReactBaseInputProps = {
    name: string;
    error?: string;
};

export type ClassicBaseInputProps = {
    name: string;
    error?: string;
};

export type Errors = Record<string, string>;
