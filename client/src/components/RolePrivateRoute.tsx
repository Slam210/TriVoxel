import { useSelector } from "react-redux";
import { Outlet, Navigate } from "react-router-dom";

export default function RolePrivateRoute() {
  const { currentUser } = useSelector((state: any) => state.user);
  return currentUser && currentUser.roleid === "admin" ? (
    <Outlet />
  ) : (
    <Navigate to="/" />
  );
}
