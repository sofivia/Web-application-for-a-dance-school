import LinkButton from "@/components/LinkButton";
import styles from "./Index.module.css"
import global from "@/global.module.css";

export default function Index() {
    return (
        <div className={global.app_container}>
            <div className={`flex ${styles.tiles}`}>
                <LinkButton to="./pass-products" className={styles.tile}>
                    Karnety
                </LinkButton>
                <LinkButton to="./payments" className={styles.tile}>
                    Płatności
                </LinkButton>
            </div>
        </div>);
}