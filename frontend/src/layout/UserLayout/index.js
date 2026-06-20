import React from 'react'
import NavBarComponent from '@/components/NavBar'
function UserLayout({children}) {
  return (
    <div>
  <NavBarComponent/>
        {children}
       
        </div>
  )
}

export default UserLayout