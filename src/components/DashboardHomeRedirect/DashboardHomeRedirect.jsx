import { Navigate } from 'react-router';

import LoadingSpinner from '../Shared/Spinner/LoadingSpinner';
import useRole from '../../hooks/useRole';


const DashboardHomeRedirect = () => {
    const [role, loading] = useRole();

    if (loading) return <LoadingSpinner />;

    if (role === 'admin') return <Navigate to="/dashboard/manage-applications" replace />;
    if (role === 'agent') return <Navigate to="/dashboard/assigned-customers" replace />;
    if (role === 'customer') return <Navigate to="/dashboard/my-policies" replace />;

    return <Navigate to="/" replace />;
};

export default DashboardHomeRedirect;
