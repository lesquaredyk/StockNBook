"use client";

import { useEffect, useMemo, useState } from "react";
import {
    BarChart3,
    CalendarDays,
    ChevronDown,
    Gift,
    RefreshCw,
    Store,
    Trophy,
} from "lucide-react";
import {
    Booking,
    BookingRow,
    dateKey,
    formatDate,
    getAmountPaid,
    getBookingItemLabel,
    getBranchGroupName,
    getTotalPrice,
    normalizeBooking,
    peso,
} from "./_shared";

type InsightPanel = "dates" | "packages" | "branches" | "";

export default function OwnerBookings() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [openBranch, setOpenBranch] = useState("");
    const [openInsight, setOpenInsight] = useState<InsightPanel>("");

    async function loadBookings() {
        setLoading(true);

        const token = sessionStorage.getItem("token");

        const storeId =
            sessionStorage.getItem("store_id") ||
            sessionStorage.getItem("stocknbook_store_id");

        if (!token || !storeId) {
            setBookings([]);
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/bookings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    action: "get_bookings",
                    store_id: Number(storeId),
                    role: "owner",
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setBookings([]);
                return;
            }

            const normalizedBookings = (data.bookings || []).map((b: any) =>
                normalizeBooking(b)
            );

            setBookings(normalizedBookings);
        } catch (err) {
            console.error("Bookings load failed:", err);
            setBookings([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void loadBookings();
    }, []);

    const branchGroups = useMemo(() => {
        const groups: Record<string, Booking[]> = {};

        bookings.forEach((booking) => {
            const key = getBranchGroupName(booking);

            if (!groups[key]) groups[key] = [];
            groups[key].push(booking);
        });

        return groups;
    }, [bookings]);

    const branchRows = useMemo(() => {
        return Object.entries(branchGroups)
            .map(([name, branchBookings]) => {
                const pending = branchBookings.filter(
                    (b) => b.status === "Pending Review"
                ).length;

                const active = branchBookings.filter(
                    (b) => b.status === "Confirmed" || b.status === "Preparing"
                ).length;

                const completed = branchBookings.filter(
                    (b) => b.status === "Completed"
                ).length;

                const cancelled = branchBookings.filter(
                    (b) => b.status === "Cancelled"
                ).length;

                const bookingSales = branchBookings
                    .filter((b) => b.status !== "Cancelled")
                    .reduce((sum, b) => sum + getTotalPrice(b), 0);

                const revenue = branchBookings
                    .filter((b) => b.status !== "Cancelled")
                    .reduce((sum, b) => sum + getAmountPaid(b), 0);

                const nextBooking = getNextBooking(branchBookings);

                return {
                    name,
                    bookings: branchBookings,
                    total: branchBookings.length,
                    pending,
                    active,
                    completed,
                    cancelled,
                    bookingSales,
                    revenue,
                    nextBooking,
                };
            })
            .sort((a, b) => b.total - a.total);
    }, [branchGroups]);

    const bookingSales = bookings
        .filter((b) => b.status !== "Cancelled")
        .reduce((sum, b) => sum + getTotalPrice(b), 0);

    const bookingRevenue = bookings
        .filter((b) => b.status !== "Cancelled")
        .reduce((sum, b) => sum + getAmountPaid(b), 0);

    const totalBookings = bookings.length;
    const topBranch = branchRows[0];

    const dateRankings = useMemo(() => {
        const map: Record<string, number> = {};

        bookings.forEach((booking) => {
            const key = dateKey(booking.date);
            if (!key) return;

            map[key] = (map[key] || 0) + 1;
        });

        return Object.entries(map)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => b.count - a.count || a.date.localeCompare(b.date));
    }, [bookings]);

    const packageRankings = useMemo(() => {
        const map: Record<string, number> = {};

        bookings.forEach((booking) => {
            const label = getBookingItemLabel(booking);
            if (!label || label === "Package") return;

            map[label] = (map[label] || 0) + 1;
        });

        return Object.entries(map)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    }, [bookings]);

    const branchRankings = useMemo(() => {
        return branchRows.map((branch) => ({
            name: branch.name,
            count: branch.total,
            revenue: branch.revenue,
            bookingSales: branch.bookingSales,
        }));
    }, [branchRows]);

    const busiestDate = dateRankings[0];
    const mostBookedPackage = packageRankings[0];

    return (
        <>
            <div className="sticky top-0 z-20 border-b border-[#E9E0EF] bg-[#FFFDF8]/95 backdrop-blur">
                <div className="flex items-center justify-between px-6 py-3">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-[25px] font-bold text-[#1A1220]">
                            Bookings
                        </h1>

                        <span className="rounded-lg bg-[#EFE8F8] px-3.5 py-1.5 text-sm font-medium text-[#4E2C66]">
                            all branches
                        </span>
                    </div>

                    <button
                        onClick={() => void loadBookings()}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#2B174C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1B0D31]"
                        type="button"
                    >
                        <RefreshCw size={14} />
                        Refresh bookings
                    </button>
                </div>
            </div>

            <section className="px-6 py-4">
                <div className="mb-3 grid gap-3 lg:grid-cols-3">
                    <CompactMetricCard
                        icon={<CalendarDays size={15} />}
                        title="Booking Sales"
                        value={peso(bookingSales)}
                        subLabel="Revenue"
                        subValue={peso(bookingRevenue)}
                    />

                    <CompactMetricCard
                        icon={<BarChart3 size={15} />}
                        title="Total Bookings"
                        value={String(totalBookings)}
                        subLabel="Scope"
                        subValue="All branches"
                    />

                    <CompactMetricCard
                        icon={<Store size={15} />}
                        title="Top Branch"
                        value={topBranch?.name || "—"}
                        subLabel="Most bookings"
                        subValue={
                            topBranch
                                ? `${topBranch.total} ${
                                    topBranch.total === 1 ? "booking" : "bookings"
                                }`
                                : "—"
                        }
                    />
                </div>

                <div className="mb-3 rounded-[14px] border border-[#E6DDF0] bg-white p-3 shadow-sm">
                    <div className="mb-2.5">
                        <h2 className="text-[16px] font-bold text-[#1A1220]">
                            Booking Analytics
                        </h2>
                        <p className="text-xs text-[#7A6A84]">
                            View-only summaries from booking records.
                        </p>
                    </div>

                    <div className="grid gap-2.5 lg:grid-cols-3">
                        <InsightCard
                            tone="purple"
                            icon={<CalendarDays size={16} />}
                            title="Busiest Date"
                            value={busiestDate ? formatDate(busiestDate.date) : "—"}
                            subtext={
                                busiestDate
                                    ? `${busiestDate.count} ${
                                        busiestDate.count === 1
                                            ? "booking"
                                            : "bookings"
                                    }`
                                    : "No bookings yet"
                            }
                            actionText="View ranking"
                            active={openInsight === "dates"}
                            onClick={() =>
                                setOpenInsight(openInsight === "dates" ? "" : "dates")
                            }
                        />

                        <InsightCard
                            tone="green"
                            icon={<Gift size={16} />}
                            title="Most Booked Package"
                            value={mostBookedPackage?.name || "—"}
                            subtext={
                                mostBookedPackage
                                    ? `${mostBookedPackage.count} ${
                                        mostBookedPackage.count === 1
                                            ? "booking"
                                            : "bookings"
                                    }`
                                    : "No package data yet"
                            }
                            actionText="View ranking"
                            active={openInsight === "packages"}
                            onClick={() =>
                                setOpenInsight(
                                    openInsight === "packages" ? "" : "packages"
                                )
                            }
                        />

                        <InsightCard
                            tone="amber"
                            icon={<Trophy size={16} />}
                            title="Branch Ranking"
                            value={topBranch ? `Top: ${topBranch.name}` : "—"}
                            subtext={
                                topBranch
                                    ? `${topBranch.total} ${
                                        topBranch.total === 1
                                            ? "booking"
                                            : "bookings"
                                    }`
                                    : "No branch data yet"
                            }
                            actionText="View ranking"
                            active={openInsight === "branches"}
                            onClick={() =>
                                setOpenInsight(
                                    openInsight === "branches" ? "" : "branches"
                                )
                            }
                        />
                    </div>

                    {openInsight && (
                        <InsightRankingPanel
                            type={openInsight}
                            dateRankings={dateRankings}
                            packageRankings={packageRankings}
                            branchRankings={branchRankings}
                            onOpenBranch={(branch) => {
                                setOpenBranch(branch);
                                setOpenInsight("");
                            }}
                        />
                    )}
                </div>

                <div className="mb-2.5 flex items-end justify-between gap-4">
                    <div>
                        <h2 className="text-[17px] font-bold text-[#1A1220]">
                            Branch Overview
                        </h2>
                        <p className="text-xs text-[#7A6A84]">
                            Monitor booking activity across all branches.
                        </p>
                    </div>

                    <p className="text-xs font-semibold text-[#5F4E75]">
                        Sorted by:{" "}
                        <span className="text-[#2B174C]">Most Bookings</span>
                    </p>
                </div>

                {loading ? (
                    <div className="rounded-[14px] border border-[#E6DDF0] bg-white px-4 py-10 text-center text-sm text-[#9B8AAA] shadow-sm">
                        Loading bookings...
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="rounded-[14px] border border-[#E6DDF0] bg-white px-4 py-10 text-center text-sm text-[#9B8AAA] shadow-sm">
                        No bookings found.
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-[14px] border border-[#E6DDF0] bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[930px] border-collapse">
                                <thead>
                                <tr className="border-b border-[#E6DDF0] bg-[#FFFCF7]">
                                    <th className="px-3 py-3 text-left text-xs font-semibold text-[#806A8C]">
                                        Branch
                                    </th>
                                    <th className="px-3 py-3 text-center text-xs font-semibold text-[#806A8C]">
                                        Total
                                    </th>
                                    <th className="px-3 py-3 text-center text-xs font-semibold text-[#806A8C]">
                                        Pending
                                    </th>
                                    <th className="px-3 py-3 text-center text-xs font-semibold text-[#806A8C]">
                                        Active
                                    </th>
                                    <th className="px-3 py-3 text-center text-xs font-semibold text-[#806A8C]">
                                        Completed
                                    </th>
                                    <th className="px-3 py-3 text-center text-xs font-semibold text-[#806A8C]">
                                        Cancelled
                                    </th>
                                    <th className="px-3 py-3 text-right text-xs font-semibold text-[#806A8C]">
                                        Sales
                                    </th>
                                    <th className="px-3 py-3 text-right text-xs font-semibold text-[#806A8C]">
                                        Revenue
                                    </th>
                                    <th className="px-3 py-3 text-left text-xs font-semibold text-[#806A8C]">
                                        Next Booking
                                    </th>
                                </tr>
                                </thead>

                                <tbody>
                                {branchRows.map((branch) => (
                                    <BranchOverviewRow
                                        key={branch.name}
                                        branch={branch}
                                        isOpen={openBranch === branch.name}
                                        onToggle={() =>
                                            setOpenBranch(
                                                openBranch === branch.name
                                                    ? ""
                                                    : branch.name
                                            )
                                        }
                                    />
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </section>
        </>
    );
}

function CompactMetricCard({
                               icon,
                               title,
                               value,
                               subLabel,
                               subValue,
                           }: {
    icon: React.ReactNode;
    title: string;
    value: string;
    subLabel?: string;
    subValue?: string;
}) {
    return (
        <div className="rounded-[14px] border border-[#E6DDF0] bg-white p-3 shadow-sm">
            <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F3EAFE] text-[#6C3AD6]">
                    {icon}
                </div>

                <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-[#2B174C]">{title}</p>

                    <p className="mt-1 truncate text-[19px] font-bold leading-tight text-[#1A1220]">
                        {value}
                    </p>

                    {subLabel && subValue && (
                        <div className="mt-2 flex items-center justify-between gap-3 border-t border-[#EFE7F4] pt-2 text-xs">
                            <span className="text-[#5F4E75]">{subLabel}</span>
                            <span className="font-semibold text-[#1A1220]">
                                {subValue}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function InsightCard({
                         icon,
                         title,
                         value,
                         subtext,
                         actionText,
                         active,
                         tone,
                         onClick,
                     }: {
    icon: React.ReactNode;
    title: string;
    value: string;
    subtext: string;
    actionText: string;
    active: boolean;
    tone: "purple" | "green" | "amber";
    onClick: () => void;
}) {
    const toneClass =
        tone === "purple"
            ? "border-[#E6DDF0] bg-[#FBF7FF] text-[#6C3AD6]"
            : tone === "green"
                ? "border-[#DDEEDD] bg-[#F4FFF6] text-[#168A38]"
                : "border-[#F2E1C7] bg-[#FFF8ED] text-[#B26A00]";

    return (
        <button
            onClick={onClick}
            className={`rounded-[14px] border p-2.5 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${
                active ? "border-[#2B174C] ring-2 ring-[#E8DDF7]" : toneClass
            }`}
            type="button"
        >
            <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/80">
                        {icon}
                    </div>

                    <div className="min-w-0">
                        <p className="text-[10px] font-semibold text-[#5F4E75]">
                            {title}
                        </p>

                        <p className="mt-0.5 truncate text-sm font-bold leading-snug text-[#1A1220]">
                            {value}
                        </p>

                        <p className="mt-0.5 text-[10px] font-medium text-[#5F4E75]">
                            {subtext}
                        </p>
                    </div>
                </div>

                <ChevronDown
                    size={14}
                    className={`shrink-0 text-[#2B174C] transition ${
                        active ? "rotate-180" : "-rotate-90"
                    }`}
                />
            </div>

            <p className="mt-2 text-[10px] font-semibold text-[#4E2C85]">
                {actionText}
            </p>
        </button>
    );
}

function InsightRankingPanel({
                                 type,
                                 dateRankings,
                                 packageRankings,
                                 branchRankings,
                                 onOpenBranch,
                             }: {
    type: InsightPanel;
    dateRankings: { date: string; count: number }[];
    packageRankings: { name: string; count: number }[];
    branchRankings: {
        name: string;
        count: number;
        revenue: number;
        bookingSales: number;
    }[];
    onOpenBranch: (branch: string) => void;
}) {
    const title =
        type === "dates"
            ? "Date Ranking"
            : type === "packages"
                ? "Package Ranking"
                : "Branch Ranking";

    const subtitle =
        type === "dates"
            ? "Dates with the most bookings appear first."
            : type === "packages"
                ? "Most booked packages and requests appear first."
                : "Branches with the most bookings appear first.";

    return (
        <div className="mt-3 rounded-[14px] border border-[#E6DDF0] bg-[#FFFCF7] p-3">
            <div className="mb-2.5">
                <h3 className="text-sm font-bold text-[#1A1220]">{title}</h3>
                <p className="text-xs text-[#8A7A91]">{subtitle}</p>
            </div>

            <div className="grid gap-2">
                {type === "dates" &&
                    (dateRankings.length > 0 ? (
                        dateRankings.slice(0, 6).map((item, index) => (
                            <RankingRow
                                key={item.date}
                                index={index}
                                title={formatDate(item.date)}
                                meta={`${item.count} ${
                                    item.count === 1 ? "booking" : "bookings"
                                }`}
                            />
                        ))
                    ) : (
                        <EmptyRanking />
                    ))}

                {type === "packages" &&
                    (packageRankings.length > 0 ? (
                        packageRankings.slice(0, 6).map((item, index) => (
                            <RankingRow
                                key={item.name}
                                index={index}
                                title={item.name}
                                meta={`${item.count} ${
                                    item.count === 1 ? "booking" : "bookings"
                                }`}
                            />
                        ))
                    ) : (
                        <EmptyRanking />
                    ))}

                {type === "branches" &&
                    (branchRankings.length > 0 ? (
                        branchRankings.slice(0, 6).map((item, index) => (
                            <button
                                key={item.name}
                                onClick={() => onOpenBranch(item.name)}
                                className="flex items-center justify-between gap-4 rounded-xl border border-[#EFE7F4] bg-white px-3 py-2.5 text-left hover:bg-[#F7F1FF]"
                                type="button"
                            >
                                <div className="flex items-center gap-3">
                                    <RankBadge index={index} />
                                    <div>
                                        <p className="text-sm font-bold text-[#1A1220]">
                                            {item.name}
                                        </p>
                                        <p className="text-xs text-[#7A6A84]">
                                            {item.count}{" "}
                                            {item.count === 1 ? "booking" : "bookings"} ·
                                            Sales {peso(item.bookingSales)}
                                        </p>
                                    </div>
                                </div>

                                <p className="text-xs font-semibold text-green-700">
                                    Revenue {peso(item.revenue)}
                                </p>
                            </button>
                        ))
                    ) : (
                        <EmptyRanking />
                    ))}
            </div>
        </div>
    );
}

function RankingRow({
                        index,
                        title,
                        meta,
                    }: {
    index: number;
    title: string;
    meta: string;
}) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-[#EFE7F4] bg-white px-3 py-2">
            <div className="flex items-center gap-3">
                <RankBadge index={index} />
                <div>
                    <p className="text-sm font-bold text-[#1A1220]">{title}</p>
                    <p className="text-xs text-[#7A6A84]">{meta}</p>
                </div>
            </div>
        </div>
    );
}

function RankBadge({ index }: { index: number }) {
    return (
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EFE8F8] text-xs font-bold text-[#2B174C]">
            {index + 1}
        </div>
    );
}

function EmptyRanking() {
    return (
        <div className="rounded-xl border border-[#EFE7F4] bg-white px-4 py-5 text-center text-sm text-[#9B8AAA]">
            No ranking data yet.
        </div>
    );
}

function BranchOverviewRow({
                               branch,
                               isOpen,
                               onToggle,
                           }: {
    branch: {
        name: string;
        bookings: Booking[];
        total: number;
        pending: number;
        active: number;
        completed: number;
        cancelled: number;
        bookingSales: number;
        revenue: number;
        nextBooking?: Booking | null;
    };
    isOpen: boolean;
    onToggle: () => void;
}) {
    return (
        <>
            <tr
                onClick={onToggle}
                className={`cursor-pointer border-b border-[#EFE7F4] transition hover:bg-[#FFFCF7] ${
                    isOpen ? "bg-[#F9F4FF]" : "bg-white"
                }`}
            >
                <td className="px-3 py-3">
                    <div className="flex items-center gap-2.5">
                        <ChevronDown
                            size={14}
                            className={`shrink-0 text-[#2B174C] transition ${
                                isOpen ? "rotate-180" : "-rotate-90"
                            }`}
                        />

                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EFE8F8] text-[#6C3AD6]">
                            <Store size={14} />
                        </div>

                        <p className="max-w-[130px] text-sm font-bold leading-snug text-[#1A1220]">
                            {branch.name}
                        </p>
                    </div>
                </td>

                <td className="px-3 py-3 text-center text-sm font-bold text-[#1A1220]">
                    {branch.total}
                </td>

                <td className="px-3 py-3 text-center text-sm font-bold text-orange-600">
                    {branch.pending}
                </td>

                <td className="px-3 py-3 text-center text-sm font-bold text-green-700">
                    {branch.active}
                </td>

                <td className="px-3 py-3 text-center text-sm font-bold text-green-700">
                    {branch.completed}
                </td>

                <td className="px-3 py-3 text-center text-sm font-bold text-red-600">
                    {branch.cancelled}
                </td>

                <td className="px-3 py-3 text-right text-sm font-bold text-[#1A1220]">
                    {peso(branch.bookingSales)}
                </td>

                <td className="px-3 py-3 text-right text-sm font-bold text-green-700">
                    {peso(branch.revenue)}
                </td>

                <td className="px-3 py-3">
                    {branch.nextBooking ? (
                        <div>
                            <p className="text-xs font-bold text-[#1A1220]">
                                {formatDate(branch.nextBooking.date)}
                            </p>
                            {branch.nextBooking.eventTime && (
                                <p className="text-[11px] text-[#7A6A84]">
                                    {branch.nextBooking.eventTime}
                                </p>
                            )}
                        </div>
                    ) : (
                        <p className="text-xs text-[#9B8AAA]">—</p>
                    )}
                </td>
            </tr>

            {isOpen && (
                <tr className="border-b border-[#EFE7F4] bg-[#F9F4FF]">
                    <td colSpan={9} className="px-3 pb-4">
                        <div className="overflow-hidden rounded-[14px] border border-[#E6DDF0] bg-white">
                            <div className="border-b border-[#E6DDF0] bg-[#FFFCF7] px-4 py-2.5">
                                <p className="text-sm font-bold text-[#1A1220]">
                                    {branch.name} — {branch.total}{" "}
                                    {branch.total === 1 ? "booking" : "bookings"}
                                </p>

                                <p className="text-[11px] text-[#8A7A91]">
                                    Read-only booking list for owner monitoring.
                                </p>
                            </div>

                            <div className="max-h-[500px] overflow-y-auto overflow-x-auto">
                                <table className="w-full min-w-[920px] border-collapse">
                                    <thead className="sticky top-0 z-10">
                                    <tr className="border-b border-[#E6DDF0] bg-white">
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#806A8C]">
                                            Client
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#806A8C]">
                                            Schedule
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#806A8C]">
                                            Package
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#806A8C]">
                                            Payment
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#806A8C]">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-[#806A8C]">
                                            Details
                                        </th>
                                    </tr>
                                    </thead>

                                    <tbody>
                                    {branch.bookings.map((b) => (
                                        <BookingRow
                                            key={b.id}
                                            b={b}
                                            ownerView
                                            canManage={false}
                                        />
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}

function getNextBooking(bookings: Booking[]) {
    const today = dateKey(new Date().toISOString());

    const upcoming = bookings
        .filter((booking) => {
            const key = dateKey(booking.date);
            return key && key >= today && booking.status !== "Cancelled";
        })
        .sort((a, b) => dateKey(a.date).localeCompare(dateKey(b.date)));

    if (upcoming[0]) return upcoming[0];

    const latest = [...bookings]
        .filter((booking) => dateKey(booking.date))
        .sort((a, b) => dateKey(b.date).localeCompare(dateKey(a.date)));

    return latest[0] || null;
}