import { useEffect, useMemo, useState } from "react";
import global from "@/global.module.css";
import styles from "./InstructorClasses.module.css";
import Button from "@/components/Button";
import LinkButton from "@/components/LinkButton";
import { getInstructor, getClassFilters, listClassSessions } from "@/api";

type Option = { value: string; label: string };

function formatDate(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function weekdayPl(n: number) {
  return (
    ["Niedziela", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota"][n] ?? ""
  );
}

function asId(v: unknown): string {
  if (v === null || v === undefined) return "";
  return String(v);
}

type SessionRow = {
  id?: string | number;
  starts_at?: string;
  ends_at?: string;
  class_type?: { id?: string | number; name?: string } | null;
  instructor?: { id?: string; first_name?: string; last_name?: string } | null;
  location?: { pk?: number | string; name?: string } | null;
};

export default function InstructorClasses() {
  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string | null>(null);

  const [instructorId, setInstructorId] = useState<string>("");

  const [classTypeOptions, setClassTypeOptions] = useState<Option[]>([
    { value: "", label: "Wszystkie" },
  ]);
  const [locationOptions, setLocationOptions] = useState<Option[]>([
    { value: "", label: "Wszystkie" },
  ]);

  const today = useMemo(() => new Date(), []);
  const in4weeks = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 28);
    return d;
  }, []);

  const [dateFrom, setDateFrom] = useState<string>(formatDate(today));
  const [dateTo, setDateTo] = useState<string>(formatDate(in4weeks));
  const [classType, setClassType] = useState<string>("");
  const [location, setLocation] = useState<string>("");

  const [allSessions, setAllSessions] = useState<SessionRow[]>([]);

  const fetchAll = async () => {
    setLoading(true);
    setErr(null);

    try {
      const inst: any = await getInstructor();
      const instId = asId(inst?.id ?? inst?.pk);
      if (!instId) {
        setInstructorId("");
        setAllSessions([]);
        setErr("Nie udało się ustalić ID instruktora (brak id/pk w odpowiedzi API).");
        return;
      }
      setInstructorId(instId);

      const filters: any = await getClassFilters();

      const classTypes = Array.isArray(filters?.class_types) ? filters.class_types : [];
      const locations = Array.isArray(filters?.locations) ? filters.locations : [];

      setClassTypeOptions([
        { value: "", label: "Wszystkie" },
        ...classTypes.map((ct: any) => ({
          value: asId(ct?.id ?? ct?.pk),
          label: ct?.level ? `${ct?.name ?? "Typ"} (${ct.level})` : (ct?.name ?? "Typ"),
        })),
      ]);

      setLocationOptions([
        { value: "", label: "Wszystkie" },
        ...locations.map((l: any) => ({
          value: asId(l?.pk ?? l?.id),
          label: l?.name ?? "Studio",
        })),
      ]);

      const resp: any = await listClassSessions({
        date_from: dateFrom,
        date_to: dateTo,
      });

      const list: any[] =
        Array.isArray(resp) ? resp :
        Array.isArray(resp?.results) ? resp.results :
        [];

      setAllSessions(list as SessionRow[]);
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 401) setErr("Brak autoryzacji (401) — zaloguj się ponownie.");
      else if (status === 403) setErr("Brak dostępu (403) — konto nie ma uprawnień instruktora.");
      else setErr("Nie udało się pobrać danych do panelu instruktora.");
      setAllSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const filteredSessions = useMemo(() => {
    let out = [...allSessions];

    if (instructorId) {
      out = out.filter((s) => asId(s?.instructor?.id) === instructorId);
    }

    if (classType) {
      out = out.filter((s) => asId(s?.class_type?.id) === asId(classType));
    }

    if (location) {
      out = out.filter((s) => asId(s?.location?.pk) === asId(location));
    }

    out.sort((a, b) => (a?.starts_at ?? "").localeCompare(b?.starts_at ?? ""));
    return out;
  }, [allSessions, instructorId, classType, location]);

const upcomingList = useMemo(() => {
  const items: { key: string; line: string }[] = [];

  for (const s of filteredSessions) {
    const startsAt = s?.starts_at;
    if (!startsAt) continue;

    const endsAt = s?.ends_at ?? "";
    const date = startsAt.slice(0, 10);
    const startTime = startsAt.slice(11, 16);
    const endTime = endsAt ? endsAt.slice(11, 16) : "";
    const d = new Date(startsAt);
    const day = weekdayPl(d.getDay());

    const name = s?.class_type?.name ?? "Zajęcia";
    const studio = s?.location?.name ?? "";

    const timePart = endTime ? `${startTime}–${endTime}` : startTime;
    const studioPart = studio ? `, ${studio}` : "";

    items.push({
      key: startsAt,
      line: `${date} (${day}), ${timePart} — ${name}${studioPart}`,
    });
  }

  items.sort((a, b) => a.key.localeCompare(b.key));
  return items;
}, [filteredSessions]);

  return (
    <div className={global.app_container}>
      <div className={styles.container}>
        <div className={styles.titleRow}>
          <div>
            <div className={styles.h1}>Grupy zajęciowe</div>
            <div className={styles.muted}>Panel instruktora — Twoje zajęcia i grupy.</div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.muted} style={{ marginBottom: 10 }}>
            Zajęcia, na które jesteś przypisany jako instruktor (wg filtrów poniżej):
          </div>

          {loading ? (
            <div className={styles.muted}>Ładowanie…</div>
          ) : upcomingList.length === 0 ? (
            <div className={styles.muted}>Brak zajęć w wybranym zakresie.</div>
          ) : (
            <ul style={{ marginLeft: 18 }}>
            {upcomingList.slice(0, 8).map((it) => (
                <li key={it.key}><b>{it.line}</b></li>
            ))}
            </ul>
          )}
        </div>

        <div className={styles.card}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Filtry</div>

          <div className={styles.filters}>
            <div>
              <div className={styles.label}>Od</div>
              <input
                className={styles.input}
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div>
              <div className={styles.label}>Do</div>
              <input
                className={styles.input}
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>

            <div>
              <div className={styles.label}>Typ zajęć</div>
              <select
                className={styles.select}
                value={classType}
                onChange={(e) => setClassType(e.target.value)}
              >
                {classTypeOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className={styles.label}>Studio</div>
              <select
                className={styles.select}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                {locationOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Button onClick={fetchAll}>Filtruj</Button>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Lista zajęć</div>

          {err && <div style={{ color: "#ff6b6b", marginBottom: 10 }}>{err}</div>}

          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Data</th>
                <th className={styles.th}>Godzina</th>
                <th className={styles.th}>Typ</th>
                <th className={styles.th}>Studio</th>
                <th className={styles.th}>Akcje</th>
              </tr>
            </thead>
            <tbody>
              {!loading && filteredSessions.length === 0 && (
                <tr>
                  <td className={styles.td} colSpan={5}>
                    <span className={styles.muted}>Brak wyników.</span>
                  </td>
                </tr>
              )}

              {filteredSessions.map((s, idx) => {
                const startsAt = s?.starts_at ?? "";
                const endsAt = s?.ends_at ?? "";

                const date = startsAt ? startsAt.slice(0, 10) : "-";
                const time =
                  startsAt && endsAt ? `${startsAt.slice(11, 16)}–${endsAt.slice(11, 16)}` :
                  startsAt ? startsAt.slice(11, 16) : "-";

                const type = s?.class_type?.name ?? "-";
                const studio = s?.location?.name ?? "-";
                const id = asId(s?.id ?? idx);

                return (
                  <tr key={id}>
                    <td className={styles.td}>{date}</td>
                    <td className={styles.td}>{time}</td>
                    <td className={styles.td}>{type}</td>
                    <td className={styles.td}>{studio}</td>
                    <td className={styles.td}>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <LinkButton to={`/classes/${id}/participants`} className="">
                          Otwórz listę
                        </LinkButton>
                        <LinkButton to={`/classes/${id}/attendance`} className="">
                          Odnotuj obecność
                        </LinkButton>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className={styles.muted} style={{ marginTop: 10 }}>
            (Akcje “Otwórz listę / Odnotuj obecność” są przygotowane jako routing pod kolejne ekrany.)
          </div>
        </div>
      </div>
    </div>
  );
}
