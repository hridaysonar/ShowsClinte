
import { Navigate, useLocation } from 'react-router'
import useRole from '../hooks/useRole'
import LoadingSpinner from '../components/Shared/Spinner/LoadingSpinner'



const AdminAgentRoute = ({ children }) => {
    const [role, isRoleLoading] = useRole()
    const location = useLocation()
    // console.log(location)
    // console.log('Admin route')
    if (isRoleLoading) return <LoadingSpinner />
    if (role === 'admin' || role === 'agent') return children
    return <Navigate to='/' replace='true' />
}

export default AdminAgentRoute