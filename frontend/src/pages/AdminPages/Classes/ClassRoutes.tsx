import { Routes, Route } from "react-router-dom";
import ClassesList from "./ClassesList";
import ClassAdd from "./ClassAdd";
import ClassEdit from "./ClassEdit";

export default function AdminClassRoutes() {
  return (
    <Routes>
      <Route index element={<ClassesList />} />
      <Route path="new" element={<ClassAdd />} />
      <Route path="edit/:id" element={<ClassEdit />} />
    </Routes>
  );
}
