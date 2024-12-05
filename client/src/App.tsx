import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Header from "./components/Header";
import FooterCom from "./components/Footer";
import Resumes from "./pages/Resumes";
import Blogs from "./pages/Blogs";
import Tutorials from "./pages/Tutorials";
import PrivateRoute from "./components/PrivateRoute";
import SignInSignUp from "./pages/SignInSignUpProcess/SignInSignUp";
import CreatePost from "./pages/CreatePost";
import RolePrivateRoute from "./components/RolePrivateRoute";
import UpdatePost from "./pages/UpdatePost";
import PostPage from "./pages/PostPage";
import ScrollToTop from "./components/ScrollToTop";
import Search from "./pages/Search";
import CreateResume from "./pages/CreateResume";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/test" />
        <Route path="/about" element={<About />} />
        <Route path="/start" element={<SignInSignUp isSignInBool={true} />} />
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/post/:postSlug" element={<PostPage />} />
          <Route path="/search" element={<Search />} />
          <Route path="/resumes" element={<Resumes />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/tutorials" element={<Tutorials />} />
          <Route element={<RolePrivateRoute />}>
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/create-resume" element={<CreateResume />} />
            <Route path="/update-post/:postId" element={<UpdatePost />} />
          </Route>
        </Route>
      </Routes>
      <FooterCom />
    </BrowserRouter>
  );
}
