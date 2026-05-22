"use client";

import { useEffect, useMemo, useState } from "react";
import RoleSidebar from "@/components/RoleSidebar";
import RequirePermission from "@/components/RequirePermission";
import { QRCodeCanvas } from "qrcode.react";

function makeSlug(value: string) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}

export default function SettingsPage() {
    const [mounted, setMounted] = useState(false);
    const [storeName, setStoreName] = useState("Store Name");
    const [storeSlug, setStoreSlug] = useState("");
    const [role, setRole] = useState("");
    const [branchId, setBranchId] = useState("");
    const [branchName, setBranchName] = useState("");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const frame = window.requestAnimationFrame(() => {
            const savedStoreName =
                sessionStorage.getItem("store_name") ||
                sessionStorage.getItem("stocknbook_store_name") ||
                "Store Name";

            const savedSlug =
                sessionStorage.getItem("store_slug") ||
                sessionStorage.getItem("slug");

            const savedRole = (sessionStorage.getItem("role") || "").toLowerCase();

            const savedBranchId =
                sessionStorage.getItem("branch_id") ||
                sessionStorage.getItem("stocknbook_branch_id") ||
                "";

            const savedBranchName =
                sessionStorage.getItem("branch_name") ||
                sessionStorage.getItem("stocknbook_branch_name") ||
                "";

            const generatedSlug = savedSlug ? savedSlug : makeSlug(savedStoreName);

            if (generatedSlug && !savedSlug) {
                sessionStorage.setItem("store_slug", generatedSlug);
            }

            setStoreName(savedStoreName);
            setStoreSlug(generatedSlug);
            setRole(savedRole);
            setBranchId(savedBranchId);
            setBranchName(savedBranchName);
            setMounted(true);
        });

        return () => window.cancelAnimationFrame(frame);
    }, []);

    const branchSlug = useMemo(() => {
        if (!branchName) return "";
        return makeSlug(branchName);
    }, [branchName]);

    const bookingLink = useMemo(() => {
        if (!storeSlug || !mounted) return "";

        // Manager/staff get a branch-specific booking link.
        // This uses branchId because the public booking page currently filters packages by branchId.
        if ((role === "manager" || role === "staff") && branchId) {
            return `${window.location.origin}/book/${storeSlug}?branchId=${branchId}`;
        }

        // Owner should not use one generic store link if bookings are branch-based.
        return "";
    }, [storeSlug, mounted, role, branchId]);

    const handleCopy = async () => {
        if (!bookingLink) return;

        try {
            await navigator.clipboard.writeText(bookingLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error("Copy failed:", error);
            alert("Failed to copy link.");
        }
    };

    const downloadQR = () => {
        const canvas = document.querySelector("canvas") as HTMLCanvasElement | null;
        if (!canvas) return;

        const url = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = url;
        link.download = "booking-qr.png";
        link.click();
    };

    const handlePreview = () => {
        if (!bookingLink) return;
        window.open(bookingLink, "_blank");
    };

    if (!mounted) {
        return null;
    }

    return (
        <RequirePermission>
            <div className="flex min-h-screen bg-[#f5f6f8]">
                <RoleSidebar />

                <main className="flex-1 p-6">
                    <div className="mb-6">
                        <p className="text-xl font-semibold text-[#1f2a44]">Settings</p>
                        <p className="text-sm text-gray-500">
                            Manage business, booking, account, and branch settings.
                        </p>
                    </div>

                    <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
                        <section className="rounded-2xl bg-white p-6 shadow-sm">
                            <div className="mb-5 flex items-start gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-lg text-purple-600">
                                    🏪
                                </div>

                                <div>
                                    <h2 className="text-sm font-semibold text-[#1f2a44]">
                                        Business Information
                                    </h2>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Basic business details used across your booking page and operations.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="mb-2 block text-xs font-medium text-gray-500">
                                        Business Name
                                    </label>
                                    <input
                                        readOnly
                                        value={storeName}
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-medium text-gray-500">
                                        Store Slug
                                    </label>
                                    <input
                                        readOnly
                                        value={storeSlug}
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none"
                                    />
                                </div>

                                {(role === "manager" || role === "staff") && (
                                    <>
                                        <div>
                                            <label className="mb-2 block text-xs font-medium text-gray-500">
                                                Branch
                                            </label>
                                            <input
                                                readOnly
                                                value={branchName || "Assigned Branch"}
                                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-xs font-medium text-gray-500">
                                                Branch Slug
                                            </label>
                                            <input
                                                readOnly
                                                value={branchSlug}
                                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </section>

                        <section className="rounded-2xl bg-white p-6 shadow-sm">
                            <div className="mb-5 flex items-start gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-lg text-purple-600">
                                    🔗
                                </div>

                                <div>
                                    <h2 className="text-sm font-semibold text-[#1f2a44]">
                                        Booking Link
                                    </h2>
                                    <p className="mt-1 text-xs text-gray-500">
                                        {role === "owner"
                                            ? "Booking links are now generated per branch to keep bookings assigned correctly."
                                            : "Share this branch booking link with customers so bookings go to your assigned branch."}
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-xl border border-gray-200 bg-[#fafafa] px-4 py-3 text-sm text-gray-700">
                                {bookingLink
                                    ? bookingLink
                                    : role === "owner"
                                        ? "Owner booking links should be copied per branch from the Branches page."
                                        : "No branch booking link available yet."}
                            </div>

                            {branchName && (
                                <p className="mt-2 text-xs text-gray-500">
                                    Branch:{" "}
                                    <span className="font-semibold text-[#1f2a44]">
                                        {branchName}
                                    </span>
                                </p>
                            )}

                            <div className="mt-4 flex flex-wrap gap-2">
                                <button
                                    onClick={handleCopy}
                                    disabled={!bookingLink}
                                    className="rounded-lg bg-purple-500 px-4 py-2 text-xs font-medium text-white hover:bg-purple-600 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {copied ? "Copied!" : "Copy Link"}
                                </button>

                                <button
                                    onClick={handlePreview}
                                    disabled={!bookingLink}
                                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-[#1f2a44] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Preview
                                </button>
                            </div>
                        </section>
                    </div>

                    <div className="mt-5 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                        <section className="rounded-2xl bg-white p-6 shadow-sm">
                            <h3 className="mb-3 text-sm font-semibold text-[#1f2a44]">
                                QR Code
                            </h3>

                            <div className="flex min-h-45 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-[#fafafa]">
                                <div className="text-center">
                                    {bookingLink ? (
                                        <QRCodeCanvas value={bookingLink} size={140} />
                                    ) : (
                                        <p className="text-xs text-gray-400">
                                            {role === "owner"
                                                ? "Branch QR codes should be generated from each branch link."
                                                : "No link available"}
                                        </p>
                                    )}

                                    <p className="mt-3 text-xs text-gray-500">
                                        {role === "owner"
                                            ? "Use branch-specific QR codes for accurate booking assignment."
                                            : "Scan to open your branch public booking page."}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={downloadQR}
                                disabled={!bookingLink}
                                className="mt-3 rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-[#1f2a44] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Download QR
                            </button>
                        </section>

                        <section className="rounded-2xl bg-white p-6 shadow-sm">
                            <h3 className="mb-3 text-sm font-semibold text-[#1f2a44]">
                                Sharing Tips
                            </h3>

                            <div className="space-y-3 text-sm text-gray-600">
                                <div className="rounded-xl bg-[#fafafa] px-4 py-3">
                                    {role === "owner"
                                        ? "Share the correct branch link so bookings go to the right branch."
                                        : "Add your branch booking link to your Facebook page bio or pinned post."}
                                </div>

                                <div className="rounded-xl bg-[#fafafa] px-4 py-3">
                                    Send the link directly to customers who inquire by chat.
                                </div>

                                <div className="rounded-xl bg-[#fafafa] px-4 py-3">
                                    Use the QR code for walk-in customers or printed displays.
                                </div>

                                <div className="rounded-xl bg-[#fafafa] px-4 py-3">
                                    Preview the page first before sharing to make sure your branch link is correct.
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="mt-5 grid gap-5 lg:grid-cols-2">
                        <section className="rounded-2xl bg-white p-6 shadow-sm">
                            <h3 className="text-sm font-semibold text-[#1f2a44]">
                                Subscription / Billing
                            </h3>
                            <p className="mt-2 text-sm text-gray-500">
                                Owner billing and plan details can be added here later.
                            </p>
                        </section>

                        <section className="rounded-2xl bg-white p-6 shadow-sm">
                            <h3 className="text-sm font-semibold text-[#1f2a44]">
                                Branch Settings
                            </h3>
                            <p className="mt-2 text-sm text-gray-500">
                                {role === "owner"
                                    ? "Owners should manage branch-level booking links from the Branches page."
                                    : "Managers can use this section later for branch-level settings."}
                            </p>
                        </section>
                    </div>
                </main>
            </div>
        </RequirePermission>
    );
}