import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import global from "@/global.module.css";
import formstyles from "@/styles/forms.module.css";

import Button from "@/components/Button";
import { InputList } from "@/components/forms/InputList";
import type { Option } from "@/components/forms/Select";
import type { ReactInputWithLabelProps } from "@/components/forms/InputWithLabel";
import type { ReactSelectWithLabelProps } from "@/components/forms/SelectWithLabel";

import { createAdminSession, getClassFilters } from "@/api";
import { getErrors, handlePost2 } from "@/utils/apiutils";
import type { Errors } from "@/components/forms/commons";

export default function ClassAdd() {
  const nav = useNavigate();

  const [opts, setOpts] = useState<{ classTypes: Option[]; instructors: Option[]; locations: Option[] }>({
    classTypes: [],
    instructors: [],
    locations: [],
  });

  const [v, setV] = useState({
    class_type: "",
    instructor: "",
    location: "",
    date: "",
    start_time: "",
    end_time: "",
    notes: "",
  });

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    (async () => {
      const f = await getClassFilters();
      setOpts({
        classTypes: [...f.class_types.map(ct => ({ key: ct.id, value: ct.id, label: ct.name }))],
        instructors: [...f.instructors.map(i => ({ key: i.id, value: i.id, label: `${i.first_name} ${i.last_name}` }))],
        locations: [...f.locations.map(l => ({ key: l.pk, value: l.pk, label: l.name }))],
      });
    })();
  }, []);

  const fields = useMemo(() => {
    return [
      {
        name: "class_type",
        kind: "select-react",
        label: "Temat zajęć",
        prompt: "Wybierz typ",
        options: opts.classTypes,
        values: { value: v.class_type, setValue: (e: any) => setV(p => ({ ...p, class_type: e.target.value })) },
      } as ReactSelectWithLabelProps,
      {
        name: "date",
        kind: "input-react",
        type: "date",
        label: "Data",
        values: { value: v.date, setValue: (e: any) => setV(p => ({ ...p, date: e.target.value })) },
      } as ReactInputWithLabelProps,
      {
        name: "start_time",
        kind: "input-react",
        type: "time",
        label: "Godzina od",
        values: { value: v.start_time, setValue: (e: any) => setV(p => ({ ...p, start_time: e.target.value })) },
      } as ReactInputWithLabelProps,
      {
        name: "end_time",
        kind: "input-react",
        type: "time",
        label: "Godzina do",
        values: { value: v.end_time, setValue: (e: any) => setV(p => ({ ...p, end_time: e.target.value })) },
      } as ReactInputWithLabelProps,
      {
        name: "location",
        kind: "select-react",
        label: "Studio",
        prompt: "Wybierz studio",
        options: opts.locations,
        values: { value: v.location, setValue: (e: any) => setV(p => ({ ...p, location: e.target.value })) },
      } as ReactSelectWithLabelProps,
      {
        name: "instructor",
        kind: "select-react",
        label: "Instruktor",
        prompt: "Wybierz instruktora",
        options: opts.instructors,
        values: { value: v.instructor, setValue: (e: any) => setV(p => ({ ...p, instructor: e.target.value })) },
      } as ReactSelectWithLabelProps,
      {
        name: "notes",
        kind: "input-react",
        type: "text",
        label: "Opis (opcjonalnie)",
        values: { value: v.notes, setValue: (e: any) => setV(p => ({ ...p, notes: e.target.value })) },
      } as ReactInputWithLabelProps,
    ];
  }, [opts, v]);

  async function onSubmit() {
    if (!v.class_type || !v.instructor || !v.location || !v.date || !v.start_time || !v.end_time) {
      alert("Uzupełnij wszystkie wymagane pola.");
      return;
    }
    setSaving(true);
    setErrors({});
    try {
      await handlePost2(() =>
        createAdminSession({
          class_type: Number(v.class_type),
          instructor: v.instructor,
          location: Number(v.location),
          date: v.date,
          start_time: v.start_time,
          end_time: v.end_time,
          notes: v.notes,
        })
      );
      nav("/studSubj");
    } catch (err: any) {
      setErrors(getErrors(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={global.app_container}>
      <div className={formstyles.panel} style={{ maxWidth: 980, width: "100%" }}>
        <h1 className="text-base font-bold mb-4">Dodaj nowe zajęcie</h1>

        <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
          <InputList fields={fields.slice(0, 3)} errors={errors} />
          <InputList fields={fields.slice(3)} errors={errors} />
        </div>

        {errors.global && <div className="mt-3 text-left" style={{ color: "var(--error)" }}>{errors.global}</div>}

        <div className="mt-4 flex gap-2">
          <Button onClick={onSubmit} disabled={saving}>Zapisz</Button>
          <Button onClick={() => nav("/studSubj")} disabled={saving}>Anuluj</Button>
        </div>
      </div>
    </div>
  );
}
