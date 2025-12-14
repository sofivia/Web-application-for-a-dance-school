import styles from './Button.module.css';
import { useId } from 'react';

type ButtonProps = {
    children: React.ReactNode;
    onClick: () => void;
    id?: string;
} & React.HTMLAttributes<HTMLButtonElement>;

function Button(props: ButtonProps) {
    const { children, onClick, id, className, ...rest } = props;
    const autoId = useId();
    return (
        <button className={`${styles.button} ${className}`} onClick={onClick} id={id || autoId} {...rest}>
            {children}
        </button>
    );
}

export default Button;