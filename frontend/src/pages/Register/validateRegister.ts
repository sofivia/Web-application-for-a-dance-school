import { Email, Password } from "@/forms/Registration.ts"
import { register } from "@/api.ts";

export interface LoginFormData {
   email: string;
   password: string;
   confirmPassword: string;
}

export type Errors = {
   email?: string;
   password?: string;
   confirmPassword?: string;
   global?: string;
}

export class Validator {
   data: LoginFormData;
   setErrors: React.Dispatch<React.SetStateAction<Errors>>;

   constructor(data: LoginFormData, setErrors: React.Dispatch<React.SetStateAction<Errors>>) {
      this.data = data;
      this.setErrors = setErrors;
   }

   validate() {
      const newErrors: Errors = {};

      newErrors.email = new Email(this.data.email).validate()
      newErrors.password = new Password(this.data.password).validate()

      if (this.data.confirmPassword !== this.data.password) {
         newErrors.confirmPassword = "Hasła muszą być takie same";
      }

      this.setErrors(prev => ({
         ...prev,
         email: newErrors.email,
         password: newErrors.password,
         confirmPassword: newErrors.confirmPassword,
         global: prev.global && Object.keys(newErrors).length === 0 ? prev.global : undefined,
      }));
      return Object.values(newErrors).every(x => x === undefined);
   };
}

export type AxiosErr = {
   response?: {
      data?: {
         email?: string[];
      };
   };
};

export async function handleRegister(email: string, password: string) {
  let message;
  try {
    await register(email.trim(), password);
  } catch (err: unknown) {
    const axiosData = typeof err === "object" && err !== null ?
      (err as AxiosErr)?.response?.data : undefined;
    message = axiosData?.email?.at(0) || "Wystąpił problem";
  }
  return message;
}