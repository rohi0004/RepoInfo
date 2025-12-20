"use client";
import React, { useEffect, useState } from "react";
import ProfileMenu from "./ProfileMenu";

export default function ClientProfileMenuWrapper() {
  // Replace with real user fetching logic (e.g., from /api/auth/me)
  const [user, setUser] = useState<{ name: string; email: string }>({ name: "User", email: "user@example.com" });

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "same-origin" })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && data.user) setUser({ name: data.user.name, email: data.user.email });
      });
  }, []);

  function handleLogout() {
    fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" })
      .then(() => {
        window.location.href = "/login";
      });
  }

  return <ProfileMenu user={user} onLogout={handleLogout} />;
}
