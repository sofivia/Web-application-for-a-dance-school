import { Routes, Route, useNavigate } from "react-router-dom";
import Login from "./pages/Login/Login";
import Home from "./pages/Home/Home";
import Container from "./Container";
import { setOnLogoutCallback, clearTokens } from "./api";
import { useEffect } from "react";
import Register from "./pages/Register/Register";

export default function App() {
   const navigate = useNavigate();

   useEffect(() => {
      setOnLogoutCallback(() => {
         clearTokens();
         navigate("/login");
      });
   }, [navigate]);
   return (
      <Routes>
         <Route path="/" element={<Container />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
         </Route>
      </Routes>
   );
}
