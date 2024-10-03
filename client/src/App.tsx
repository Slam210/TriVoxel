import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Header from "./components/Header";
import FooterCom from "./components/Footer";
import Resumes from "./pages/Resumes";
import Blogs from "./pages/Blogs";
import Tutorials from "./pages/Tutorials";

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/sign-in" element={<Signin />} />
        <Route path="/sign-up" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/resumes" element={<Resumes />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/tutorials" element={<Tutorials />} />
      </Routes>
      <FooterCom />
    </BrowserRouter>
  );
}
