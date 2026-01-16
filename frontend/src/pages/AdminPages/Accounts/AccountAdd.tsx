import { useParams, Navigate } from "react-router-dom";
import global from "@/global.module.css";
import { type BaseInstructor, type BaseStudent, createInstructor, createStudent } from "@/api";
import type { ClassicInputWithLabelProps } from "@/components/forms/InputWithLabel";;
import FormTemplate from "@/components/FormTemplate.tsx";
import type { ClassicCheckboxProps } from "@/components/forms/classic/ClassicCheckbox";
import type { ClassicTextAreaWithLabelProps } from "@/components/forms/TextAreaWithLabel";

function StudentAdd() {
   const fields = [
      { name: "first_name", type: "text", label: "Imię", kind: "input-classic" } as ClassicInputWithLabelProps,
      { name: "last_name", type: "text", label: "Nazwisko", kind: "input-classic" } as ClassicInputWithLabelProps,
      { name: "email", type: "email", label: "Email", kind: "input-classic" } as ClassicInputWithLabelProps,
      { name: "password", type: "password", label: "Tymczasowe hasło", kind: "input-classic" } as ClassicInputWithLabelProps,
      { name: "phone", type: "tel", label: "Telefon", placeholder: "111222333", kind: "input-classic" } as ClassicInputWithLabelProps,
      { name: "date_of_birth", type: "date", label: "Data urodzenia", kind: "input-classic" } as ClassicInputWithLabelProps,
      { name: "is_active", label: "Czy konto ma być aktywne?", defaultChecked: true, kind: "checkbox-classic" } as ClassicCheckboxProps
   ];
   return (
      <>
         <h1 className="mb-3 font-bold text-lg">Dodaj studenta</h1>
         <FormTemplate<BaseStudent>
            apiCall={data => createStudent(data.password, data as BaseStudent)}
            redirect="/userManage"
            fields={fields} />
      </>
   )
}

function InstructorAdd() {
   const fields = [
      { name: "first_name", type: "text", label: "Imię", kind: "input-classic" } as ClassicInputWithLabelProps,
      { name: "last_name", type: "text", label: "Nazwisko", kind: "input-classic" } as ClassicInputWithLabelProps,
      { name: "email", type: "email", label: "Email", kind: "input-classic" } as ClassicInputWithLabelProps,
      { name: "password", type: "password", label: "Tymczasowe hasło", kind: "input-classic" } as ClassicInputWithLabelProps,
      { name: "phone", type: "tel", label: "Telefon", placeholder: "111222333", kind: "input-classic" } as ClassicInputWithLabelProps,
      { name: "short_bio", kind: "textarea-classic", rows: 5, label: "Krótki życiorys", placeholder: "Stepuję od..." } as ClassicTextAreaWithLabelProps,
      { name: "is_active", kind: "checkbox-classic", label: "Czy konto ma być aktywne?", checked: true } as ClassicCheckboxProps
   ];
   return (
      <>
         <h1 className="mb-3 font-bold text-lg">Dodaj instruktora</h1>
         <FormTemplate<BaseInstructor>
            apiCall={data => createInstructor(data.password, data as BaseInstructor)}
            redirect="/userManage"
            fields={fields} />
      </>
   )
}

export default function AccountAdd() {
   const { role } = useParams();

   if (role != "student" && role != "instructor")
      return <Navigate to="/" replace />;
   return (
      <div className={global.app_container}>
         <div className={"flex flex-col w-3xl gap-3"}>
            {role == "student" ? StudentAdd() : InstructorAdd()}
         </div>
      </div>
   )
};