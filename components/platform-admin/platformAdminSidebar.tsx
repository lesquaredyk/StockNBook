"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
    {
        href: "/platform-admin/dashboard",
        label: "Dashboard",
        mark: "D",
    },
    {
        href: "/platform-admin/subscriptions",
        label: "Subscription Management",
        mark: "S",
    },
    {
        href: "/platform-admin/businesses",
        label: "Businesses",
        mark: "B",
    },
];

export default function PlatformAdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const logout = () => {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("role");
        sessionStorage.removeItem("user");

        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("user");

        router.replace("/login");
    };

    return (
        <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-r border-white/10 bg-[#2D1B4E] px-4 py-5 text-white lg:flex">
            <div className="mb-8 flex items-center gap-3 px-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#C9951A] text-[12px] font-bold">
                    SN
                </div>
                <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold">
                        StockNBook
                    </p>
                    <p className="mt-0.5 text-[10px] text-[#D8CBE9]">
                        Platform Administrator
                    </p>
                </div>
            </div>

            <nav className="space-y-1.5">
                {navItems.map((item) => {
                    const isActive =
                        pathname === item.href ||
                        pathname.startsWith(`${item.href}/`);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={[
                                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[12px] font-semibold transition",
                                isActive
                                    ? "bg-white/15 text-white"
                                    : "text-[#E6DDF0] hover:bg-white/10 hover:text-white",
                            ].join(" ")}
                        >
                            <span
                                className={[
                                    "flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-bold",
                                    isActive
                                        ? "bg-[#C9951A] text-white"
                                        : "bg-white/10 text-[#E6DDF0]",
                                ].join(" ")}
                            >
                                {item.mark}
                            </span>
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto border-t border-white/10 pt-4">
                <button
                    type="button"
                    onClick={logout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[12px] font-semibold text-[#E6DDF0] transition hover:bg-white/10 hover:text-white"
                >
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/10 text-[11px]">
                        ↩
                    </span>
                    Logout
                </button>
            </div>
        </aside>
    );
}
