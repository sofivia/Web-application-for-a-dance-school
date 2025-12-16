import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { handlePost, getErrors } from "@/utils/apiutils.ts";
import { login } from "@/api.ts";
import inputstyles from "@/components/forms/Input.module.css";
import global from "@/global.module.css";
import formstyle from "@/styles/forms.module.css";
import Input from "@/components/forms/Input.tsx";
import type { InputValues } from "@/components/forms/Input.tsx";
import { Email, Password } from "@/forms/Registration.ts";

type Errors = {
   email?: string;
   password?: string;
   global?: string;
};

export default function Login() {
   const [emailstr, setEmail] = useState("");
   const email = new Email(emailstr);
   const [passwordstr, setPassword] = useState("");
   const password = new Password(passwordstr);

   const [errors, setErrors] = useState<Errors>({});
   const [loading, setLoading] = useState(false);

   const navigate = useNavigate();

   const validate = (): boolean => {
      const newErrors: Errors = {};
      newErrors.email = email.validate();
      newErrors.password = password.validate();
      setErrors((prev) => ({
         ...prev,
         email: newErrors.email,
         password: newErrors.password,
         global: prev.global && Object.keys(newErrors).length === 0 ? prev.global : undefined,
      }));
      return Object.values(errors).every((x) => x === undefined);
   };

   const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!validate()) return;
      setLoading(true);
      setErrors((prev) => ({ ...prev, global: undefined }));

      const msg = await handlePost(() => login(email.value.trim(), password.value));
      if (msg === undefined) window.location.href = "/";
      else setErrors((prev) => ({ ...prev, ...getErrors(msg) }));
      setLoading(false);
   };

   const emailValues: InputValues = {
      value: email.value,
      setValue: (e) => setEmail(e.target.value),
      placeholder: "Email",
   };
   const passValues: InputValues = {
      value: password.value,
      setValue: (e) => setPassword(e.target.value),
      placeholder: "Hasło",
   };

   return (
      <div className={`${global.app_container} ${formstyle.container}`}>
         <div className={global.header}></div>

         <div className={formstyle.card}>
            <h2 className={formstyle.title}>Szkoła Tańca</h2>
            <p className={formstyle.subtitle}>Zaloguj się, aby kontynuować</p>

            <form onSubmit={handleSubmit} className={formstyle.form} noValidate>
               {errors.global && <p className={`${inputstyles.error} mb-1`}>{errors.global}</p>}

               <Input type="email" values={emailValues} error={errors.email} onBlur={validate} className="mb-3" />
               <Input type="password" values={passValues} error={errors.password} onBlur={validate} className="mb-5" />

               <button type="submit" className={formstyle.button} disabled={loading}>
                  {loading ? "Logowanie..." : "Zaloguj się"}
               </button>
            </form>

            <p className={formstyle.footer}>
               Nie masz konta?{" "}
               <Link to="/register" className={formstyle.link}>
                  Zarejestruj się
               </Link>
            </p>
         </div>
      </div>
   );
}
