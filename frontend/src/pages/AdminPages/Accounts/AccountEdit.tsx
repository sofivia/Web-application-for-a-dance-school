import { useState, useEffect, useCallback } from "react";
import { useParams, Navigate } from "react-router-dom";
import global from "@/global.module.css";
import { getAccount, editInstructor, editStudent, type AccountView, type BaseInstructor, type BaseStudent } from "@/api";
import type { ClassicInputWithLabelProps } from "@/components/forms/InputWithLabel";;
import FormTemplate from "@/components/FormTemplate.tsx";
import type { ClassicCheckboxProps } from "@/components/forms/classic/ClassicCheckbox";
import type { ClassicTextAreaWithLabelProps } from "@/components/forms/TextAreaWithLabel";


function editStudentForm(pk: string, student: FormDataT) {
   const fields = [
      { name: "first_name", type: "text", label: "Imię", defaultValue: student.first_name, kind: "input" } as ClassicInputWithLabelProps,
      { name: "last_name", type: "text", label: "Nazwisko", defaultValue: student.last_name, kind: "input" } as ClassicInputWithLabelProps,
      { name: "email", type: "email", label: "Email", defaultValue: student.email, kind: "input" } as ClassicInputWithLabelProps,
      { name: "phone", type: "tel", label: "Telefon", defaultValue: student.phone, kind: "input" } as ClassicInputWithLabelProps,
      { name: "date_of_birth", type: "date", label: "Data urodzenia", defaultValue: student.date_of_birth, kind: "input" } as ClassicInputWithLabelProps,
      { name: "is_active", kind: "checkbox", label: "Czy konto ma być aktywne?", checked: student.is_active } as ClassicCheckboxProps
   ];
   return (
      <FormTemplate<BaseStudent>
         apiCall={data => editStudent(pk, data as BaseStudent)}
         redirect={`../details/${pk}`}
         fields={fields} />
   )
}

function editInstructorForm(pk: string, instructor: FormDataT) {
   const fields = [
      { name: "first_name", type: "text", label: "Imię", defaultValue: instructor.first_name, kind: "input" } as ClassicInputWithLabelProps,
      { name: "last_name", type: "text", label: "Nazwisko", defaultValue: instructor.last_name, kind: "input" } as ClassicInputWithLabelProps,
      { name: "email", type: "email", label: "Email", defaultValue: instructor.email, kind: "input" } as ClassicInputWithLabelProps,
      { name: "phone", type: "tel", label: "Telefon", defaultValue: instructor.phone, kind: "input" } as ClassicInputWithLabelProps,
      { name: "short_bio", kind: "textarea", rows: 5, label: "Krótki życiorys", defaultValue: instructor.short_bio } as ClassicTextAreaWithLabelProps,
      { name: "is_active", kind: "checkbox", label: "Czy konto ma być aktywne?", checked: instructor.is_active } as ClassicCheckboxProps
   ];
   return (
      <FormTemplate<BaseInstructor>
         apiCall={data => editInstructor(pk, data as BaseInstructor)}
         redirect={`../details/${pk}`}
         fields={fields} />
   )
}


type FormDataT = {
   first_name?: string;
   last_name?: string;
   phone?: string;
   email?: string;
   role: string;
   short_bio?: string;
   is_active: boolean;
   date_of_birth?: string;
}

export default function AccountEdit() {
   const { id } = useParams();

   const [isLoading, setLoading] = useState(true);
   const [account, setAccount] = useState<AccountView | null>(null);
   const [formData, setFormData] = useState<FormDataT>({ role: "admin", is_active: true });

   const fetchAccount = useCallback(async () => {
      const fetchedAccount = await getAccount(id || "");
      setAccount(fetchedAccount);

      const instructor = fetchedAccount.instructorInfo;
      const student = fetchedAccount.studentInfo;

      setFormData({
         first_name: instructor?.first_name ?? student?.first_name ?? "",
         last_name: instructor?.last_name ?? student?.last_name ?? "",
         phone: instructor?.phone ?? student?.phone ?? "",
         short_bio: instructor?.short_bio ?? "",
         date_of_birth: student?.date_of_birth ?? "",
         email: fetchedAccount.email ?? "",
         role: fetchedAccount.role ?? "admin",
         is_active: fetchedAccount.isActive ?? true,
      });
      setLoading(false);
   }, [id]);

   useEffect(() => {
      fetchAccount();
   }, [fetchAccount]);


   if (!id) return <Navigate to="/" replace />;
   if (!account) return <Navigate to="/" replace />;

   return (
      <div className={global.app_container}>
         <div className={"flex flex-col gap-3"}>
            <h1 className="mb-3 font-bold text-lg">Edytuj użytkownika</h1>
            {isLoading ? "Ładowanie..." : <>
               {formData.role != "student" && formData.role != "instructor" && "Nie można edytować"}
               {formData.role == "student" && editStudentForm(account.pk, formData)}
               {formData.role == "instructor" && editInstructorForm(account.pk, formData)}
            </>
            }
         </div>
      </div>
   );
}
