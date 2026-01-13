import { Routes, Route, useNavigate } from "react-router-dom";
import Login from "./pages/Login/Login";
import Home from "./pages/Home/Home";
import Container from "./Container";
import { setOnLogoutCallback, clearTokens } from "./api";
import { useEffect } from "react";
import Register from "./pages/Register/Register";
import AccountRoutes from "./pages/Account/AccountRoutes.tsx";
import GroupRoutes from "./pages/StudentPages/GroupRegistration/GroupRoutes.tsx";
import AdminAccountRoutes from "./pages/AdminPages/Accounts/AccountRoutes.tsx";
import InstructorClasses from "./pages/Classes/InstructorClasses.tsx";
import InstructorClassParticipants from "./pages/Classes/InstructorClassParticipants.tsx";
import AdminPaymentRoutes from "./pages/AdminPages/Payments/PaymentRoutes.tsx";
import { Toaster } from "react-hot-toast";
import StudentAttendance from "./pages/StudentPages/Attendance/StudentAttendance.tsx";
import StudentPayments from "./pages/StudentPages/Payments/StudentPayments.tsx";

export default function App() {
   const navigate = useNavigate();

   useEffect(() => {
      setOnLogoutCallback(() => {
         clearTokens();
         navigate("/login");
      });
   }, [navigate]);
   return (
      <>
         <Toaster position="bottom-right" reverseOrder={false} />
         <Routes>
            <Route path="/" element={<Container />}>
               <Route path="login" element={<Login />} />
               <Route path="register" element={<Register />} />
               <Route index element={<Home />} />
               <Route path="attendance" element={<StudentAttendance />} />
               <Route path="studPayments" element={<StudentPayments />} />
               <Route path="me/*" element={<AccountRoutes />} />
               <Route path="group-reg/*" element={<GroupRoutes />} />
               <Route path="userManage/*" element={<AdminAccountRoutes />} />
               <Route path="classes" element={<InstructorClasses />} />
               <Route path="/classes/:sessionId/participants" element={<InstructorClassParticipants />} />
               <Route path="payments/*" element={<AdminPaymentRoutes />} />
            </Route>
         </Routes>
      </>
   );
}
