import styles from './Input.module.css';

export interface InputValues {
    value: string;
    setValue: React.ChangeEventHandler<HTMLInputElement>;
    placeholder: string;
};

type InputProps = {
    type: string;
    values: InputValues;
    error: string | undefined;
    onBlur?: () => void;
    className?: string;
    name?: string;
};

export default function Input(props: InputProps) {
    const { type, values, error, onBlur, className, name } = props;
    const { placeholder, value, setValue } = values;
    return (
        <div className={className}>
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onBlur={onBlur}
                aria-invalid={!!error}
                onChange={setValue}
                className={`${styles.input} mb-1`}
                name={name}
            />
            {error && <div className={styles.error}>{error}</div>}
        </div>
    );
}
