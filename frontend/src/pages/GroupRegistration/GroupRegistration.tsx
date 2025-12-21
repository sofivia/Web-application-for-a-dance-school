import { useEffect, useState } from 'react';
import { getClassGroups, type ClassGroup } from '@/api';
import styles from "./GroupRegistration.module.css";
import global from "@/global.module.css";
import formstyle from "@/styles/forms.module.css";
import { getWeekday, getHour } from '@/utils/apiutils';
import { Link } from 'react-router-dom';


export default function GroupRegisteration() {
    const [groups, setGroups] = useState<ClassGroup[]>([]);

    useEffect(() => {
        async function fetchClassGroups() {
            setGroups(await getClassGroups());
        }
        fetchClassGroups();
    }, []);

    return (
        <div className={global.app_container}>
            <table className={styles.grupy}>
                <tbody>
                    <tr>
                        <td> Nazwa </td>
                        <td> Czas </td>
                        <td> Limit miejsc </td>
                        <td> Szczegóły </td>
                    </tr>
                    {groups.map(g =>
                        <tr>
                            <td> {g.name} </td>
                            <td>
                                {`${getWeekday(g.weekday)} ${getHour(g.start_time)}`}
                            </td>
                            <td> {g.capacity} </td>
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