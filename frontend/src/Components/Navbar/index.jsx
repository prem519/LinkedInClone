import React from 'react'
import Styles from "./styles.module.css"
import { useRouter } from 'next/router'
import { useDispatch, useSelector } from 'react-redux';
import { reset } from '@/config/redux/reducer/authReducer';


export default function NavBarComponent() {
const router = useRouter();
const authState = useSelector((state)=>state.auth)
const dispatch = useDispatch();
 
  return (
    <div className={Styles.container}>
    <nav className={Styles.navBar}>

<h1 style={{cursor:"pointer"}} onClick={()=>{
  router.push("/")
}}>Pro Connect</h1>

<div className={Styles.navBarOptionContainer}>

{authState.profileFetched && <div>
  <div style={{display:"flex", gap:"1.2rem"}}>
  <p onClick={()=>{
    router.push("/profile")
  }} style={{fontWeight:"bold", cursor:"pointer"}}>profile</p>
   
    <p onClick={()=>{
      localStorage.removeItem("token");
      router.push("/login");
      dispatch(reset())
    }} style={{fontWeight:"bold", cursor:"pointer"}}>Logout</p>
</div>
  </div>}

{!authState.profileFetched && <div onClick={()=>{
  router.push("/login")
}} className={Styles.buttonJoin}>
  <p>Be a Part</p>
</div>}



</div>

    </nav>
    </div>
  )

}
