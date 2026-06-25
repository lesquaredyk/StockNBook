"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import PlatformAdminHeader from "@/components/platform-admin/platformAdminHeader";
import PlatformAdminSidebar from "@/components/platform-admin/platformAdminSidebar";

export default function PlatformAdminLayout({
                                                children,
                                            }: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [checkedRole, setCheckedRole] = useState(false);

    useEffect(() => {
        const role =
            sessionStorage.getItem("role") ||
            localStorage.getItem("role") ||
            "";

        if (role !== "PLATFORM_ADMIN") {
            router.replace("/login");
            return;
        }

        setCheckedRole(true);
    }, [pathname, router]);

    if (!checkedRole) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#FDFAF4] font-sans text-[#2D1B4E]">
                <p className="text-sm font-semibold">Checking administrator access…</p>
            </main>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#FDFAF4] font-sans text-[#1A1220]">
            <PlatformAdminSidebar />

            <div className="min-w-0 flex-1">
                <PlatformAdminHeader />
                {children}
            </div>
        </div>
    );
}
