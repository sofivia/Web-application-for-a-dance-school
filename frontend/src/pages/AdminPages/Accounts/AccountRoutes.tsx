import { Routes, Route } from "react-router-dom";
import AccountList from "./AccountList.tsx";
import AccountEdit from "./AccountEdit.tsx";
import AccountRemove from "./AccountRemove.tsx";
import AccountAdd from "./AccountAdd.tsx";

export default function AdminAccountRoutes() {
   return (
      <Routes>
         <Route index element={<AccountList />} />
         <Route path="edit/:id" element={<AccountEdit />} />
         <Route path="remove/:id" element={<AccountRemove />} />
         <Route path="add/:role" element={<AccountAdd />} />
      </Routes>
   );
}
