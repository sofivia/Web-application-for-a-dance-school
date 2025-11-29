import styles from './Button.module.css';
import linkStyles from './LinkButton.module.css';
import { Link } from "react-router";

type ButtonProps = {
    children: React.ReactNode;
    to: string;
    className?: string;
};

function LinkButton(props: ButtonProps) {
    const { children, to, className } = props;
    const classNames = `${styles.button} ${linkStyles.linkButton} ${className}`;
    return (
        <Link to={to} className={classNames}>
            {children}
        </Link>
    );
}

export default LinkButton;