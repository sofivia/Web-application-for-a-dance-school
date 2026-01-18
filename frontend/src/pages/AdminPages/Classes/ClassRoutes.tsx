import { Routes, Route } from "react-router-dom";
import ClassesList from "./ClassesList";
import ClassAdd from "./ClassAdd";
import ClassEdit from "./ClassEdit";
import Index from "./Index.tsx";

export default function AdminClassRoutes() {
  return (
    <Routes>
      <Route index element={<Index />} />
      <Route path="sessions" element={<ClassesList />} />
      <Route path="sessions/new" element={<ClassAdd />} />
      <Route path="sessions/edit/:id" element={<ClassEdit />} />
    </Routes>
  );
}
