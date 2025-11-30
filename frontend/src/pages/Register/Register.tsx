import { useState } from "react";
import { validate } from "./validateRegister";
import type { Errors } from "./validateRegister";
import type { LoginFormData } from "./validateRegister";
import { Link } from "react-router";
import global from "@/global.module.css";
import formstyle from "@/styles/forms.module.css";
import DarkModeToggle from "@/components/DarkModeToggle.tsx";
import Input from "@/components/forms/Input.tsx"
import type { InputValues } from "@/components/forms/Input.tsx"


export default function Register() {
   const [data, setData] = useState<LoginFormData>({
      email: "",
      password: "",
      confirmPassword: "",
   });
   const [errors, setErrors] = useState<Errors>({});

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setData((prev) => ({ ...prev, [name]: value }));
   };

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const validationErrors = validate(data);
      setErrors(validationErrors);

      if (Object.values(validationErrors).every(x => x === undefined)) {
         alert(`Rejestracja zakończona sukcesem: ${data.email}`);
         // TODO: wywołanie API registerUser()
      }
   };

   const emailValues: InputValues = { value: data.email, setValue: handleChange, placeholder: "Email" };
   const passwordValues: InputValues = { value: data.password, setValue: handleChange, placeholder: "Hasło" };
   const confPasswordValues: InputValues = { value: data.confirmPassword, setValue: handleChange, placeholder: "Powtórz hasło" };

   return (
      <div className={`${global.app_container} ${formstyle.container}`}>
         <div className={global.header}>
            <DarkModeToggle />
         </div>
         <div className={formstyle.card}>
            <h2 className={formstyle.title}>Szkoła Tańca</h2>
            <p className={formstyle.subtitle}>Zarejestruj się, aby kontynuować</p>

            <form className={formstyle.form} onSubmit={handleSubmit}>
               <Input type="email" values={emailValues} error={errors.email} className="mb-3" name="email" />
               <Input type="password" values={passwordValues} error={errors.password} className="mb-5" name="password" />
               <Input type="password" values={confPasswordValues} error={errors.confirmPassword} className="mb-5" name="confirmPassword" />

               <button type="submit" className={formstyle.button}>
                  Zarejestruj się
               </button>
            </form>

            <p className={formstyle.footer}>
               Masz już konto?{" "}
               <Link to={"/login"} className={formstyle.link}>
                  Zaloguj się
               </Link>
            </p>
         </div>
      </div>
   );
}
