
import useAuth from './useAuth';

import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from './useAxiosSecure';

const useRole = () => {
    const { user, loading } = useAuth()
    // const [role, setRole] = useState(null)
    // const [loaderForRole, setLoaderForRole] = useState(true)

    const axiosSecure = useAxiosSecure()
    const { data: role, isLoading: loaderForRole, } = useQuery({
        queryKey: ['role', user?.email],
        enabled: !loading && !!user?.email,
        queryFn: async () => {
            const { data } = await axiosSecure(`/user/role/${user?.email}`)
            return data
        }

    })
    // console.log(role, loaderForRole);

    // useEffect(() => {
    //     const getUserRoleFetch = async () => {
    //         const result = await axiosSecure(`${import.meta.env.VITE_API_URL}/user/role/${user?.email}`)
    //         // console.log(result);

    //         setRole(result?.data?.role)
    //         setLoaderForRole(false)
    //     }
    //     getUserRoleFetch()

    // }, [axiosSecure, user])
    console.log(role?.role);


    return [role?.role, loaderForRole]
};

export default useRole; 