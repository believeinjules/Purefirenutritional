import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { isAdminUser } from "@/lib/adminAllowlist";

type RequireAdminProps = {
  children: ReactNode;
};

/**
 * Gate Admin pages: require Firebase Auth + allowlisted verified email.
 * Does not render admin children until authorized (avoids flashing dashboard HTML).
 */
export default function RequireAdmin({ children }: RequireAdminProps) {
  const { user, loading } = useAuth();
  const [location, setLocation] = useLocation();

  const authorized = isAdminUser(user);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      const next = encodeURIComponent(location || "/admin");
      setLocation(`/login?next=${next}`);
      return;
    }

    if (!authorized) {
      // Signed in but not allowlisted / not verified — do not show Admin UI
      setLocation("/");
    }
  }, [user, loading, authorized, location, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Checking admin access…</p>
      </div>
    );
  }

  if (!user || !authorized) {
    // Redirect in flight — render nothing so Admin markup is not in the DOM
    return null;
  }

  return <>{children}</>;
}
