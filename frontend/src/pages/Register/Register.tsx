import { useState } from "react";
import { useNavigate } from "react-router";
import { Validator, handleRegister } from "./validateRegister";
import type { Errors, LoginFormData } from "./validateRegister";
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
   const [loading, setLoading] = useState(false);

   const navigate = useNavigate();

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setData((prev) => ({ ...prev, [name]: value }));
   };

   const validator = new Validator(data, setErrors);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validator.validate()) return;
      setLoading(true);
      setErrors(prev => ({ ...prev, global: undefined }));

      const msg = await handleRegister(data.email, data.password);
      if (msg === undefined)
         navigate("/");
      else
         setErrors(prev => ({ ...prev, global: msg }));
      setLoading(false);
   };

   const emailValues: InputValues = { value: data.email, setValue: handleChange, placeholder: "Email" };
   const passwordValues: InputValues = { value: data.password, setValue: handleChange, placeholder: "Hasło" };
   const confPasswordValues: InputValues = { value: data.confirmPassword, setValue: handleChange, placeholder: "Powtórz hasło" };

   const validation = () => validator.validate();

   return (
      <div className={`${global.app_container} ${formstyle.container}`}>
         <div className={global.header}>
            <DarkModeToggle />
         </div>
         <div className={formstyle.card}>
            <h2 className={formstyle.title}>Szkoła Tańca</h2>
            <p className={formstyle.subtitle}>Zarejestruj się, aby kontynuować</p>

            <form className={formstyle.form} onSubmit={handleSubmit}>
               <Input type="email" values={emailValues} error={errors.email} onBlur={validation} className="mb-3" name="email" />
               <Input type="password" values={passwordValues} error={errors.password} onBlur={validation} className="mb-5" name="password" />
               <Input type="password" values={confPasswordValues} error={errors.confirmPassword} onBlur={validation} className="mb-5" name="confirmPassword" />

               <button type="submit" className={formstyle.button} disabled={loading}>
                  {loading ? "Rejestracja..." : "Zarejestruj się"}
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
