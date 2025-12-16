import UserLogo from "@/assets/user.svg?react";

export default function UserButton() {
   return (
      <div>
         <UserLogo className={"${styles.logo} "} aria-label="User icon" />
         Konto
      </div>
   );
}
