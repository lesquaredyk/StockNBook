"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Package, ShieldCheck } from "lucide-react";

export default function StaffRolesPage() {
    const router = useRouter();

    useEffect(() => {
        const token = sessionStorage.getItem("token");
        const role = sessionStorage.getItem("role");
        const permissions = JSON.parse(sessionStorage.getItem("permissions") || "{}");

        if (!token || role !== "manager") {
            router.push("/");
            return;
        }

        if (!permissions.staff_roles) {
            alert("You do not have access to staff roles.");
            router.push("/dashboard");
        }
    }, [router]);

    return (
        <main className="min-h-screen bg-[#FDFAF4] text-[#1A1220]">
            <nav className="flex h-16 items-center justify-between border-b border-[#EBE4F0] bg-white px-6 lg:px-10">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2D1B4E] text-[#C9951A]">
                        <Package className="h-5 w-5" />
                    </div>

                    <span className="text-lg font-semibold">
            <span className="text-[#2D1B4E]">Stock</span>NBook
          </span>
                </div>

                <button
                    onClick={() => router.push("/dashboard")}
                    className="inline-flex items-center gap-2 rounded-lg border border-[#EBE4F0] bg-white px-4 py-2 text-sm font-medium text-[#2D1B4E]"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </button>
            </nav>

            <section className="mx-auto max-w-4xl px-6 py-10">
                <div className="rounded-3xl border border-[#EBE4F0] bg-white p-8 shadow-sm">
                    <ShieldCheck className="h-8 w-8 text-[#2D1B4E]" />

                    <h1 className="mt-4 font-serif text-4xl">
                        Staff Roles & Permissions
                    </h1>

                    <p className="mt-3 text-sm text-[#7A6E88]">
                        This page will be used later to manage existing staff access.
                    </p>
                </div>
            </section>
        </main>
    );
}





