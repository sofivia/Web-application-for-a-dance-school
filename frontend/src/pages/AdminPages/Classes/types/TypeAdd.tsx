import Loading from "@/components/Loading";
import { useParams } from "react-router";
import { ClassTypeRead, getClassType, editClassType, createClassType } from "@/api";

import globals from "@/global.module.css"
import { type ClassicCheckboxProps } from "@/components/forms/classic/ClassicCheckbox";
import FormTemplate from "@/components/FormTemplate";
import type { GeneralInput } from "@/components/forms/InputList";
import type { ClassicInputProps } from "@/components/forms/classic/ClassicInput";
import type { ClassicTextAreaProps } from "@/components/forms/classic/ClassicTextArea";


export default function GroupTypeAdd() {
    const { id } = useParams();

    return (
        <div className={globals.app_container}>
            <div className="flex flex-col gap-3 w-full max-w-150 px-2">
                <Loading<ClassTypeRead | undefined> load={() => id ? getClassType.do(id) : Promise.resolve(undefined)}>
                    {(ctype?: ClassTypeRead) => {
                        const fields: GeneralInput[] = [
                            { name: "name", label: "Nazwa", defaultValue: ctype?.name, kind: "input-classic" } as ClassicInputProps,
                            { name: "level", label: "Poziom", defaultValue: ctype?.level, kind: "input-classic" } as ClassicInputProps,
                            { name: "description", label: "Opis", defaultValue: ctype?.description, kind: "textarea-classic" } as ClassicTextAreaProps,
                            { name: "duration_minutes", type: "number", defaultValue: ctype?.duration_minutes, label: "Domyślny czas trwania w minutach", kind: "input-classic" } as ClassicInputProps,
                            { name: "default_capacity", type: "number", defaultValue: ctype?.default_capacity, label: "Domyślna liczba uczestników", kind: "input-classic" } as ClassicInputProps,
                            { name: "is_active", label: "Czy aktywny", defaultChecked: !ctype || ctype.is_active, kind: "checkbox-classic" } as ClassicCheckboxProps
                        ];
                        return (
                            <FormTemplate apiCall={data => id ? editClassType.do(id, data) : createClassType.do(data)} fields={fields} redirect="../types" />
                        )

                    }}
                </Loading>
            </div>
        </div>
    );
}