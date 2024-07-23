

import authorizeAxiosInstance from "~/utils/authorizedAxios";
import { API_ROOT } from "~/utils/constants";

export const handleLogoutAPI = async () => {
    // Trường hợp 1 dùng localStorage để lưu trữ token - xóa thông tin trong localStorage
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('userInfo')

    // Trường hợp số 2 dùng Http only Cookies để lưu trữ token - gọi API remove Cookies
    await authorizeAxiosInstance.delete(`${API_ROOT}/v1/users/logout`)
}   

export const refreshTokenAPI = async (refreshToken) =>{
    return await authorizeAxiosInstance.put(`${API_ROOT}/v1/users/refresh_token`, {refreshToken})   
}









