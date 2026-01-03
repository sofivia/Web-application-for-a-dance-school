import FormTemplate from "@/components/FormTemplate.tsx";
import type { Field } from "@/components/FormTemplate.tsx";
import { type Student, type Instructor, registerStudent, registerInstructor } from "@/api.ts";
import { useAuth } from "@/utils/auth/useAuth";
import type { ClassicInputWithLabelProps } from "@/components/forms/InputWithLabel";;
import type { ClassicTextAreaWithLabelProps } from "@/components/forms/TextAreaWithLabel";

import global from "@/global.module.css";
import formstyle from "@/styles/forms.module.css";


export default function FinishRegistration() {
    const { roles } = useAuth();
    let fields: Field[];
    if (roles.includes("student")) {
        fields = [
            { name: "first_name", type: "text", label: "Imię" } as ClassicInputWithLabelProps,
            { name: "last_name", type: "text", label: "Nazwisko" } as ClassicInputWithLabelProps,
            { name: "date_of_birth", type: "date", label: "Data urodzenia" } as ClassicInputWithLabelProps,
            { name: "phone", type: "tel", label: "Numer telefonu", placeholder: "111222333" } as ClassicInputWithLabelProps
        ];
    } else {
        fields = [
            { name: "first_name", type: "text", label: "Imię" } as ClassicInputWithLabelProps,
            { name: "last_name", type: "text", label: "Nazwisko" } as ClassicInputWithLabelProps,
            { name: "phone", type: "tel", label: "Numer telefonu", placeholder: "111222333" } as ClassicInputWithLabelProps,
            { name: "short_bio", kind: "textarea", label: "Krótka biografia", placeholder: "Stepuję od...", rows: 5 } as ClassicTextAreaWithLabelProps,
        ];
    }
    return (
        <div className={global.app_container}>
            <div className={formstyle.card}>
                <h2 className={formstyle.title}> Dokończ rejestrację </h2>
                {roles.includes("student") ?
                    <FormTemplate<Student> apiCall={data => registerStudent(data as Student)} redirect="/me" fields={fields} />
                    :
                    <FormTemplate<Instructor> apiCall={data => registerInstructor(data as Instructor)} redirect="/me" fields={fields} />
                }
            </div>
        </div>
    );
}
