import { Button, Navbar, Dropdown, Avatar } from "flowbite-react";
import { Link, useLocation } from "react-router-dom";
import { AiOutlineSearch } from "react-icons/ai";
import { FaMoon, FaSun } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { toggleTheme } from "../redux/theme/themeSlice";
import { signoutSuccess } from "../redux/user/userSlice";

export default function Header() {
  const path = useLocation().pathname;
  const { currentUser } = useSelector((state: any) => state.user);
  const dispatch = useDispatch();
  const { theme } = useSelector((state: any) => state.theme);

  const handleSignout = async () => {
    try {
      const res = await fetch("/api/user/signout", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
      } else {
        dispatch(signoutSuccess());
      }
    } catch (error: any) {
      console.log(error.message);
    }
  };

  return (
    <Navbar className="border-b-2 bg-white dark:bg-black border-gray-300 dark:border-gray-500">
      <Link
        to="/"
        className="self-center whitespace-nowrap text-md sm:text-lg md:text-xl font-semibold px-2 py-1 rounded-lg bg-gradient-to-tr from-red-400 via-blue-400 to-green-400 text-white"
      >
        TriVoxel
      </Link>
      <form className="relative bg-white dark:bg-gray-900">
        <input
          type="text"
          placeholder="Search"
          className="hidden lg:inline bg-white dark:bg-gray-900 rounded-lg"
        />
        <span className="hidden lg:inline search-icon absolute top-3 right-2">
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0 1 14 0z"></path>
          </svg>
        </span>
      </form>
      <div>
        <button className="w-12 h-10 lg:hidden rounded-full border-2 border-gray-700">
          <AiOutlineSearch className="mx-auto" />
        </button>
      </div>
      <div className="flex gap-2 md:gap-4 md:order-2">
        <Button
          className="w-12 h-10 hidden sm:inline"
          color="gray"
          pill
          onClick={() => dispatch(toggleTheme())}
        >
          {theme === "light" ? <FaSun /> : <FaMoon />}
        </Button>
        {currentUser ? (
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <Avatar alt="user" img={currentUser.profile_picture} rounded />
            }
          >
            <Dropdown.Header>
              <span className="block text-sm">@{currentUser.username}</span>
              <span className="block text-md font-medium truncate">
                {currentUser.email}
              </span>
            </Dropdown.Header>
            <Link to={"/dashboard?tab=profile"}>
              <Dropdown.Item>Profile</Dropdown.Item>
            </Link>
            <Dropdown.Divider />
            <Dropdown.Item
              onClick={() => {
                handleSignout();
              }}
            >
              Sign Out
            </Dropdown.Item>
          </Dropdown>
        ) : (
          <Link to="/start">
            <div className="bg-gradient-to-tr from-red-400 via-blue-400 to-green-400 bg-transparent p-0.5 rounded-lg">
              <button className="w-full bg-white dark:bg-black hover:bg-gradient-to-tr hover:from-red-400 hover:via-blue-400 hover:to-green-400 px-4 py-2 rounded-lg">
                Get Started
              </button>
            </div>
          </Link>
        )}
        <Navbar.Toggle />
      </div>
      <Navbar.Collapse>
        <Navbar.Link active={path === "/tutorials"} as={Link} to="/tutorials">
          <span
            className={`${
              path === "/tutorials" ? "text-black " : "text-gray-500"
            } hover:text-black dark:${
              path === "/tutorials" ? "text-white" : "text-gray-500"
            }  dark:hover:text-white`}
          >
            Tutorials
          </span>
        </Navbar.Link>

        <Navbar.Link active={path === "/blogs"} as={Link} to="/blogs">
          <span
            className={`${
              path === "/blogs" ? "text-black " : "text-gray-500"
            } hover:text-black dark:${
              path === "/blogs" ? "text-white" : "text-gray-500"
            }  dark:hover:text-white`}
          >
            Blogs
          </span>
        </Navbar.Link>
        <Navbar.Link active={path === "/resumes"} as={Link} to="/resumes">
          <span
            className={`${
              path === "/resumes" ? "text-black " : "text-gray-500"
            } hover:text-black dark:${
              path === "/resumes" ? "text-white" : "text-gray-500"
            }  dark:hover:text-white`}
          >
            Resumes
          </span>
        </Navbar.Link>
      </Navbar.Collapse>
    </Navbar>
  );
}
