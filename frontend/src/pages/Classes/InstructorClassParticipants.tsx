import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import global from "@/global.module.css";
import styles from "./InstructorClassParticipants.module.css";
import Button from "@/components/Button";
import { getClassParticipants, saveClassAttendance } from "@/api";
import type { AttendanceStatus, ClassParticipantRow } from "@/api";

type UiRow = ClassParticipantRow & { status_ui: AttendanceStatus };

function safeStatus(v: any): AttendanceStatus {
  if (v === "present" || v === "absent" || v === "excused") return v;
  return "absent";
}

export default function InstructorClassParticipants() {
  const { sessionId } = useParams();
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const readonly = sp.get("readonly") === "1";

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [canEdit, setCanEdit] = useState<boolean>(true);
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [rows, setRows] = useState<UiRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState<string | null>(null);

  const titleLine = useMemo(() => {
    const start = sessionInfo?.starts_at ?? sessionInfo?.start ?? null;
    const end = sessionInfo?.ends_at ?? sessionInfo?.end ?? null;
    if (!start) return null;
    const date = String(start).slice(0, 10);
    const timeFrom = String(start).slice(11, 16);
    const timeTo = end ? String(end).slice(11, 16) : "";
    return `${date} ${timeFrom}${timeTo ? `–${timeTo}` : ""}`;
  }, [sessionInfo]);

  async function load() {
    if (!sessionId) return;

    setLoading(true);
    setErr(null);
    setSavedOk(null);

    try {
      const data = await getClassParticipants(sessionId);

      const participants: ClassParticipantRow[] = Array.isArray((data as any)?.participants)
        ? (data as any).participants
        : Array.isArray(data as any)
          ? (data as any)
          : [];

      setSessionInfo((data as any)?.session ?? null);

      const beCanEdit = typeof (data as any)?.can_edit === "boolean" ? (data as any).can_edit : true;
      setCanEdit(beCanEdit && !readonly);

      const mapped: UiRow[] = participants.map((p) => ({
        ...p,
        status_ui: safeStatus((p as any).status),
      }));

      setRows(mapped);
    } catch (e: any) {
      const msg = String(e?.message ?? "");
      if (msg.includes("404")) {
        setErr("Endpoint listy uczestników nie jest jeszcze dostępny w backendzie (404).");
      } else if (msg.includes("401") || msg.includes("403")) {
        setErr("Brak dostępu (401/403). Upewnij się, że jesteś zalogowana jako instruktor.");
      } else {
        setErr("Nie udało się pobrać listy uczestników.");
      }
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [sessionId, readonly]);

  function setRowStatus(student_id: string, status: AttendanceStatus) {
    setRows((prev) => prev.map((r) => (r.student_id === student_id ? { ...r, status_ui: status } : r)));
  }

  async function onSave() {
    if (!sessionId) return;
    setSaving(true);
    setErr(null);
    setSavedOk(null);

    try {
      const records = rows.map((r) => ({
        student_id: r.student_id,
        status: r.status_ui,
      }));

      const resp = await saveClassAttendance(sessionId, records);
      if (resp?.ok) setSavedOk("Zapisano obecność ✅");
      else setSavedOk("Wysłano dane (backend zwrócił ok=false lub inny format).");
    } catch (e: any) {
      setErr("Nie udało się zapisać obecności.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={global.app_container}>
      <div className={styles.container}>
        <div className={styles.titleRow}>
          <div>
            <div className={styles.h1}>Lista uczestników</div>
            <div className={styles.muted}>
              {titleLine ? `Zajęcia: ${titleLine}` : "Zajęcia — uczestnicy i obecność."}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <Button onClick={() => nav(-1)}>Wróć</Button>
          </div>
        </div>

        <div className={styles.card}>
          {err && <div className={styles.error}>{err}</div>}

          {loading ? (
            <div className={styles.muted}>Ładowanie…</div>
          ) : rows.length === 0 ? (
            <div className={styles.muted}>Brak uczestników w tej grupie.</div>
          ) : (
            <>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>Imię</th>
                    <th className={styles.th}>Nazwisko</th>
                    <th className={styles.th}>Obecność</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((r) => (
                    <tr key={r.student_id}>
                      <td className={styles.td}>{r.first_name}</td>
                      <td className={styles.td}>{r.last_name}</td>
                      <td className={styles.td}>
                        <select
                          className={styles.select}
                          value={r.status_ui}
                          disabled={!canEdit || saving}
                          onChange={(e) => setRowStatus(r.student_id, e.target.value as AttendanceStatus)}
                        >
                          <option value="present">Obecny</option>
                          <option value="absent">Nieobecny</option>
                          <option value="excused">Usprawiedliwiony</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className={styles.footerRow}>
                <div className={styles.muted}>
                  {!canEdit ? "Brak możliwości edycji obecności dla tych zajęć." : "Zmień status i zapisz."}
                </div>

                {canEdit && (
                  <Button onClick={onSave} disabled={saving}>
                    {saving ? "Zapisywanie…" : "Zapisz obecność"}
                  </Button>
                )}
              </div>

              {savedOk && <div className={styles.ok}>{savedOk}</div>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
