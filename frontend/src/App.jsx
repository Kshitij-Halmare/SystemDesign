import React from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "./Components/Layout";
import Home from "./Pages/Home";
import Register from "./Components/Register";
import Signin from "./Components/Signin";
import ProblemInput from "./Components/ProblemInput";
import { AuthProvider } from "../Authentication/Authentication";

function App() {
  return (
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="register" element={<Register />} />
          <Route path="Signin" element={<Signin />} />
          <Route path="problemInput" element={<ProblemInput />} />
        </Route>
      </Routes>
  );
}

export default App;
