import { Routes, Route } from 'react-router-dom';
import GroupRegisteration from './GroupRegistration.tsx';
import GroupDetail from './GroupDetail.tsx';


export default function GroupRoutes() {
    return (
        <Routes>
            <Route index element={< GroupRegisteration />} />
            <Route path=":id" element={<GroupDetail />} />
        </Routes>
    );
}