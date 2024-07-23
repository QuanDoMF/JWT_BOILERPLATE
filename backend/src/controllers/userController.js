// Author: TrungQuanDev: https://youtube.com/@trungquandev
import { StatusCodes } from 'http-status-codes'
import ms from 'ms'
import { jwtProvider } from '~/providers/JwtProvider'
import { ACCESS_TOKEN_SECRET_SIGNATURE, REFRESH_TOKEN_SECRET_SIGNATURE } from '~/providers/JwtProvider'
const MOCK_DATABASE = {
  USER: {
    ID: 'trungquandev-sample-id-12345678',
    EMAIL: 'trungquandev.official@gmail.com',
    PASSWORD: 'trungquandev@123'
  }
}

const login = async (req, res) => {
  try {
    if (req.body.email !== MOCK_DATABASE.USER.EMAIL || req.body.password !== MOCK_DATABASE.USER.PASSWORD) {
      res.status(StatusCodes.FORBIDDEN).json({ message: 'Your email or password is incorrect!' })
      return
    }
    // Trường hợp email và password đúng thì tạo token và trả về cho client
    // Tạo thông tin payload của token để đính kèm vào token: id email...
    const userInfo = {
    
      id: MOCK_DATABASE.USER.ID,
      EMAIL: MOCK_DATABASE.USER.EMAIL,
    }
    // tạo ra 2 token: access token và refresh token

    const accessToken = await jwtProvider.generateToken(
        userInfo, 
        ACCESS_TOKEN_SECRET_SIGNATURE,
        5
        // '1h',
        )
    const refreshToken = await jwtProvider.generateToken(
        userInfo, 
        REFRESH_TOKEN_SECRET_SIGNATURE,
        '14 days',
        // 15,
        )
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true, 
      sameSite: 'none',
      maxAge: ms('14 days')
    })
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true, 
      sameSite: 'none',
      maxAge: ms('14 days')
    })

    // Trả về cho client thông tin token cũng như trả về Token để client lưu trữ 
    res.status(StatusCodes.OK).json({
      ...userInfo,
      accessToken,
      refreshToken,
     })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error)
  }
}

const logout = async (req, res) => {
  try {
    // Xóa cookies - làm ngược lại với việc gán cookies ở login
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')
    res.status(StatusCodes.OK).json({ message: 'Logout API success!' })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error)
  }
}

const refreshToken = async (req, res) => {
  try {
    // cách 1: lấy token từ cookies đính kèm request
    const refreshTokenFromCookie = req.cookies?.refreshToken

    // cách 2: lấy từ localStorage
    const refreshTokenFromBody = req.body?.refreshToken

    // verify / giải mã xem refresh token có hợp lệ không

    const refreshTokenDecoded = await jwtProvider.verifyToken(
      // refreshTokenFromCookie,
      refreshTokenFromBody, 
      REFRESH_TOKEN_SECRET_SIGNATURE
    )
    // tạo acccess token mới 


    const userInfo = {
      id: refreshTokenDecoded.id,
      email: refreshTokenDecoded.EMAIL
    }
    const accessToken = await jwtProvider.generateToken(
      userInfo, 
      ACCESS_TOKEN_SECRET_SIGNATURE,
      5
      // '1h',
      )
    // res trả lại cookies access token mới
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true, 
      sameSite: 'none',
      maxAge: ms('14 days')
    })
    
    res.status(StatusCodes.OK).json({ accessToken })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Refresh Token API failed!" })
  }
}

export const userController = {
  login,
  logout,
  refreshToken
}
