import { Routes, Route, Navigate } from 'react-router-dom'
import Login from '~/pages/Login'
import Dashboard from '~/pages/Dashboard'
import { Outlet } from 'react-router-dom'

const ProtectedRoutes = () => {
  const user = JSON.parse(localStorage.getItem('userInfo'))
  // console.log(user)
  if(!user) return <Navigate to="/login" replace={true} />
  return <Outlet />
}

const UnauthorizedRoutes = () => {
  const user = JSON.parse(localStorage.getItem('userInfo'))
  // console.log(user)
  if (user) return <Navigate to="/dashboard" replace={true} />
  return <Outlet />
}
  

function App() {


  return (
    <Routes>
      <Route path='/' element={
        <Navigate to="/login" replace={true} />
      } />
      
      <Route element={<UnauthorizedRoutes />}>
      {/* <Outlet /> của react router dom truy cập các child route trong này */}
        <Route path='/login' element={<Login />} />
      </Route>

      <Route element={<ProtectedRoutes />}>
      {/* <Outlet /> của react router dom truy cập các child route trong này */}
        <Route path='/dashboard' element={<Dashboard />} />
      </Route>

    </Routes>
  )
}

export default App
