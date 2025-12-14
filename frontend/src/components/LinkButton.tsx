import styles from './Button.module.css';
import linkStyles from './LinkButton.module.css';
import { Link } from "react-router";

type ButtonProps = {
    children: React.ReactNode;
    to: string;
    id?: string;
    className?: string;
    ariaLabel?: string;
};

function LinkButton(props: ButtonProps) {
    const { children, to, className, ariaLabel } = props;
    const classNames = `${styles.button} ${linkStyles.linkButton} ${className}`;
    return (
        <Link to={to} className={classNames} aria-label={ariaLabel}>
            {children}
        </Link>
    );
}

export default LinkButton;