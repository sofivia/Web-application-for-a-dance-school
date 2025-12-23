import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";

import global from "@/global.module.css";
import styles from "./ClassReg.module.css";
import Button from "@/components/Button";
import { getClassFilters, getClasses, enroll, unenroll, type ClassSessionRow } from "@/api";
import { useAuth } from "@/utils/auth/useAuth";
import { formatDate, fromISO } from "@/utils/dateUtils";


export default function ClassReg() {
  const { isLoggedIn, loading } = useAuth();
  if (!loading && !isLoggedIn) return <Navigate to="/login" replace />;

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
  const [rows, setRows] = useState<ClassSessionRow[]>([]);
  const [count, setCount] = useState(0);

  const pageSize = 10;
  const [page, setPage] = useState(1);

  const pageCount = useMemo(() => Math.max(1, Math.ceil(count / pageSize)), [count]);

  async function loadTable(p: number, a = applied) {
    setTableLoading(true);
    try {
      const res = await getClasses({
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

  useEffect(() => {
    if (loading || !isLoggedIn) return;
    loadTable(page, applied);
  }, [loading, isLoggedIn, applied, page]);

  const [actionBusy, setActionBusy] = useState<string | null>(null);

  const handleEnroll = async (r: ClassSessionRow) => {
    setActionBusy(r.id);
    try {
      await enroll(r.group_id);
      await loadTable(page, applied);
    } finally {
      setActionBusy(null);
    }
  };

  const handleUnenroll = async (r: ClassSessionRow) => {
    setActionBusy(r.id);
    try {
      await unenroll(r.group_id);
      await loadTable(page, applied);
    } finally {
      setActionBusy(null);
    }
  };

  return (
    <div className={global.app_container}>
      <div className={global.header} />

      <div className={styles.page}>
        <h1 className={styles.pageTitle}>Zapis na zajęcia</h1>

        <div className={styles.filtersBar}>
          <div className={styles.filter}>
            <div className={styles.filterLabel}>Typ zajęć</div>
            <select
              className={styles.control}
              value={classTypeId}
              onChange={(e) => setClassTypeId(e.target.value)}
              disabled={filtersLoading}
            >
              <option value="">Wybierz typ</option>
              {classTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}{t.level ? ` — ${t.level}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filter}>
            <div className={styles.filterLabel}>Data zajęcia</div>
            <div className={styles.dateRow}>
              <input className={styles.control} type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              <input className={styles.control} type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
          </div>

          <div className={styles.filter}>
            <div className={styles.filterLabel}>Prowadzący</div>
            <select
              className={styles.control}
              value={instructorId}
              onChange={(e) => setInstructorId(e.target.value)}
              disabled={filtersLoading}
            >
              <option value="">Wybierz prow.</option>
              {instructors.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.first_name} {p.last_name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filter}>
            <div className={styles.filterLabel}>Studio</div>
            <select
              className={styles.control}
              value={studio}
              onChange={(e) => setStudio(e.target.value)}
              disabled={filtersLoading}
            >
              <option value="">Wybierz studio</option>
              {studios.map((s) => (
                <option key={s.pk} value={s.pk}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterBtnWrap}>
            <Button onClick={applyFilters} className={styles.filterBtn} disabled={filtersLoading}>
              Filtruj
            </Button>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Typ zajęcia</th>
                <th>Data zajęcia</th>
                <th>Prowadzący</th>
                <th>Studio</th>
                <th>Limit miejsc</th>
                <th>Zapis</th>
              </tr>
            </thead>
            <tbody>
              {!tableLoading &&
                rows.map((r) => {
                  const date = fromISO(r.starts_at);
                  const instructorName = r.instructor ? `${r.instructor.first_name} ${r.instructor.last_name}` : "—";
                  const isFull = r.limit > 0 && r.enrolled >= r.limit;
                  const busy = actionBusy === r.id;

                  return (
                    <tr key={r.id}>
                      <td>
                        {r.class_type.name}
                        {r.class_type.level ? ` — ${r.class_type.level}` : ""}
                      </td>
                      <td>{formatDate(date)}</td>
                      <td>{instructorName}</td>
                      <td>{r.location.name}</td>
                      <td>{r.enrolled}/{r.limit}</td>
                      <td>
                        {r.is_enrolled ? (
                          <button
                            className={styles.signupLink}
                            onClick={() => handleUnenroll(r)}
                            disabled={busy}
                          >
                            {busy ? "..." : "Wypisz się"}
                          </button>
                        ) : isFull ? (
                          <span className={styles.noSeats}>Brak miejsc</span>
                        ) : (
                          <button
                            className={styles.signupLink}
                            onClick={() => handleEnroll(r)}
                            disabled={busy}
                          >
                            {busy ? "..." : "Zapisz się"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}

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

        <div className={styles.pagination}>
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`${styles.pageBtn} ${p === page ? styles.pageBtnActive : ""}`}
              onClick={() => setPage(p)}
              disabled={tableLoading}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
