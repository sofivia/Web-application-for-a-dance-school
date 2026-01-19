import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import global from "@/global.module.css";
import formstyles from "@/styles/forms.module.css";
import tablestyles from "@/styles/listTable.module.css";

import Button from "@/components/Button";
import { InputList } from "@/components/forms/InputList";
import type { Option } from "@/components/forms/Select";
import type { ReactInputWithLabelProps } from "@/components/forms/InputWithLabel";
import type { ReactSelectWithLabelProps } from "@/components/forms/SelectWithLabel";

import { getClassFilters, getClasses, deleteAdminSession, type ClassSessionRow } from "@/api";
import styles from "./Classes.module.css";

type AppliedFilters = {
  class_type: string;
  primary_instructor: string;
  location: string;
  date_from: string;
  date_to: string;
};

const PAGE_SIZE = 10;

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

function formatTimeRange(startsAt: string, endsAt: string): string {
  const s = new Date(startsAt);
  const e = new Date(endsAt);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return "-";
  const hhmm = (x: Date) => `${String(x.getHours()).padStart(2, "0")}:${String(x.getMinutes()).padStart(2, "0")}`;
  return `${hhmm(s)}–${hhmm(e)}`;
}

export default function ClassesList() {
  const [filterTick, setFilterTick] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const pageCount = Math.max(1, Math.ceil(count / PAGE_SIZE));

  const [rows, setRows] = useState<ClassSessionRow[]>([]);

  const [filterOptions, setFilterOptions] = useState<{
    classTypes: Option[];
    instructors: Option[];
    locations: Option[];
  }>({
    classTypes: [],
    instructors: [],
    locations: [],
  });

  const [applied, setApplied] = useState<AppliedFilters>({
    class_type: "",
    primary_instructor: "",
    location: "",
    date_from: "",
    date_to: "",
  });

  const navigate = useNavigate();

  const onDelete = async (id: string) => {
    const ok = window.confirm("Na pewno chcesz usunąć to zajęcie?");
    if (!ok) return;

    try {
      await deleteAdminSession(id);
      setFilterTick((v) => !v);
    } catch {
      alert("Nie udało się usunąć zajęcia.");
    }
  };

  useEffect(() => {
    (async () => {
      const f = await getClassFilters();
      setFilterOptions({
        classTypes: [
          { key: "", value: "", label: "Wszystkie" },
          ...f.class_types.map((ct) => ({ key: String(ct.id), value: String(ct.id), label: ct.name })),
        ],
        instructors: [
          { key: "", value: "", label: "Wszyscy" },
          ...f.instructors.map((i) => ({
            key: String(i.id),
            value: String(i.id),
            label: `${i.first_name} ${i.last_name}`,
          })),
        ],
        locations: [
          { key: "", value: "", label: "Wszystkie" },
          ...f.locations.map((l) => ({ key: String(l.pk), value: String(l.pk), label: l.name })),
        ],
      });
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setTableLoading(true);
      try {
        const params = {
          page,
          class_type: applied.class_type || undefined,
          primary_instructor: applied.primary_instructor || undefined,
          location: applied.location || undefined,
          date_from: applied.date_from || undefined,
          date_to: applied.date_to || undefined,
        };
        const data = await getClasses(params);
        setRows(data.results);
        setCount(data.count);
      } finally {
        setTableLoading(false);
      }
    })();
  }, [page, filterTick, applied]);

  const applyFilters = () => {
    setPage(1);
    setFilterTick((v) => !v);
  };

  const fields = useMemo(() => {
    const f = filterOptions;
    return [
      {
        name: "class_type",
        kind: "select-react",
        label: "Temat zajęć",
        prompt: "Wybierz typ",
        options: f.classTypes,
        values: {
          value: applied.class_type,
          setValue: (e: any) => setApplied((prev) => ({ ...prev, class_type: e.target.value })),
        },
      } as ReactSelectWithLabelProps,
      {
        name: "date_from",
        kind: "input-react",
        type: "date",
        label: "Data od",
        values: {
          value: applied.date_from,
          setValue: (e: any) => setApplied((prev) => ({ ...prev, date_from: e.target.value })),
        },
      } as ReactInputWithLabelProps,
      {
        name: "date_to",
        kind: "input-react",
        type: "date",
        label: "Data do",
        values: {
          value: applied.date_to,
          setValue: (e: any) => setApplied((prev) => ({ ...prev, date_to: e.target.value })),
        },
      } as ReactInputWithLabelProps,
      {
        name: "location",
        kind: "select-react",
        label: "Studio",
        prompt: "Wybierz studio",
        options: f.locations,
        values: {
          value: applied.location,
          setValue: (e: any) => setApplied((prev) => ({ ...prev, location: e.target.value })),
        },
      } as ReactSelectWithLabelProps,
      {
        name: "primary_instructor",
        kind: "select-react",
        label: "Instruktor",
        prompt: "Wybierz instruktora",
        options: f.instructors,
        values: {
          value: applied.primary_instructor,
          setValue: (e: any) => setApplied((prev) => ({ ...prev, primary_instructor: e.target.value })),
        },
      } as ReactSelectWithLabelProps,
    ];
  }, [filterOptions, applied]);

  return (
    <div className={global.app_container}>
      <div className={styles.page}>
        <div className="flex flex-col gap-2 mb-4">
          <h1 className="text-base font-bold">Zarządzanie zajęciami</h1>
        </div>

        <div className={`${formstyles.filtersBar} ${formstyles.panel} mb-5`}>
          <InputList fields={fields} />
          <Button onClick={applyFilters} className={styles.filterBtn} disabled={tableLoading}>
            Filtruj
          </Button>
        </div>

        <div className={styles.tableWrap}>
          <table className={`${tablestyles.listTable}`}>
            <thead>
              <tr>
                <th>Typ zajęcia</th>
                <th>Data</th>
                <th>Godzina</th>
                <th>Studio</th>
                <th>Przypisany instruktor</th>
                <th>Uczniowie</th>
                <th>Akcje</th>
              </tr>
            </thead>
            <tbody>
              {!tableLoading &&
                rows.map((r) => {
                  const instructor = r.instructor ? `${r.instructor.first_name} ${r.instructor.last_name}` : "—";
                  return (
                    <tr key={r.id}>
                      <td>{r.class_type.name}</td>
                      <td>{formatDate(r.starts_at)}</td>
                      <td>{formatTimeRange(r.starts_at, r.ends_at)}</td>
                      <td>{r.location?.name ?? "—"}</td>
                      <td>{instructor}</td>
                      <td>
                        <Link
                          to={`/classes/${r.id}/participants`}
                          className="text-blue-500 hover:text-blue-700 hover:underline transition-colors duration-150"
                        >
                          Wyświetl listę
                        </Link>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <Button className="link" onClick={() => navigate(`./edit/${r.id}`)}>
                            Edytuj
                          </Button>
                          <Button className="link" onClick={() => onDelete(r.id)}>
                            Usuń
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

              {tableLoading && (
                <tr>
                  <td colSpan={7} className={styles.emptyRow}>
                    Ładowanie…
                  </td>
                </tr>
              )}

              {!tableLoading && rows.length === 0 && (
                <tr>
                  <td colSpan={7} className={styles.emptyRow}>
                    Brak wyników dla wybranych filtrów.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 items-center">
          {[...Array(pageCount).keys()].map((p) => (
            <Button
              key={p + 1}
              className={`${styles.filterBtn} ${p + 1 === page ? "bg-main!" : ""}`}
              onClick={() => setPage(p + 1)}
              disabled={tableLoading}
            >
              {p + 1}
            </Button>
          ))}

          <div className="flex-1" />

          <Button onClick={() => navigate("./new")}>
            Dodaj nowe zajęcie
          </Button>
        </div>
      </div>
    </div>
  );
}
