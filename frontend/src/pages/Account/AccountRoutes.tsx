import { Routes, Route } from 'react-router-dom';
import Account from './Account.tsx';
import FinishRegistration from './FinishRegistration.tsx';


export default function AccountRoutes() {
    return (
        <Routes>
            <Route index element={<Account />} />
            <Route path="finish-registration" element={<FinishRegistration />} />
        </Routes>
    );
}