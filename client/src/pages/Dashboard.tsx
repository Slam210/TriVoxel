import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import DashSidebar from "../components/DashSidebar";
import DashProfile from "../components/DashProfile";
import DashPosts from "../components/DashPosts";
import DashUsers from "../components/DashUsers";
import DashComments from "../components/DashComments";

export default function Dashboard(): JSX.Element {
  const location = useLocation();
  const [tab, setTab] = useState<string | null>("");

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromURL = urlParams.get("tab");
    if (tabFromURL) {
      setTab(tabFromURL);
    }
  }, [location.search]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="md:w-56">
        <DashSidebar />
      </div>
      {/* Right Side */}
      {tab === "profile" && <DashProfile />}
      {tab == "posts" && <DashPosts />}
      {tab == "users" && <DashUsers />}
      {tab == "comments" && <DashComments />}
    </div>
  );
}
