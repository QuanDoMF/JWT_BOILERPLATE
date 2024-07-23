import JWT from 'jsonwebtoken';
// tạo token
// userInfo: thông tin user cần lưu trữ trong token
// sercetPrivateKey: chuỗi bí mật dùng để tạo token
// tokenLife: thời gian sống của token


export const ACCESS_TOKEN_SECRET_SIGNATURE = 'WJ8cR06y82mBKn2zfXc4yCWqbsGVpSq37CV7J5CD8gjxTYvYuv'
export const REFRESH_TOKEN_SECRET_SIGNATURE = 'MIn9ym8i1jjefy2lgoi0tp12H84CoME7vWc1dQpMjfYKiQxauz'

const generateToken = async (userInfo, secretPrivateKey, tokenLife) => {
    try {
        return JWT.sign(userInfo, secretPrivateKey, { 
            algorithm: 'HS256',
            expiresIn: tokenLife
        })
    } catch(error) {
        throw new Error(error)
    }   
}   

// xác thực token
const verifyToken = async (token, secretPrivateKey) => {
    try{
    // hàm verify của thư viện JWT sẽ kiểm tra tính hợp lệ của token và giải mã nó
    return JWT.verify(token, secretPrivateKey)
    }catch(error) {
        throw new Error(error)
    }   
}   

export const jwtProvider = {
    generateToken,
    verifyToken
}