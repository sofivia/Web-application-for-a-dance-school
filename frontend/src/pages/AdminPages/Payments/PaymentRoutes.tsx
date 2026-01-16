import { Routes, Route } from "react-router-dom";
import PassProductsList from "./PassProductsList.tsx";
import PassProductEdit from "./PassProductEdit.tsx";
import PaymentsList from "./PaymentsList.tsx";
import PaymentDetails from "./PaymentDetails.tsx";
import Index from "./Index.tsx";
import PaymentAdd from "./PaymentAdd.tsx";
import GeneratePayments from "./GeneratePayments.tsx";


export default function AdminAccountRoutes() {
   return (
      <Routes>
         <Route index element={<Index />} />
         <Route path="pass-products" element={<PassProductsList />} />
         <Route path="pass-products/:id/edit" element={<PassProductEdit />} />
         <Route path="pass-products/add" element={<PassProductEdit />} />
         <Route path="payments" element={<PaymentsList />} />
         <Route path="payments/:id" element={<PaymentDetails />} />
         <Route path="payments/generate" element={<GeneratePayments />} />
         <Route path="payments/add" element={<PaymentAdd />} />
      </Routes>
   );
}
