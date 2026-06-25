"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";

const titleByPath: Record<string, string> = {
    "/platform-admin/dashboard": "Administrator Dashboard",
    "/platform-admin/subscriptions": "Subscription Management",
    "/platform-admin/businesses": "Businesses",
};

export default function PlatformAdminHeader() {
    const pathname = usePathname();

    const title = useMemo(() => {
        return titleByPath[pathname] || "Platform Administrator";
    }, [pathname]);

    const dateLabel = useMemo(() => {
        return new Date().toLocaleDateString("en-PH", {
            month: "long",
            year: "numeric",
        });
    }, []);

    return (
        <header className="flex min-h-[54px] items-center justify-between border-b border-[#EBE4F0] bg-[#FDFAF4] px-5">
            <div className="flex min-w-0 items-center gap-3">
                <h1 className="truncate text-[18px] font-semibold text-[#1A1220]">
                    {title}
                </h1>

                <span className="hidden rounded-md bg-[#EEE8F8] px-3 py-1 text-[10px] font-semibold text-[#2D1B4E] sm:inline-flex">
                    Platform Admin
                </span>
            </div>

            <div className="flex items-center gap-2">
                <span className="hidden rounded-lg border border-[#EBE4F0] bg-white px-3 py-1.5 text-[10px] font-medium text-[#776E84] sm:inline-flex">
                    {dateLabel}
                </span>

                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C9951A] text-[10px] font-bold text-white">
                    PA
                </div>
            </div>
        </header>
    );
}
