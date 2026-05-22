"use client";

import { useEffect, useState } from "react";

export type CurrentUser = {
    role: "owner" | "manager" | "staff";
    store_id?: number | string;
    store_name?: string;
    owner_name?: string;
    branch_id?: number | string;
    branch_name?: string;
    manager_id?: number | string;
    manager_name?: string;
    staff_id?: number | string;
    staff_name?: string;
    permissions?: Record<string, boolean | string>;
};

function getToken() {
    if (typeof window === "undefined") return "";
    return sessionStorage.getItem("token") || localStorage.getItem("token") || "";
}

function getSessionUser(): CurrentUser | null {
    if (typeof window === "undefined") return null;

    const role = sessionStorage.getItem("role") as CurrentUser["role"] | null;

    if (!role) return null;

    let permissions: Record<string, boolean | string> = {};

    try {
        permissions = JSON.parse(sessionStorage.getItem("permissions") || "{}");
    } catch {
        permissions = {};
    }

    return {
        role,
        store_id: sessionStorage.getItem("store_id") || "",
        store_name: sessionStorage.getItem("store_name") || "",
        owner_name: sessionStorage.getItem("owner_name") || "",
        branch_id: sessionStorage.getItem("branch_id") || "",
        branch_name: sessionStorage.getItem("branch_name") || "",
        manager_id: sessionStorage.getItem("manager_id") || "",
        manager_name: sessionStorage.getItem("manager_name") || "",
        staff_id: sessionStorage.getItem("staff_id") || "",
        staff_name: sessionStorage.getItem("staff_name") || "",
        permissions,
    };
}

function syncUserToSession(user: CurrentUser) {
    if (typeof window === "undefined") return;

    sessionStorage.setItem("role", user.role || "");

    if (user.store_id) sessionStorage.setItem("store_id", String(user.store_id));
    if (user.store_name) sessionStorage.setItem("store_name", user.store_name);
    if (user.owner_name) sessionStorage.setItem("owner_name", user.owner_name);

    if (user.branch_id) sessionStorage.setItem("branch_id", String(user.branch_id));
    if (user.branch_name) sessionStorage.setItem("branch_name", user.branch_name);

    if (user.manager_id) sessionStorage.setItem("manager_id", String(user.manager_id));
    if (user.manager_name) sessionStorage.setItem("manager_name", user.manager_name);

    if (user.staff_id) sessionStorage.setItem("staff_id", String(user.staff_id));
    if (user.staff_name) sessionStorage.setItem("staff_name", user.staff_name);

    sessionStorage.setItem("permissions", JSON.stringify(user.permissions || {}));
}

export function useCurrentUser() {
    const [user, setUser] = useState<CurrentUser | null>(() => getSessionUser());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadUser = async () => {
            const cachedUser = getSessionUser();

            if (cachedUser) {
                setUser(cachedUser);
                setLoading(false);
            } else {
                setLoading(true);
            }

            const token = getToken();

            if (!token) {
                setUser(null);
                setError("Missing token");
                setLoading(false);
                return;
            }

            try {
                const res = await fetch("/api/current-user", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await res.json();

                if (!res.ok) {
                    setUser(null);
                    setError(data.error || "Failed to load user");
                    setLoading(false);
                    return;
                }

                syncUserToSession(data);
                setUser(data);
                setError("");
            } catch (err) {
                console.error("current-user fetch failed:", err);

                if (!cachedUser) {
                    setUser(null);
                    setError("Failed to load user");
                }
            } finally {
                setLoading(false);
            }
        };

        loadUser();

        window.addEventListener("stocknbook-permissions-updated", loadUser);
        window.addEventListener("focus", loadUser);

        return () => {
            window.removeEventListener("stocknbook-permissions-updated", loadUser);
            window.removeEventListener("focus", loadUser);
        };
    }, []);

    return { user, loading, error };
}