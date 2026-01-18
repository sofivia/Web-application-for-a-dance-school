import LinkButton from "@/components/LinkButton";
import styles from "@/styles/tiles.module.css"
import global from "@/global.module.css";

export default function Index() {
    return (
        <div className={global.app_container}>
            <div className={`flex ${styles.tiles}`}>
                <LinkButton to="./groups" className={styles.tile}>
                    Grupy
                </LinkButton>
                <LinkButton to="./sessions" className={styles.tile}>
                    Sesje
                </LinkButton>
            </div>
        </div>);
}