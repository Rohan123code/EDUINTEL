import React from 'react'
import { Outlet } from "react-router"
import NavBar from '../component/NavBar'

const Root = () => {
  return (
    <div className='w-full'>
        <NavBar/>
        <Outlet/>
    </div>
  )
}

export default Root