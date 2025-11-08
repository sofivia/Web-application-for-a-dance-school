import styles from './Button.module.css';

type ButtonProps = {
    children: React.ReactNode;
    onClick: () => void;
} & React.HTMLAttributes<HTMLButtonElement>;

function Button(props: ButtonProps) {
    const { children, onClick, className, ...rest } = props;
    return (
        <button className={`${styles.button} ${className}`} onClick={onClick} {...rest}>
            {children}
        </button>
    );
}

export default Button;