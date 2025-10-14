import { Outlet, useNavigation } from 'react-router'
import Navbar from '../components/Shared/Navbar/Navbar'

import useAuth from '../hooks/useAuth';
import LoadingSpinner from '../components/Shared/Spinner/LoadingSpinner';
import Footer from '../components/Home/Footer';
const MainLayout = () => {
    const { loading: authLoading } = useAuth();
    const navigation = useNavigation();
    return (
        <div className='bg-white'>
            <Navbar />
            <div className=' min-h-screen'>

                {authLoading || navigation.state === 'loading' ? (
                    <LoadingSpinner></LoadingSpinner>
                ) : (
                    <Outlet />
                )}

            </div>
            <Footer></Footer>
        </div>
    )
}

export default MainLayout
