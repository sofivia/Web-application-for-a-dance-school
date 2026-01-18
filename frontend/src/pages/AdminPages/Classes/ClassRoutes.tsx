import { Routes, Route } from "react-router-dom";
import ClassesList from "./sessions/ClassesList.tsx";
import ClassAdd from "./sessions/ClassAdd.tsx";
import ClassEdit from "./sessions/ClassEdit.tsx";
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
