export interface LoginFormData {
   email?: string;
   password?: string;
   confirmPassword?: string;
}

export const validate = (data: LoginFormData) => {
   const newErrors: {
      email?: string;
      password?: string;
      confirmPassword?: string;
   } = {};

   if (!data.email) {
      newErrors.email = "Email jest wymagany";
   } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(data.email)) {
      newErrors.email = "Nieprawidłowy adres email";
   }

   if (!data.password) {
      newErrors.password = "Hasło jest wymagane";
   } else if (data.password.length < 6) {
      newErrors.password = "Hasło musi mieć przynajmniej 6 znaków";
   }

   if (data.confirmPassword !== data.password) {
      newErrors.confirmPassword = "Hasła muszą być takie same";
   }

   return newErrors;
};
