import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export function useAuth(options?: { redirectTo?: string; requireAdmin?: boolean }) {
  const { user, isAuthenticated, setUser, setIsLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(options?.redirectTo || "/login");
      return;
    }

    if (
      options?.requireAdmin &&
      user &&
      !["OWNER", "ADMIN", "SUPER_ADMIN"].includes(user.role)
    ) {
      router.push("/chat");
    }
  }, [isAuthenticated, user, router, options]);

  async function refreshUser() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }

  return { user, isAuthenticated, refreshUser };
}
