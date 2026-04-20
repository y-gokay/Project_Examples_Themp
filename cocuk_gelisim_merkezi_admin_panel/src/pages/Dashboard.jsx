import { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { isAuthenticated, isSuperAdmin } from '../services/auth';
import Layout from '../components/Layout';

export default function Dashboard() {
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/');
            return;
        }
    }, [navigate]);

    const isSuper = isSuperAdmin();

    return (
        <Layout isSuperAdmin={isSuper}>
            <Outlet />
        </Layout>
    );
}
