import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../../api";
import styles from "./Login.module.css";
import global from "@/global.module.css";
import DarkModeToggle from "@/components/DarkModeToggle.tsx";

type FieldErrors = {
  email?: string;
  password?: string;
  global?: string;
};

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

    try {
      await login(email.trim(), password);

      navigate("/");
    } catch (err: unknown) {
      type AxiosErr = {
        response?: {
          data?: {
            detail?: string;
            error?: string;
            message?: string;
          };
        };
      };

      const backendMessage =
        typeof err === "object" && err !== null
          ? (err as AxiosErr).response?.data?.detail ||
            (err as AxiosErr).response?.data?.error ||
            (err as AxiosErr).response?.data?.message
          : undefined;

      setErrors(prev => ({
        ...prev,
        global: backendMessage || "Nieprawidłowy email lub hasło",
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${global.app_container} ${styles.container}`}>
      <div className={global.header}>
        <DarkModeToggle />
      </div>
      <div className={styles.card}>
        <h2 className={styles.title}>Szkoła Tańca</h2>
        <p className={styles.subtitle}>Zaloguj się, aby kontynuować</p>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {errors.global && <p className={styles.error}>{errors.global}</p>}

          <input
            type="email"
            placeholder="Email"
            value={email}
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
            onBlur={validate}
            className={styles.input}
            aria-invalid={!!errors.email}
          />
          {errors.email && <p className={styles.error}>{errors.email}</p>}

          <input
            type="password"
            placeholder="Hasło"
            value={password}
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
            onBlur={validate}
            className={styles.input}
            aria-invalid={!!errors.password}
          />
          {errors.password && <p className={styles.error}>{errors.password}</p>}

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
    </div>
  );
}
