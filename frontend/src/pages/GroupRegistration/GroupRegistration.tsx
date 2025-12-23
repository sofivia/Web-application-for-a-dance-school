import { useEffect, useState } from 'react';
import { getClassGroups, type ClassGroup } from '@/api';
import styles from "./GroupRegistration.module.css";
import global from "@/global.module.css";
import formstyle from "@/styles/forms.module.css";
import { getWeekday, getHour } from '@/utils/dateUtils';
import { Link } from 'react-router-dom';


export default function GroupRegisteration() {
    const [groups, setGroups] = useState<ClassGroup[]>([]);

    useEffect(() => {
        async function fetchClassGroups() {
            setGroups((await getClassGroups({ page: 1 })).results);
        }
        fetchClassGroups();
    }, []);

    return (
        <div className={global.app_container}>
            <table className={styles.grupy}>
                <thead>
                    <tr>
                        <th> Nazwa </th>
                        <th> Czas </th>
                        <th> Limit miejsc </th>
                        <th>  </th>
                    </tr>
                </thead>
                <tbody>
                    {groups.map(g =>
                        <tr key={g.pk}>
                            <td> {g.name} </td>
                            <td>
                                {`${getWeekday(g.weekday)} ${getHour(g.start_time)}`}
                            </td>
                            <td> {g.nr_enrolled} / {g.effective_capacity} </td>
                            <td>
                                <Link to={`${g.pk}`} className={formstyle.link}>
                                    Szczegóły
                                </Link>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}