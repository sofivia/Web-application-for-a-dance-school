import { useNavigate } from "react-router-dom";
import { useState, type FormEvent } from "react";
import DarkModeToggle from "@/components/DarkModeToggle.tsx";
import "@/index.css";
import global from "@/global.module.css";
import inputstyles from "@/components/forms/Input.module.css";
import Input from "@/components/forms/Input.tsx";
import formstyle from "@/styles/forms.module.css";
import type { InputValues } from "@/components/forms/Input.tsx";
import { handlePost, getErrors } from "@/utils/apiutils.ts";
import { createStudent } from "@/api.ts";

type Errors = {
   account?: string;
   first_name?: string;
   last_name?: string;
   date_of_birth?: string;
   phone?: string;
};

export default function FinishRegistration() {
   const navigate = useNavigate();
   const [isLoading, setLoading] = useState(false);
   const [first_name, setFirstName] = useState("");
   const [last_name, setLastName] = useState("");
   const [date_of_birth, setDateOfBirth] = useState("");
   const [phone, setPhone] = useState("");

   const [errors, setErrors] = useState<Errors>({});

   const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoading(true);
      const msg = await handlePost(() => createStudent({ first_name, last_name, date_of_birth, phone }));
      if (msg === undefined) navigate("/me");
      else setErrors(getErrors(msg));
      setLoading(false);
   };

   const values: InputValues[] = [
      { value: first_name, setValue: (e) => setFirstName(e.target.value), placeholder: "Imię" },
      { value: last_name, setValue: (e) => setLastName(e.target.value), placeholder: "Nazwisko" },
      { value: date_of_birth, setValue: (e) => setDateOfBirth(e.target.value), placeholder: "Data urodzenia" },
      { value: phone, setValue: (e) => setPhone(e.target.value), placeholder: "Numer telefonu" },
   ];
   const [firstNameValues, lastNameValues, dateOfBirthValues, phoneValues] = values;
   return (
      <div className={global.app_container}>
         <div className={formstyle.card}>
            <h2 className={formstyle.title}> Dokończ rejestrację </h2>
            <form onSubmit={handleSubmit} className={formstyle.form} noValidate>
               {errors.account && <p className={`${inputstyles.error} mb-1`}>{errors.account}</p>}

               <Input type="text" values={firstNameValues} error={errors.first_name} className="mb-3" />
               <Input type="text" values={lastNameValues} error={errors.last_name} className="mb-3" />
               <Input type="date" values={dateOfBirthValues} error={errors.date_of_birth} className="mb-3" />
               <Input type="tel" values={phoneValues} error={errors.phone} className="mb-5" />

               <button type="submit" className={formstyle.button} disabled={isLoading}>
                  {isLoading ? "Przetwarzanie" : "Zatwierdź"}
               </button>
            </form>
         </div>
      </div>
   );
}
