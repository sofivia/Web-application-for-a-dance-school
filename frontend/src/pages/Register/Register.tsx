import { useState } from "react";
import { validate } from "./validateRegister";
import type { LoginFormData } from "./validateRegister";
import { Link } from "react-router";

export default function Register() {
   const [data, setData] = useState<LoginFormData>({
      email: "",
      password: "",
      confirmPassword: "",
   });
   const [errors, setErrors] = useState<{
      email?: string;
      password?: string;
      confirmPassword?: string;
   }>({});

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setData((prev) => ({ ...prev, [name]: value }));
   };

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const validationErrors = validate(data);
      setErrors(validationErrors);

      if (Object.keys(validationErrors).length === 0) {
         alert(`Rejestracja zakończona sukcesem: ${data.email}`);
         // TODO: wywołanie API registerUser()
      }
   };

   return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] ">
         <div className="bg-[#121212] p-10 rounded-2xl shadow-2xl w-full max-w-md text-center">
            <h2 className="text-3xl font-bold text-[#4dabf7] mb-2">Szkoła Tańca</h2>
            <p className="text-[#a0aec0] mb-8">Utwórz nowe konto</p>

            <form className="flex flex-col" onSubmit={handleSubmit}>
               <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={data.email}
                  onChange={handleChange}
                  className="px-4 py-3 mb-2 border-2 border-[#2c3e50] rounded-xl bg-[#1a1a1a] text-[#e0e0e0] text-lg placeholder-[#7f8c8d]
                             focus:outline-none focus:border-[#4dabf7] focus:shadow-[0_0_8px_rgba(77,171,247,0.4)] transition"
               />
               {errors.email && <p className="text-[#ff6b6b] text-sm mb-2 text-left">{errors.email}</p>}

               <input
                  type="password"
                  name="password"
                  placeholder="Hasło"
                  value={data.password}
                  onChange={handleChange}
                  className="px-4 py-3 mb-2 border-2 border-[#2c3e50] rounded-xl bg-[#1a1a1a] text-[#e0e0e0] text-lg placeholder-[#7f8c8d]
                             focus:outline-none focus:border-[#4dabf7] focus:shadow-[0_0_8px_rgba(77,171,247,0.4)] transition"
               />
               {errors.password && <p className="text-[#ff6b6b] text-sm mb-2 text-left">{errors.password}</p>}

               <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Powtórz hasło"
                  value={data.confirmPassword}
                  onChange={handleChange}
                  className="px-4 py-3 mb-2 border-2 border-[#2c3e50] rounded-xl bg-[#1a1a1a] text-[#e0e0e0] text-lg placeholder-[#7f8c8d]
                             focus:outline-none focus:border-[#4dabf7] focus:shadow-[0_0_8px_rgba(77,171,247,0.4)] transition"
               />
               {errors.confirmPassword && (
                  <p className="text-[#ff6b6b] text-sm mb-2 text-left">{errors.confirmPassword}</p>
               )}

               <button
                  type="submit"
                  className="py-3 mt-3 rounded-xl bg-[#4dabf7] text-white text-lg font-semibold transition
                             hover:bg-[#3a9ad9] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(77,171,247,0.4)] cursor-pointer">
                  Zarejestruj się
               </button>
            </form>

            <p className="text-[#a0aec0] mt-5 text-sm">
               Masz już konto?
               <Link to={"/login"} className="text-[#4dabf7] font-semibold ml-1 hover:underline">
                  Zaloguj się
               </Link>
            </p>
         </div>
      </div>
   );
}
