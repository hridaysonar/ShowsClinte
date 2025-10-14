import { axiosSecure } from "./useAxiosSecure";

// user or update user data in database
export const saveUserInDb = async (user) => {
    const { data } = await axiosSecure.post(`${import.meta.env.VITE_API_URL}/user`, user)
    console.log(data);

}  