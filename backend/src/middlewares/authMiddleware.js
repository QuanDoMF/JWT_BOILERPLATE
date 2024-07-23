import { StatusCodes } from "http-status-codes";
import { jwtProvider } from '~/providers/JwtProvider';
import { ACCESS_TOKEN_SECRET_SIGNATURE } from '~/providers/JwtProvider';

const isAuthorized = async (req, res, next) => { 
    // cách 1: lấy access token từ nằm trong request cookies - withCredentials trong file authorizedAxios.js
    // const accessTokenFromCookie = req.cookies?.accessToken; // lấy access token từ cookies
    // console.log(accessTokenFromCookie);
    // console.log("---");

    // if (!accessTokenFromCookie) {
    //     res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized (Token not found)' });
    //     return;
    // }

    // cách 2: lấy access token từ localStorage
    const accessTokenFromHeader = req.headers.authorization?.split(' ')[1]; // lấy access token từ header

    if (!accessTokenFromHeader) {
        res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized (Token not found)' });
        return;
    }

    // thực hiện xác thực token
    try {
        const accessTokenDecoded = await jwtProvider.verifyToken(
            accessTokenFromHeader, // theo cách 2
            ACCESS_TOKEN_SECRET_SIGNATURE);
        req.jwtDecoded = accessTokenDecoded; // lưu giá trị token đã giải mã vào biến req.jwtDecoded
        next();
    } catch (error) {
        console.log("error: ", error);
        // Trường hợp lỗi 01: nếu accessToken hết hạn thì trả về mã lỗi GONE-410 cho FE để biết gọi refreshToken
        if (error.message?.includes('jwt expired')) {
            res.status(StatusCodes.GONE).json({ message: 'Token expired! Need to refresh token' });
            return;
        }
        // Trường hợp lỗi 02: nếu accessToken không hợp lệ thì trả về mã lỗi UNAUTHORIZED-401 cho FE để xử lý
        res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized (please login)' });
    }
};
export const authMiddleware = {
    isAuthorized
};
