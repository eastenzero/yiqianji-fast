import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import Record from './pages/Record';
import Report from './pages/Report';
import Profile from './pages/Profile';
import Summary from './pages/Summary';
import DoctorView from './pages/DoctorView';
import Settings from './pages/Settings';
import { useAppStore } from './stores/app-store';

function ProtectedShell() {
  const onboarded = useAppStore((s) => s.onboarded);
  if (!onboarded) return <Navigate to="/onboarding" replace />;
  return <Layout />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 欢迎引导（独立全屏，无 Layout） */}
        <Route path="/onboarding" element={<Onboarding />} />

        {/* 医生端分享视图（独立全屏，无底部导航） */}
        <Route path="/doctor-view/:summaryId" element={<DoctorView />} />

        {/* 主应用（带底部导航） */}
        <Route path="/" element={<ProtectedShell />}>
          <Route index element={<Home />} />
          <Route path="record" element={<Record />} />
          <Route path="report" element={<Report />} />
          <Route path="profile" element={<Profile />} />
          <Route path="summary" element={<Summary />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
