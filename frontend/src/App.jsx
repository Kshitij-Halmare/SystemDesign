import React from "react"
import { Route,Routes } from "react-router-dom"
import Layout from "./Components/Layout"
import Home from "./Pages/Home"
function App() {

  return (
    <>
    <Routes>
      <Route path="/" element={<Layout/>}>
        <Route index element={<Home/>}></Route>

      </Route>
    </Routes>
    </>
  )
}

export default App
