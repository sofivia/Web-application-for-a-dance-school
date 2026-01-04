import type { ClassSessionRow } from "@/api";
import { getWeekday } from "@/utils/dateUtils";


export default function Day(props: { day: number, items: ClassSessionRow[] }) {
    const { day, items } = props;
    return (<div key={day} className="rounded-2xl border border-white/10 p-4">
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
                        <span>{r.location.name}</span>
                    </li>
                );
            })}
        </ul>
    </div>)
}
