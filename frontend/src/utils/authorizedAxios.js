import axios from 'axios';
import { toast } from 'react-toastify'
import { handleLogoutAPI, refreshTokenAPI } from '~/apis';

// khởi tạo đối tượng axios

let authorizeAxiosInstance = axios.create()

// thời gian chờ tối đa của request
authorizeAxiosInstance.defaults.timeout = 60 * 10 * 1000; // 10 phút

authorizeAxiosInstance.defaults.withCredentials = true; // đính kèm và gửi cookie cùng request


// Add a request interceptor
authorizeAxiosInstance.interceptors.request.use((config) => {
    // Do something before request is sent
    const accessToken = localStorage.getItem('accessToken')
    if (accessToken) {
        // bearer là định nghĩa loại token dành cho xác thực và ủy quyền
        config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
}, (error) => {
    // Do something with request error
    return Promise.reject(error)
})

// mục đích tạo promise này đẻ khi nhận yêu cầu refreshToken đầu tiên thì hold lại việc gọi API refresh_token
// cho đến khi nhận được kết quả từ API refresh_token thì mới gọi tiếp
let refreshTokenPromise = null

// Add a response interceptor
authorizeAxiosInstance.interceptors.response.use((response) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response
}, (error) => {
    // Any status codes that falls outside the range of 200-299 cause this function to trigger
    // Do something with response error

    // xử lý refreshToken tự động khi accessToken hết hạn
    // Nếu như nhận mã  401 từ BE, gọi API logout luôn
    if (error.response?.status === 401) {
        handleLogoutAPI().then(() => {
            location.href = '/login'
        })
    }
    // nếu mã lỗi trả về là 410 thì call api refresh token để làm mới lại accessToken
    const orginalRequest = error.config
    console.log("orginalRequest", orginalRequest)
    if (error.response?.status === 410 && !orginalRequest._retry) {

        if (!refreshTokenPromise) {

            const refreshToken = localStorage.getItem('refreshToken')
            refreshTokenPromise = refreshTokenAPI(refreshToken)
                .then((res) => {
                    const { accessToken } = res.data
                    localStorage.setItem('accessToken', accessToken)
                    authorizeAxiosInstance.defaults.headers.Authorization = `Bearer ${accessToken}`

                })
                .catch((_error) => {
                    //Nếu nhận bất kỳ lỗi nào từ việc gọi API refresh token thì logout luôn
                    handleLogoutAPI().then(() => {
                        location.href = '/login'
                    })
                    return Promise.reject(_error)
                })
                .finally(() => {
                    refreshTokenPromise = null
                })
        }


        return refreshTokenPromise.then(() => {
            // Bước cuối: return lại axios instance của chúng ta kết hợp cái originalRequest để gọi lại request ban đầu
            return authorizeAxiosInstance(orginalRequest)
        })
    }



    if (error.response?.status !== 410) {
        toast.error(error.response?.data?.message || error?.message)
    }
    return Promise.reject(error)
})
export default authorizeAxiosInstance  // export để sử dụng ở các file khác