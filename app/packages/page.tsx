"use client";

import RoleSidebar from "@/components/sidebar/RoleSidebar";
import OwnerPackages from "@/components/packages/OwnerPackages";
import ManagerPackages from "@/components/packages/ManagerPackages";
import StaffPackages from "@/components/packages/StaffPackages";
import { useEffect, useState } from "react";

export default function PackagesPage() {
    const [role, setRole] = useState("");
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const savedRole = sessionStorage.getItem("role") || "owner";
        setRole(savedRole);
        setReady(true);
    }, []);

    if (!ready) return null;

    return (
        <div
            className="flex min-h-screen font-sans text-[#1A1220]"
            style={{ backgroundColor: "#FDFAF4" }}
        >
            <RoleSidebar />

            <main className="flex-1 overflow-y-auto">
                {role === "owner" && <OwnerPackages />}
                {role === "manager" && <ManagerPackages />}
                {role === "staff" && <StaffPackages />}
            </main>
        </div>
    );
}

