import { useState } from "react";
import styles from "./Login.module.css";
import global from "@/global.module.css";
import DarkModeToggle from "@/components/DarkModeToggle.tsx";

export default function Login() {
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");

   const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

   const validate = () => {
      const newErrors: { email?: string; password?: string } = {};

      // Sprawdzenie email
      if (!email) {
         newErrors.email = "Email jest wymagany";
      } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
         newErrors.email = "Nieprawidłowy adres email";
      }

      // Sprawdzenie hasła!
      if (!password) {
         newErrors.password = "Hasło jest wymagane";
      } else if (password.length < 6) {
         newErrors.password = "Hasło musi mieć przynajmniej 6 znaków";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
   };

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (validate()) {
         alert(`Logowanie powiodło się: ${email}`); // TODO: Dodać prawdziwy login
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

            <form onSubmit={handleSubmit} className={styles.form}>
               <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`${styles.input} mb-3`}
               />
               {errors.email && <p className={styles.error}>{errors.email}</p>}

               <input
                  type="password"
                  placeholder="Hasło"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${styles.input} mb-5`}
               />
               {errors.password && <p className={styles.error}>{errors.password}</p>}

               <button type="submit" className={styles.button}>
                  Zaloguj się
               </button>
            </form>

            <p className={styles.footer}>
               Nie masz konta?{" "}
               <a href="#" className={styles.link}>
                  {" "}
                  {/* TODO: podmienić link do strony rejestracji */}
                  Zarejestruj się
               </a>
            </p>
         </div>
      </div>
   );
}
