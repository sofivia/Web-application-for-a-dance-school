import { useEffect, useState } from "react";

import global from "@/global.module.css";
import Button from "@/components/Button";
import formstyles from "@/styles/forms.module.css";
import { getClassFilters, getClassGroups, type ClassGroup } from "@/api";
import { useAuth } from "@/utils/auth/useAuth";
import { getWeekday, getHour } from "@/utils/dateUtils";
import { Link } from 'react-router-dom';

import Select from "@/components/forms/SelectWithLabel";
import type { Option } from "@/components/forms/Select";
import Input from "@/components/forms/InputWithLabel.tsx";
import type { InputValues } from "@/components/forms/commons";
import selectstyles from "@/components/forms/Select.module.css"
import styles from "./ClassReg.module.css";


export default function ClassReg() {
  const { isLoggedIn, loading } = useAuth();

  const [filtersLoading, setFiltersLoading] = useState(true);
  const [classTypes, setClassTypes] = useState<{ id: string; name: string; level: string; duration_minutes: number }[]>([]);
  const [instructors, setInstructors] = useState<{ id: string; first_name: string; last_name: string }[]>([]);
  const [studios, setStudios] = useState<{ pk: string, name: string }[]>([]);

  useEffect(() => {
    let mounted = true;
    async function loadFilters() {
      try {
        const f = await getClassFilters();
        if (!mounted) return;
        setClassTypes(f.class_types);
        setInstructors(f.instructors);
        setStudios(f.locations);
      } finally {
        if (mounted) setFiltersLoading(false);
      }
    }
    if (!loading && isLoggedIn) loadFilters();
    return () => {
      mounted = false;
    };
  }, [loading, isLoggedIn]);

  const [classTypeId, setClassTypeId] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [instructorId, setInstructorId] = useState<string>("");
  const [studio, setStudio] = useState<string>("");

  const [applied, setApplied] = useState({
    class_type: "",
    date_from: "",
    date_to: "",
    instructor: "",
    studio: "",
  });

  const applyFilters = () => {
    setApplied({
      class_type: classTypeId,
      date_from: dateFrom,
      date_to: dateTo,
      instructor: instructorId,
      studio,
    });
    setPage(1);
  };

  const [tableLoading, setTableLoading] = useState(false);
  const [rows, setRows] = useState<ClassGroup[]>([]);
  const [count, setCount] = useState(0);

  const pageSize = 10;
  const [page, setPage] = useState(1);

  const pageCount = Math.max(1, Math.ceil(count / pageSize));

  useEffect(() => {
    async function loadTable(p: number, a = applied) {
      setTableLoading(true);
      try {
        const res = await getClassGroups({
          page: p,
          class_type: a.class_type || undefined,
          primary_instructor: a.instructor || undefined,
          location: a.studio || undefined,
          date_from: a.date_from || undefined,
          date_to: a.date_to || undefined,
        });
        setRows(res.results);
        setCount(res.count);
      } finally {
        setTableLoading(false);
      }
    }

    if (loading || !isLoggedIn) return;
    loadTable(page, applied);
  }, [loading, isLoggedIn, applied, page]);

  const optionsTyp: Option[] = classTypes.map(t => ({ key: t.id, value: t.id, label: `${t.name}${t.level ? ` — ${t.level}` : ""}` }));

  const dateFromValues: InputValues = { value: dateFrom, setValue: e => setDateFrom(e.target.value) };
  const dateToValues: InputValues = { value: dateTo, setValue: e => setDateTo(e.target.value) };

  const optionsInstructor: Option[] = instructors.map(t => ({ key: t.id, value: t.id, label: `${t.first_name} ${t.last_name}` }));

  const optionsLocation: Option[] = studios.map(t => ({ key: t.pk, value: t.pk, label: `${t.name}` }));

  return (
    <div className={global.app_container}>
      <div className={styles.page}>
        <h1 className={`text-base font-bold mb-3`}>Zapis na zajęcia</h1>

        <div className={`${styles.filtersBar} ${formstyles.panel} mb-5`}>
          <Select label="Typ zajęć" prompt="Wybierz typ" options={optionsTyp}
            values={{ value: "", setValue: e => setClassTypeId(e.target.value) }} />

          <div className={selectstyles.filter}>
            <label className="block mb-1"> Czas trwania </label>
            <div className="text-nowrap">
              <Input type="time" label="początek od:" values={dateFromValues} fClassName="inline-block mx-2" />
              <Input type="time" label="koniec do:" values={dateToValues} fClassName="inline-block mx-2" />
            </div>
          </div>

          <Select label="Prowadzący" prompt="Wybierz prowadzącego" options={optionsInstructor}
            values={{ value: "", setValue: e => setInstructorId(e.target.value) }} />

          <Select label="Studia" prompt="Wybierz studio" options={optionsLocation}
            values={{ value: "", setValue: e => setStudio(e.target.value) }} />

          <Button onClick={applyFilters} className={styles.filterBtn} disabled={filtersLoading}>
            Filtruj
          </Button>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th> Nazwa </th>
                <th> Czas </th>
                <th> Limit miejsc </th>
                <th>  </th>
              </tr>
            </thead>
            <tbody>
              {!tableLoading &&
                rows.map(g =>
                  <tr key={g.pk}>
                    <td> {g.name} </td>
                    <td>
                      {`${getWeekday(g.weekday)} ${getHour(g.start_time)}`}
                    </td>
                    <td> {g.nr_enrolled} / {g.effective_capacity} </td>
                    <td>
                      <Link to={`${g.pk}`} className={formstyles.link}>
                        Szczegóły
                      </Link>
                    </td>
                  </tr>
                )}

              {tableLoading && (
                <tr>
                  <td colSpan={6} className={styles.emptyRow}>
                    Ładowanie...
                  </td>
                </tr>
              )}

              {!tableLoading && rows.length === 0 && (
                <tr>
                  <td colSpan={6} className={styles.emptyRow}>
                    Brak wyników dla wybranych filtrów.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-3">
          {[...Array(pageCount).keys()].map((p) => (
            <Button
              key={p + 1}
              className={`${styles.filterBtn} ${p + 1 === page ? "!bg-main" : ""}`}
              onClick={() => setPage(p + 1)}
              disabled={tableLoading}
            >
              {p + 1}
            </Button>
          ))}
        </div>
      </div>
    </div >
  );
}
