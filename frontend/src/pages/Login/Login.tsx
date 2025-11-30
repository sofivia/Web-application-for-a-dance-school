import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../../api";
import styles from "./Login.module.css";
import inputstyles from "@/components/forms/Input.module.css";
import global from "@/global.module.css";
import DarkModeToggle from "@/components/DarkModeToggle.tsx";
import Input from "@/components/forms/Input.tsx"
import type { InputValues } from "@/components/forms/Input.tsx"
import type FormValue from "@/utils/FormValue.ts"

class Email implements FormValue {
  value: string;
  constructor(email: string) {
    this.value = email;
  }
  validate(): string | undefined {
    if (!this.value)
      return "Email jest wymagany";
    else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(this.value))
      return "Nieprawidłowy adres email";
  }
}

type FieldErrors = {
  email?: string;
  password?: string;
  global?: string;
};

type AxiosErr = {
  response?: {
    data?: {
      detail?: string;
      error?: string;
      message?: string;
    };
  };
};

async function handleLogin(email: string, password: string) {
  let message;
  try {
    await login(email.trim(), password);
  } catch (err: unknown) {
    const axiosData = typeof err === "object" && err !== null ?
      (err as AxiosErr)?.response?.data : undefined;
    message = axiosData?.detail || axiosData?.error || axiosData?.message
      || "Nieprawidłowy email lub hasło";
  }
  return message;
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const validate = (): boolean => {
    const newErrors: FieldErrors = {};

    // email
    if (!email.trim()) {
      newErrors.email = "Email jest wymagany";
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email.trim())) {
      newErrors.email = "Nieprawidłowy adres email";
    }

    // hasło
    if (!password) {
      newErrors.password = "Hasło jest wymagane";
    } else if (password.length < 6) {
      newErrors.password = "Hasło musi mieć przynajmniej 6 znaków";
    }

    setErrors(prev => ({
      ...prev,
      email: newErrors.email,
      password: newErrors.password,
      global: prev.global && Object.keys(newErrors).length === 0 ? prev.global : undefined,
    }));

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors(prev => ({ ...prev, global: undefined }));

    const msg = await handleLogin(email, password);
    if (msg === undefined)
      navigate("/");
    else
      setErrors(prev => ({ ...prev, global: msg }));
    setLoading(false);
  };

  const emailValues: InputValues = { value: email, setValue: setEmail, placeholder: "Email" };
  const passValues: InputValues = { value: password, setValue: setPassword, placeholder: "Hasło" };

  return (
    <div className={`${global.app_container} ${styles.container}`}>
      <div className={global.header}>
        <DarkModeToggle />
      </div>
      <div className={styles.card}>
        <h2 className={styles.title}>Szkoła Tańca</h2>
        <p className={styles.subtitle}>Zaloguj się, aby kontynuować</p>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {errors.global && <p className={`${inputstyles.error} mb-1`}>{errors.global}</p>}

          <Input type="email" values={emailValues} error={errors.email} onBlur={validate} className="mb-3" />
          <Input type="password" values={passValues} error={errors.password} onBlur={validate} className="mb-5" />

          <button
            type="submit"
            className={styles.button}
            disabled={loading}
          >
            {loading ? "Logowanie..." : "Zaloguj się"}
          </button>
        </form>

        <p className={styles.footer}>
          Nie masz konta?{" "}
          <Link to="/register" className={styles.link}>
            Zarejestruj się
          </Link>
        </p>
      </div>
    </div >
  );
}
