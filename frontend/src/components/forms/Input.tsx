import styles from './Input.module.css';

export interface InputValues {
    value: string;
    setValue: (x: string) => void;
    placeholder: string;
};

type InputProps = {
    type: string;
    values: InputValues;
    error: string | undefined;
    onBlur: () => void;
    className?: string;
};

export default function Input(props: InputProps) {
    const { type, values, error, onBlur, className } = props;
    const { placeholder, value, setValue } = values;
    return (
        <div className={className}>
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={e => setValue(e.target.value)}
                onBlur={onBlur}
                aria-invalid={!!error}
                className={`${styles.input} mb-1`}
            />
            {error && <div className={styles.error}>{error}</div>}
        </div>
    );
}
