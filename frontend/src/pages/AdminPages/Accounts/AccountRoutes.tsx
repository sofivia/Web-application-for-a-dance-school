import { Routes, Route } from "react-router-dom";
import AccountList from "./AccountList.tsx";
import AccountEdit from "./AccountEdit.tsx";
import AccountDetails from "./AccountDetails.tsx";
import AccountAdd from "./AccountAdd.tsx";

export default function AdminAccountRoutes() {
   return (
      <Routes>
         <Route index element={<AccountList />} />
         <Route path="edit/:id" element={<AccountEdit />} />
         <Route path="details/:id" element={<AccountDetails />} />
         <Route path="add/:role" element={<AccountAdd />} />
      </Routes>
   );
}
