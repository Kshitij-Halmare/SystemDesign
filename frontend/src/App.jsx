import React from "react"
import { Route,Routes } from "react-router-dom"
import Layout from "./Components/Layout"
import Home from "./Pages/Home"
import Register from "./Components/Register"
function App() {

  return (
    <>
    <Routes>
      <Route path="/" element={<Layout/>}>
        <Route index element={<Home/>}></Route>
        <Route path="register" element={<Register/>}></Route>
      </Route>
    </Routes>
    </>
  )
}

export default App
