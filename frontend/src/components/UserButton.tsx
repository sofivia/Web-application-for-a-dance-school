import LinkButton from "./LinkButton";
import UserLogo from '@/assets/user.svg?react'

export default function UserButton() {

    return (
        <div>
            <LinkButton to="me/" ariaLabel="See account">
                <UserLogo className={'${styles.logo} m-auto'} aria-label="User icon" />
                Konto
            </LinkButton>
        </div>
    )
}