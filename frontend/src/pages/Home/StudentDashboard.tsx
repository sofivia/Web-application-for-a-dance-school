import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import global from "@/global.module.css";
import { getClasses, type ClassSessionRow } from "@/api";
import { getWeekday, dateToISOday } from "@/utils/dateUtils";

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ClassSessionRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const today = new Date();
        const in60 = new Date();
        in60.setDate(in60.getDate() + 60);

        const data = await getClasses({
          page: 1,
          date_from: dateToISOday(today),
          date_to: dateToISOday(in60),
        });

        setRows(data.results);
      } catch (e) {
        setError("Nie udało się pobrać listy zajęć.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  const enrolledSchedule = useMemo(() => {
    const enrolled = rows.filter((r) => r.is_enrolled);

    const byGroup = new Map<string, ClassSessionRow>();
    for (const r of enrolled) {
      const prev = byGroup.get(r.group_id);
      if (!prev || new Date(r.starts_at) < new Date(prev.starts_at)) {
        byGroup.set(r.group_id, r);
      }
    }

    const unique = Array.from(byGroup.values()).sort(
      (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
    );

    const grouped = new Map<number, ClassSessionRow[]>();
    for (const r of unique) {
      const day = new Date(r.starts_at).getDay(); // 0..6
      grouped.set(day, [...(grouped.get(day) ?? []), r]);
    }

    return { grouped };
  }, [rows]);

  const DAYS = [...Array(7).keys()];

  return (
    <div className={global.app_container} style={{ alignItems: "start" }}>
      <div className="w-full max-w-5xl px-4">
        <h1 className="text-3xl font-semibold mb-6">Moje zajęcia</h1>

        {loading && <div className="opacity-80">Ładowanie…</div>}
        {error && <div className="text-red-400">{error}</div>}

        {!loading && !error && (
          <>
            {Array.from(enrolledSchedule.grouped.keys()).length === 0 ? (
              <div className="opacity-80">
                Nie jesteś jeszcze zapisana na żadne zajęcia.{" "}
                <Link className="underline" to="/classReg">
                  Przejdź do zapisów
                </Link>
                .
              </div>
            ) : (
              <div className="space-y-5">
                {DAYS.map((day) => {
                  const items = enrolledSchedule.grouped.get(day) ?? [];
                  if (items.length === 0) return null;

                  return (
                    <div key={day} className="rounded-2xl border border-white/10 p-4">
                      <div className="text-xl font-medium mb-2">{getWeekday(day)}</div>
                      <ul className="space-y-2">
                        {items.map((r) => {
                          const t = new Date(r.starts_at).toLocaleTimeString("pl-PL", {
                            hour: "2-digit",
                            minute: "2-digit",
                          });
                          const label = `${r.class_type.name} — ${r.class_type.level}`;
                          const instr = r.instructor
                            ? `${r.instructor.first_name} ${r.instructor.last_name}`
                            : "—";

                          return (
                            <li key={r.group_id} className="flex flex-wrap gap-x-4 gap-y-1 opacity-90">
                              <span className="font-semibold">{label}</span>
                              <span>{t}</span>
                              <span>{instr}</span>
                              <span>{r.location}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-6">
              <Link to="/classReg" className="underline">
                Zapis na zajęcia →
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
