import LoadingSpinner from '../components/Shared/Spinner/LoadingSpinner'
import useAuth from '../hooks/useAuth'
import { Navigate, useLocation } from 'react-router'

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth()
    const location = useLocation()

    if (loading) return <LoadingSpinner />
    if (user) return children
    return <Navigate to='/login' state={{ from: location }} replace='true' />
}

export default PrivateRoute
