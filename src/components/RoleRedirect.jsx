import { Navigate } from "react-router-dom";
import { useMyExtension } from "@/hooks/useMyExtension";

// Sends the user to the console matching their phone_role.
export default function RoleRedirect() {
  const { user, loading } = useMyExtension();
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900" />
      </div>
    );
  }
  const role = user?.phone_role || user?.data?.phone_role || (user?.role === "admin" ? "admin" : "employee");
  const to = role === "receptionist" ? "/receptionist" : role === "admin" ? "/admin" : "/keypad";
  return <Navigate to={to} replace />;
}