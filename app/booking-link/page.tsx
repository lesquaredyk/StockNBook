"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BookingLinkRedirectPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/settings");
    }, [router]);

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#f5f6f8] text-[#1f2a44]">
            <p className="text-sm text-gray-500">Redirecting to settings...</p>
        </main>
    );
}
