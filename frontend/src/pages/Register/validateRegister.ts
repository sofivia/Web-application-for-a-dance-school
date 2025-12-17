import { Email, Password } from "@/forms/Registration.ts"

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
       detail?: string;
       error?: string;
       message?: string;
       email?: string[];
         password?: string[];
     };
   };
 };
