import type FormValue from "@/utils/FormValue.ts"


export class Email implements FormValue {
   value: string;
   constructor(email: string) {
      this.value = email;
   }
   validate(): string | undefined {
      if (!this.value)
         return "Email jest wymagany";
      else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(this.value))
         return "Nieprawidłowy adres email";
      return undefined;
   }
}


export class Password implements FormValue {
   value: string;
   constructor(password: string) {
      this.value = password;
   }
   validate(): string | undefined {
      if (!this.value)
         return "Hasło jest wymagane";
      else if (this.value.length < 6)
         return "Hasło musi mieć przynajmniej 6 znaków";
      return undefined;
   }
}
