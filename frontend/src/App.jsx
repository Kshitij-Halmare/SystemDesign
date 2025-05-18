import React from "react"
import { Route,Routes } from "react-router-dom"
import Layout from "./Components/Layout"
import Home from "./Pages/Home"
import Register from "./Components/Register"
import Signin from "./Components/Signin"
function App() {

  return (
    <>
    <Routes>
      <Route path="/" element={<Layout/>}>
        <Route index element={<Home/>}></Route>
        <Route path="register" element={<Register/>}></Route>
        <Route path="Signin" element={<Signin/>}/>
      </Route>
    </Routes>
    </>
  )
}

export default App
