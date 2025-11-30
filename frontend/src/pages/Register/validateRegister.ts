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
}


export const validate = (data: LoginFormData) => {
   const newErrors: Errors = {};

   newErrors.email = new Email(data.email).validate()
   newErrors.password = new Password(data.password).validate()

   if (data.confirmPassword !== data.password) {
      newErrors.confirmPassword = "Hasła muszą być takie same";
   }

   return newErrors;
};
