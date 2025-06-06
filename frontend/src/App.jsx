import React from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "./Components/Layout";
import Home from "./Pages/Home";
import Register from "./Pages/Register.jsx";
import Signin from "./Pages/Signin.jsx";
import ProblemInput from "./Pages/ProblemInput.jsx";
import { AuthProvider } from "../Authentication/Authentication";
import Problems from "./Pages/Problems.jsx";
import SystemDesignSolvePage from "./Pages/SystemdesignSolvePage.jsx";
import ProblemSolving from "./Pages/ProblemSolving.jsx";

function App() {
  return (
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="register" element={<Register />} />
          <Route path="Signin" element={<Signin />} />
          <Route path="problemInput" element={<ProblemInput />} />
          <Route path="problems" element={<Problems/>}/>
          <Route path="problemSolve/:problemId" element={<ProblemSolving />} />
        </Route>
      </Routes>
  );
}

export default App;
