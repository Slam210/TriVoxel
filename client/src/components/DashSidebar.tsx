import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Sidebar } from "flowbite-react";
import {
  HiArrowSmRight,
  HiDocumentText,
  HiOutlineUserGroup,
  HiUser,
} from "react-icons/hi";
import { signoutSuccess } from "../redux/user/userSlice";
import { useDispatch, useSelector } from "react-redux";

interface UserState {
  user: {
    currentUser: {
      roleid: string;
    };
  };
}

export default function DashSidebar() {
  const location = useLocation();
  const [tab, setTab] = useState<string | null>("");
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state: UserState) => state.user);
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromURL = urlParams.get("tab");
    if (tabFromURL) {
      setTab(tabFromURL);
    }
  }, [location.search]);

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
    <Sidebar className="w-full md:w-56">
      <Sidebar.Items>
        <Sidebar.ItemGroup>
          <Sidebar.Item
            as={Link}
            to="/dashboard?tab=profile"
            active={tab === "profile"}
            icon={HiUser}
            label={
              currentUser.roleid.charAt(0).toUpperCase() +
              currentUser.roleid.slice(1)
            }
            labelColor="dark"
            className="cursor-pointer"
          >
            Profile
          </Sidebar.Item>

          <Sidebar.Item
            as={Link}
            to="/dashboard?tab=posts"
            active={tab === "posts"}
            icon={HiDocumentText}
            labelColor="dark"
            className="cursor-pointer"
          >
            Posts
          </Sidebar.Item>
          <Sidebar.Item
            as={Link}
            to="/dashboard?tab=users"
            active={tab === "users"}
            icon={HiOutlineUserGroup}
            labelColor="dark"
            className="cursor-pointer"
          >
            Users
          </Sidebar.Item>

          <Sidebar.Item
            icon={HiArrowSmRight}
            className="cursor-pointer"
            onClick={() => {
              handleSignout();
            }}
          >
            Sign Out
          </Sidebar.Item>
        </Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
  );
}
