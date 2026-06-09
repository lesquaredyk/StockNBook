"use client";

import RoleSidebar from "@/components/sidebar/RoleSidebar";
import OwnerBookings from "@/components/bookings/BookingManagement/OwnerBookings";
import ManagerBookings from "@/components/bookings/BookingManagement/ManagerBookings";
import StaffBookings from "@/components/bookings/BookingManagement/StaffBookings";
import { useEffect, useState } from "react";

export default function BookingsPage() {
    const [role, setRole] = useState("");
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const savedRole = sessionStorage.getItem("role") || "owner";
        setRole(savedRole.toLowerCase());
        setReady(true);
    }, []);

    if (!ready) return null;

    return (
        <div
            style={{
                backgroundColor: "#FDFAF4",
                fontFamily: "DM Sans, Inter, Arial, sans-serif",
            }}
            className="flex min-h-screen text-[#1A1220]"
        >
            <RoleSidebar />

            <main className="flex-1 overflow-y-auto">
                {role === "owner" && <OwnerBookings />}
                {role === "manager" && <ManagerBookings />}
                {role === "staff" && <StaffBookings />}
            </main>
        </div>
    );
}