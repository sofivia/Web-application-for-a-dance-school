import styles from "./Button.module.css";
import { useId } from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  id?: string;
};

function Button(props: ButtonProps) {
  const { children, id, className = "", ...rest } = props;
  const autoId = useId();

  return (
    <button
      className={`${styles.button} ${className}`}
      id={id ?? autoId}
      {...rest}
    >
      {children}
    </button>
  );
}

export default Button;