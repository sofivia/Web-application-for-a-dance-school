import { Routes, Route } from "react-router-dom";
import PassProductsList from "./PassProductsList.tsx";
import PassProductEdit from "./PassProductEdit.tsx";
import Index from "./Index.tsx";


export default function AdminAccountRoutes() {
   return (
      <Routes>
         <Route index element={<Index />} />
         <Route path="pass-products" element={<PassProductsList />} />
         <Route path="pass-products/:id/edit" element={<PassProductEdit />} />
         <Route path="pass-products/add" element={<PassProductEdit />} />
      </Routes>
   );
}
