import { Navigate, useLocation } from 'react-router'
import useRole from '../hooks/useRole'
import LoadingSpinner from '../components/Shared/Spinner/LoadingSpinner'



const AdminRoute = ({ children }) => {
    const [role, isRoleLoading] = useRole()
    const location = useLocation()
    console.log(location)
    console.log('Admin route')
    if (isRoleLoading) return <LoadingSpinner />
    if (role !== 'admin') {
        return <Navigate to="/forbidden" replace />
    }

    if (role === 'admin') return children
    return <Navigate to='/' replace='true' />
}

export default AdminRoute