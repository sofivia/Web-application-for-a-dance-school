export default interface FormValue {
    value: string;

    validate(): string | undefined;
}