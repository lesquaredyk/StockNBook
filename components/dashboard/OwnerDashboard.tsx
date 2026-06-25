"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Branch = {
    id: number;
    branchName: string;
    managerName?: string;
};

type Booking = {
    id: number;
    branchId?: number | null;
    branch_id?: number | null;
    branchName?: string | null;
    branch_name?: string | null;
    name: string;
    date?: string;
    status?: string;
    packageName?: string;
    eventName?: string;
};

type OrderItem = {
    name?: string;
    quantity?: number;
    salesPrice?: number;
    sales_price?: number;
    sellingPrice?: number;
    selling_price?: number;
    price?: number;
    originalPrice?: number;
    original_price?: number;
    costPrice?: number;
    cost_price?: number;
};

type Order = {
    id?: string;
    orderId?: string;
    branchId?: number | null;
    branch_id?: number | null;
    branchName?: string | null;
    branch_name?: string | null;
    total?: number;
    date?: string;
    orderDate?: string;
    createdAt?: string;
    item?: string;
    items?: OrderItem[];
};

type Product = {
    id: number;
    branchId?: number | null;
    branch_id?: number | null;
    branchName?: string | null;
    branch_name?: string | null;
    name: string;
    category?: string;
    stock?: number;
    alertLevel?: number;
    salesPrice?: number;
    sales_price?: number;
    sellingPrice?: number;
    selling_price?: number;
    price?: number;
    originalPrice?: number;
    original_price?: number;
    costPrice?: number;
    cost_price?: number;
};

type BranchManager = {
    id?: number;
    managerId?: number;
    branchId?: number;
    branch_id?: number;
    name?: string;
    managerName?: string;
    manager_name?: string;
    status?: string;
};

function getSavedItem(key: string) {
    if (typeof window === "undefined") return "";
    return sessionStorage.getItem(key) || localStorage.getItem(key) || "";
}

function peso(value: number) {
    return `₱${Number(value || 0).toLocaleString("en-PH", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    })}`;
}

function formatDashboardDate(value?: string) {
    if (!value) return { dateLabel: "—", timeLabel: "" };

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
        return {
            dateLabel: value.slice(0, 10),
            timeLabel: value.length > 10 ? value.slice(11, 16) : "",
        };
    }

    return {
        dateLabel: parsed.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        }),
        timeLabel: parsed.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
        }),
    };
}

function normalizeBranch(raw: any): Branch {
    return {
        id: Number(raw.id ?? raw.branch_id ?? raw.branchId),
        branchName:
            raw.branchName ??
            raw.branch_name ??
            raw.name ??
            raw.branch ??
            "Unnamed Branch",
        managerName:
            raw.managerName ??
            raw.manager_name ??
            raw.manager ??
            "",
    };
}

function normalizeBooking(raw: any): Booking {
    const rawBranchId = raw.branchId ?? raw.branch_id ?? null;

    return {
        id: Number(raw.id ?? raw.booking_id),
        branchId: rawBranchId ? Number(rawBranchId) : null,
        branch_id: rawBranchId ? Number(rawBranchId) : null,
        branchName: raw.branchName ?? raw.branch_name ?? null,
        branch_name: raw.branch_name ?? raw.branchName ?? null,
        name: raw.name ?? raw.customer_name ?? "Unnamed Client",
        date: raw.date ?? raw.event_date ?? raw.created_at ?? "",
        status: raw.status ?? "Pending Review",
        packageName:
            raw.packageName ??
            raw.package_name ??
            raw.package ??
            raw.package_title ??
            raw.service_name ??
            "",
        eventName:
            raw.eventName ??
            raw.event_name ??
            raw.event ??
            raw.event_type ??
            "",
    };
}

function parseOrderItems(itemText?: string) {
    if (!itemText) return [];

    return itemText
        .split(",")
        .map((item) => {
            const [name, qty] = item.split(" x");

            return {
                name: name?.trim() || "",
                quantity: Number(qty || 0),
            };
        })
        .filter((item) => item.name);
}

function normalizeOrder(raw: any): Order {
    const rawBranchId = raw.branchId ?? raw.branch_id ?? null;

    return {
        id: raw.id ?? raw.orderId ?? raw.order_id,
        orderId: raw.orderId ?? raw.order_id ?? raw.id,
        branchId: rawBranchId ? Number(rawBranchId) : null,
        branch_id: rawBranchId ? Number(rawBranchId) : null,
        branchName: raw.branchName ?? raw.branch_name ?? null,
        branch_name: raw.branch_name ?? raw.branchName ?? null,
        total: Number(raw.total ?? 0),
        date: raw.date ?? raw.orderDate ?? raw.order_date ?? raw.createdAt ?? raw.created_at ?? "",
        orderDate: raw.orderDate ?? raw.order_date ?? raw.date ?? "",
        createdAt: raw.createdAt ?? raw.created_at ?? "",
        item: raw.item ?? "",
        items: Array.isArray(raw.items) ? raw.items : parseOrderItems(raw.item),
    };
}

function normalizeProduct(raw: any): Product {
    const rawBranchId = raw.branchId ?? raw.branch_id ?? null;

    const sellingPrice = Number(
        raw.salesPrice ??
        raw.sales_price ??
        raw.sellingPrice ??
        raw.selling_price ??
        raw.price ??
        0
    );

    const originalPrice = Number(
        raw.originalPrice ??
        raw.original_price ??
        raw.costPrice ??
        raw.cost_price ??
        raw.origPrice ??
        raw.orig_price ??
        0
    );

    return {
        id: Number(raw.id),
        branchId: rawBranchId ? Number(rawBranchId) : null,
        branch_id: rawBranchId ? Number(rawBranchId) : null,
        branchName: raw.branchName ?? raw.branch_name ?? null,
        branch_name: raw.branch_name ?? raw.branchName ?? null,
        name: raw.name ?? "",
        category: raw.category ?? "",
        stock: Number(raw.stock ?? 0),
        alertLevel: Number(raw.alertLevel ?? raw.alert_level ?? 0),
        salesPrice: sellingPrice,
        sales_price: sellingPrice,
        sellingPrice: sellingPrice,
        selling_price: sellingPrice,
        price: sellingPrice,
        originalPrice: originalPrice,
        original_price: originalPrice,
        costPrice: originalPrice,
        cost_price: originalPrice,
    };
}

function getBranchNameFromId(branches: Branch[], branchId?: number | null) {
    if (!branchId) return "";
    return branches.find((branch) => Number(branch.id) === Number(branchId))?.branchName || "";
}


export default function OwnerDashboard() {
    const router = useRouter();

    const [branches, setBranches] = useState<Branch[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [managers, setManagers] = useState<BranchManager[]>([]);

    useEffect(() => {
        async function loadOwnerDashboard() {
            const token = getSavedItem("token");
            const storeId =
                getSavedItem("store_id") ||
                getSavedItem("stocknbook_store_id");

            if (!token) return;

            try {
                const branchesRes = await fetch("/api/branches", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const branchesData = await branchesRes.json().catch(() => ({}));

                if (branchesRes.ok && Array.isArray(branchesData.branches)) {
                    setBranches(branchesData.branches.map(normalizeBranch));
                }
            } catch (error) {
                console.warn("Owner dashboard branches fetch failed:", error);
            }

            try {
                const bookingsRes = await fetch("/api/bookings", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        action: "get_bookings",
                        role: "owner",
                        store_id: storeId ? Number(storeId) : undefined,
                    }),
                });

                const bookingsData = await bookingsRes.json().catch(() => ({}));

                if (bookingsRes.ok && Array.isArray(bookingsData.bookings)) {
                    setBookings(bookingsData.bookings.map(normalizeBooking));
                }
            } catch (error) {
                console.warn("Owner dashboard bookings fetch failed:", error);
            }

            try {
                const productsRes = await fetch("/api/products", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        action: "get_products",
                    }),
                });

                const productsData = await productsRes.json().catch(() => ({}));

                if (productsRes.ok && Array.isArray(productsData.products)) {
                    setProducts(productsData.products.map(normalizeProduct));
                }
            } catch (error) {
                console.warn("Owner dashboard products fetch failed:", error);
            }

            try {
                const ordersRes = await fetch("/api/pos", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        action: "get_orders",
                    }),
                });

                const ordersData = await ordersRes.json().catch(() => ({}));

                if (ordersRes.ok && Array.isArray(ordersData.orders)) {
                    setOrders(ordersData.orders.map(normalizeOrder));
                }
            } catch (error) {
                console.warn("Owner dashboard orders fetch failed:", error);
            }

            try {
                const managerRes = await fetch("/api/branch-managers", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        action: "get_branch_managers",
                        store_id: storeId ? Number(storeId) : undefined,
                    }),
                });

                const managerData = await managerRes.json().catch(() => ({}));

                if (managerRes.ok && Array.isArray(managerData.managers)) {
                    setManagers(managerData.managers);
                } else if (managerRes.ok && Array.isArray(managerData.branchManagers)) {
                    setManagers(managerData.branchManagers);
                }
            } catch (error) {
                console.warn("Owner dashboard managers fetch failed:", error);
            }
        }

        void loadOwnerDashboard();

        window.addEventListener("focus", loadOwnerDashboard);

        return () => {
            window.removeEventListener("focus", loadOwnerDashboard);
        };
    }, []);

    const totalSales = orders.reduce(
        (sum, order) => sum + Number(order.total || 0),
        0
    );

    const activeManagers =
        managers.length > 0
            ? managers.filter((manager) => {
                const status = String(manager.status || "").toLowerCase();
                return status !== "inactive" && status !== "disabled";
            }).length
            : branches.filter((branch) => branch.managerName).length;

    const branchStats = useMemo(() => {
        return branches.map((branch) => {
            const branchProducts = products.filter((product) => {
                const productBranchId = product.branchId ?? product.branch_id;
                const productBranchName = product.branchName ?? product.branch_name;

                return (
                    String(productBranchId || "") === String(branch.id) ||
                    String(productBranchName || "").toLowerCase() ===
                    branch.branchName.toLowerCase()
                );
            });

            const productNames = new Set(
                branchProducts.map((product) => product.name.trim().toLowerCase())
            );

            const branchOrders = orders.filter((order) => {
                const orderBranchId = order.branchId ?? order.branch_id;
                const orderBranchName = order.branchName ?? order.branch_name;

                if (orderBranchId) {
                    return String(orderBranchId) === String(branch.id);
                }

                if (orderBranchName) {
                    return (
                        String(orderBranchName).toLowerCase() ===
                        branch.branchName.toLowerCase()
                    );
                }

                return (order.items || []).some((item) =>
                    productNames.has((item.name || "").trim().toLowerCase())
                );
            });

            return {
                branch,
                revenue: branchOrders.reduce(
                    (sum, order) => sum + Number(order.total || 0),
                    0
                ),
            };
        });
    }, [branches, bookings, orders, products]);

    const topPerformingBranches = useMemo(
        () =>
            [...branchStats]
                .sort((first, second) => second.revenue - first.revenue)
                .slice(0, 3),
        [branchStats]
    );

    const popularItems = useMemo(() => {
        const itemMap = orders.reduce<
            Record<string, { name: string; quantity: number }>
        >((accumulator, order) => {
            (order.items || []).forEach((item) => {
                const name = item.name?.trim() || "Unnamed item";

                if (!accumulator[name]) {
                    accumulator[name] = { name, quantity: 0 };
                }

                accumulator[name].quantity += Number(item.quantity || 0);
            });

            return accumulator;
        }, {});

        return Object.values(itemMap)
            .sort((first, second) => second.quantity - first.quantity)
            .slice(0, 3);
    }, [orders]);

    const mostBookedPackages = useMemo(() => {
        const packageMap = bookings.reduce<
            Record<string, { name: string; quantity: number }>
        >((accumulator, booking) => {
            const packageName = booking.packageName?.trim() || "Package booking";

            if (!accumulator[packageName]) {
                accumulator[packageName] = { name: packageName, quantity: 0 };
            }

            accumulator[packageName].quantity += 1;
            return accumulator;
        }, {});

        return Object.values(packageMap)
            .sort((first, second) => second.quantity - first.quantity)
            .slice(0, 3);
    }, [bookings]);

    const maxBranchRevenue = Math.max(
        ...topPerformingBranches.map((item) => item.revenue),
        1
    );
    const maxPopularQuantity = Math.max(
        ...popularItems.map((item) => item.quantity),
        1
    );
    const maxPackageBookings = Math.max(
        ...mostBookedPackages.map((item) => item.quantity),
        1
    );

    const recentBookings = useMemo(
        () =>
            [...bookings]
                .sort(
                    (first, second) =>
                        new Date(second.date || 0).getTime() -
                        new Date(first.date || 0).getTime()
                )
                .slice(0, 5),
        [bookings]
    );

    const inventoryAlerts = useMemo(
        () =>
            products
                .filter(
                    (product) =>
                        Number(product.stock || 0) <=
                        Number(product.alertLevel || 0)
                )
                .sort(
                    (first, second) =>
                        Number(first.stock || 0) - Number(second.stock || 0)
                )
                .slice(0, 5),
        [products]
    );

    // Keep the existing manager loading behavior available without displaying
    // an extra owner-dashboard card that is not present in the reference layout.
    void activeManagers;

    return (
        <>
            <div className="flex h-[54px] items-center justify-between border-b border-[#EBE4F0] bg-[#FDFAF4] px-5 font-sans">
                <div className="flex items-center gap-3">
                    <h1 className="text-[18px] font-medium text-[#1A1220]">
                        Dashboard
                    </h1>

                    <span className="rounded-[6px] bg-[#FFFBF0] px-3 py-1 text-[11px] font-medium text-[#633806]">
                        All branches
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="rounded-[7px] border border-[#EBE4F0] bg-white px-4 py-1.5 text-[11px] text-[#7A6E88]">
                        {new Date().toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric",
                        })}
                    </span>

                    <button className="flex h-[32px] w-[32px] items-center justify-center rounded-[7px] border border-[#EBE4F0] bg-white text-[12px] text-[#C9951A]">
                        ●
                    </button>

                    <div className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-[#C9951A] text-[12px] font-medium text-white">
                        YS
                    </div>
                </div>
            </div>

            <section className="p-5 font-sans">
                <div className="mx-auto max-w-[1500px] space-y-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <OwnerStatCard
                            title="Total Branches"
                            value={String(branches.length)}
                            note="Active branches"
                        />
                        <OwnerStatCard
                            title="Total Sales"
                            value={peso(totalSales)}
                            note="All branches revenue"
                        />
                        <OwnerStatCard
                            title="Total Booking"
                            value={String(bookings.length)}
                            note="System-wide"
                        />
                        <OwnerStatCard
                            title="Total Products"
                            value={String(products.length)}
                            note="Combined inventory"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
                        <OwnerDashboardCard className="min-h-[255px]">
                            <OwnerCardHeader title="Top Performing Branch Based on Sales" />

                            {topPerformingBranches.length === 0 ? (
                                <OwnerEmptyState text="No branch sales data yet." />
                            ) : (
                                <div className="space-y-4 pt-1">
                                    {topPerformingBranches.map((item, index) => (
                                        <OwnerRankedProgress
                                            key={item.branch.id}
                                            rank={index + 1}
                                            label={item.branch.branchName}
                                            value={peso(item.revenue)}
                                            percent={
                                                (item.revenue / maxBranchRevenue) * 100
                                            }
                                        />
                                    ))}
                                </div>
                            )}

                            <OwnerCardLegend text="Sales by branch" />
                        </OwnerDashboardCard>

                        <OwnerDashboardCard className="min-h-[255px]">
                            <OwnerCardHeader
                                title="Popular Items"
                                action="View all"
                                onAction={() => router.push("/analytics")}
                            />

                            {popularItems.length === 0 ? (
                                <OwnerEmptyState text="No popular item data yet." />
                            ) : (
                                <div className="space-y-4 pt-1">
                                    {popularItems.map((item, index) => (
                                        <OwnerRankedProgress
                                            key={item.name}
                                            rank={index + 1}
                                            label={item.name}
                                            value={`${item.quantity} sold`}
                                            percent={
                                                (item.quantity / maxPopularQuantity) * 100
                                            }
                                        />
                                    ))}
                                </div>
                            )}

                            <OwnerCardLegend text="Units sold system-wide" />
                        </OwnerDashboardCard>

                        <OwnerDashboardCard className="min-h-[255px]">
                            <OwnerCardHeader
                                title="Most Booked Packages"
                                action="View all"
                                onAction={() => router.push("/analytics")}
                            />

                            {mostBookedPackages.length === 0 ? (
                                <OwnerEmptyState text="No package bookings yet." />
                            ) : (
                                <div className="space-y-4 pt-1">
                                    {mostBookedPackages.map((item, index) => (
                                        <OwnerRankedProgress
                                            key={item.name}
                                            rank={index + 1}
                                            label={item.name}
                                            value={`${item.quantity} booking${
                                                item.quantity === 1 ? "" : "s"
                                            }`}
                                            percent={
                                                (item.quantity / maxPackageBookings) * 100
                                            }
                                        />
                                    ))}
                                </div>
                            )}

                            <OwnerCardLegend text="Bookings system-wide" />
                        </OwnerDashboardCard>
                    </div>

                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                        <OwnerDashboardCard className="overflow-hidden !p-0 shadow-[0_8px_22px_rgba(45,27,78,0.06)]">
                            <div className="border-b border-[#F0ECF5] px-4 py-3.5">
                                <OwnerTableCardHeader
                                    title="Recent Bookings"
                                    subtitle="Latest reservations across all branches"
                                    count={recentBookings.length}
                                    countLabel="bookings"
                                    action="View all bookings"
                                    onAction={() => router.push("/bookings")}
                                    tone="violet"
                                />
                            </div>

                            {recentBookings.length === 0 ? (
                                <div className="px-4 py-4">
                                    <OwnerEmptyState text="No recent bookings yet." />
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-hidden">
                                        <table className="w-full table-fixed border-collapse">
                                            <colgroup>
                                                <col className="w-[31%]" />
                                                <col className="w-[18%]" />
                                                <col className="w-[18%]" />
                                                <col className="w-[20%]" />
                                                <col className="w-[13%]" />
                                            </colgroup>
                                            <thead>
                                            <tr className="border-b border-[#F1EDF5] bg-[#FBFAFD]">
                                                <th className="px-3 py-2.5 text-left text-[8px] font-semibold uppercase tracking-[0.07em] text-[#776E84]">
                                                    Customer / Event
                                                </th>
                                                <th className="px-2 py-2.5 text-left text-[8px] font-semibold uppercase tracking-[0.07em] text-[#776E84]">
                                                    Branch
                                                </th>
                                                <th className="px-2 py-2.5 text-left text-[8px] font-semibold uppercase tracking-[0.07em] text-[#776E84]">
                                                    Schedule
                                                </th>
                                                <th className="px-2 py-2.5 text-left text-[8px] font-semibold uppercase tracking-[0.07em] text-[#776E84]">
                                                    Package
                                                </th>
                                                <th className="px-3 py-2.5 text-left text-[8px] font-semibold uppercase tracking-[0.07em] text-[#776E84]">
                                                    Status
                                                </th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {recentBookings.map((booking) => (
                                                <OwnerBookingTableRow
                                                    key={booking.id}
                                                    booking={booking}
                                                    branchName={
                                                        booking.branchName ||
                                                        booking.branch_name ||
                                                        getBranchNameFromId(
                                                            branches,
                                                            booking.branchId ??
                                                            booking.branch_id
                                                        ) ||
                                                        "Branch"
                                                    }
                                                />
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="flex items-center justify-center border-t border-[#F0ECF5] bg-[#FCFBFE] py-3">
                                        <button
                                            type="button"
                                            onClick={() => router.push("/bookings")}
                                            className="text-[10px] font-semibold text-[#3B1B88] transition hover:text-[#5B2FC6]"
                                        >
                                            View all bookings →
                                        </button>
                                    </div>
                                </>
                            )}
                        </OwnerDashboardCard>

                        <OwnerDashboardCard className="overflow-hidden !p-0 shadow-[0_8px_22px_rgba(45,27,78,0.06)]">
                            <div className="border-b border-[#F0ECF5] px-4 py-3.5">
                                <OwnerTableCardHeader
                                    title="Inventory Alerts"
                                    subtitle="Products that need attention or restocking"
                                    count={inventoryAlerts.length}
                                    countLabel="alerts"
                                    action="View all inventory"
                                    onAction={() => router.push("/inventory")}
                                    tone="red"
                                />
                            </div>

                            {inventoryAlerts.length === 0 ? (
                                <div className="px-4 py-4">
                                    <OwnerEmptyState text="All products are well stocked." />
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-hidden">
                                        <table className="w-full table-fixed border-collapse">
                                            <colgroup>
                                                <col className="w-[29%]" />
                                                <col className="w-[19%]" />
                                                <col className="w-[20%]" />
                                                <col className="w-[17%]" />
                                                <col className="w-[15%]" />
                                            </colgroup>
                                            <thead>
                                            <tr className="border-b border-[#F1EDF5] bg-[#FBFAFD]">
                                                <th className="px-3 py-2.5 text-left text-[8px] font-semibold uppercase tracking-[0.07em] text-[#776E84]">
                                                    Product
                                                </th>
                                                <th className="px-2 py-2.5 text-left text-[8px] font-semibold uppercase tracking-[0.07em] text-[#776E84]">
                                                    Branch
                                                </th>
                                                <th className="px-2 py-2.5 text-left text-[8px] font-semibold uppercase tracking-[0.07em] text-[#776E84]">
                                                    Category
                                                </th>
                                                <th className="px-2 py-2.5 text-left text-[8px] font-semibold uppercase tracking-[0.07em] text-[#776E84]">
                                                    Stock Level
                                                </th>
                                                <th className="px-3 py-2.5 text-right text-[8px] font-semibold uppercase tracking-[0.07em] text-[#776E84]">
                                                    Action
                                                </th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {inventoryAlerts.map((product) => (
                                                <OwnerInventoryAlertRow
                                                    key={product.id}
                                                    product={product}
                                                    branchName={
                                                        product.branchName ||
                                                        product.branch_name ||
                                                        getBranchNameFromId(
                                                            branches,
                                                            product.branchId ??
                                                            product.branch_id
                                                        ) ||
                                                        "Branch"
                                                    }
                                                    onRestock={() =>
                                                        router.push("/inventory")
                                                    }
                                                />
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="flex items-center justify-center border-t border-[#F0ECF5] bg-[#FCFBFE] py-3">
                                        <button
                                            type="button"
                                            onClick={() => router.push("/inventory")}
                                            className="text-[10px] font-semibold text-[#3B1B88] transition hover:text-[#5B2FC6]"
                                        >
                                            View all alerts →
                                        </button>
                                    </div>
                                </>
                            )}
                        </OwnerDashboardCard>
                    </div>
                </div>
            </section>
        </>
    );
}

function OwnerDashboardCard({
                                children,
                                className = "",
                            }: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={`rounded-[14px] border border-[#EBE4F0] bg-white p-4 shadow-sm ${className}`}
        >
            {children}
        </div>
    );
}

function OwnerStatCard({
                           title,
                           value,
                           note,
                       }: {
    title: string;
    value: string;
    note: string;
}) {
    return (
        <div className="h-[118px] rounded-[14px] border border-[#EBE4F0] bg-white p-4 shadow-sm">
            <p className="text-[12px] font-semibold text-[#1A1220]">
                {title}
            </p>
            <p className="mt-2 text-[27px] font-bold leading-none tracking-[-0.03em] text-[#1A1220]">
                {value}
            </p>
            <p className="mt-2 text-[11px] font-medium text-[#5B5273]">
                {note}
            </p>
        </div>
    );
}

function OwnerCardHeader({
                             title,
                             action,
                             onAction,
                         }: {
    title: string;
    action?: string;
    onAction?: () => void;
}) {
    return (
        <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="min-w-0 truncate text-[15px] font-semibold text-[#1A1220]">
                {title}
            </h2>

            {action && onAction && (
                <button
                    type="button"
                    onClick={onAction}
                    className="shrink-0 bg-transparent px-1 py-1 text-[10px] font-semibold text-[#2D1B4E] transition hover:text-[#5B2FC6]"
                >
                    {action}
                </button>
            )}
        </div>
    );
}

function OwnerTableCardHeader({
                                  title,
                                  subtitle,
                                  count,
                                  countLabel,
                                  action,
                                  onAction,
                                  tone,
                              }: {
    title: string;
    subtitle: string;
    count: number;
    countLabel: string;
    action: string;
    onAction: () => void;
    tone: "violet" | "red";
}) {
    const accentClass =
        tone === "red"
            ? "bg-[#FFE8E8] text-[#B42318]"
            : "bg-[#F0EBFF] text-[#4B21BD]";

    return (
        <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
                <div
                    className={`mb-2 h-1 w-8 rounded-full ${
                        tone === "red" ? "bg-[#DC2626]" : "bg-[#4B21BD]"
                    }`}
                />
                <h2 className="truncate text-[15px] font-semibold text-[#1A1220]">
                    {title}
                </h2>
                <p className="mt-1 truncate text-[10px] text-[#776E84]">
                    {subtitle}
                </p>
            </div>

            <div className="flex shrink-0 items-center gap-3 pt-1">
                <span
                    className={`rounded-full px-2.5 py-1 text-[9px] font-semibold ${accentClass}`}
                >
                    {count} {countLabel}
                </span>
                <button
                    type="button"
                    onClick={onAction}
                    className="text-[10px] font-semibold text-[#3B1B88] transition hover:text-[#5B2FC6]"
                >
                    {action} →
                </button>
            </div>
        </div>
    );
}

function OwnerRankedProgress({
                                 rank,
                                 label,
                                 value,
                                 percent,
                             }: {
    rank: number;
    label: string;
    value: string;
    percent: number;
}) {
    const rankClass =
        rank === 1
            ? "bg-[#EEE8F8] text-[#3B1B88]"
            : rank === 2
                ? "bg-[#FFF4D8] text-[#9A5A00]"
                : "bg-[#E8F0FF] text-[#1D4ED8]";

    const barColor =
        rank === 1 ? "#3B1B88" : rank === 2 ? "#D97706" : "#2563EB";

    return (
        <div>
            <div className="mb-1.5 flex items-center gap-2.5">
                <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${rankClass}`}
                >
                    {rank}
                </span>
                <p className="min-w-0 flex-1 truncate text-[11px] font-semibold text-[#1A1220]">
                    {label}
                </p>
                <p className="shrink-0 text-[10px] font-semibold text-[#1A1220]">
                    {value}
                </p>
            </div>

            <div className="ml-[34px] h-1.5 overflow-hidden rounded-full bg-[#EEE8F8]">
                <div
                    className="h-full rounded-full"
                    style={{
                        width: `${Math.max(Math.min(percent, 100), 8)}%`,
                        backgroundColor: barColor,
                    }}
                />
            </div>
        </div>
    );
}

function OwnerCardLegend({ text }: { text: string }) {
    return (
        <div className="mt-5 text-center text-[10px] font-medium text-[#5B5273]">
            {text}
        </div>
    );
}

function OwnerBookingTableRow({
                                  booking,
                                  branchName,
                              }: {
    booking: Booking;
    branchName: string;
}) {
    const { dateLabel, timeLabel } = formatDashboardDate(booking.date);
    const status = booking.status || "Pending Review";
    const normalizedStatus = status.trim().toLowerCase();

    const statusClass =
        normalizedStatus === "completed"
            ? "bg-[#E6F6EA] text-[#226B36]"
            : normalizedStatus === "confirmed"
                ? "bg-[#E8F0FF] text-[#1D4ED8]"
                : normalizedStatus === "preparing"
                    ? "bg-[#EFE7FF] text-[#5B2FC6]"
                    : normalizedStatus === "cancelled" ||
                    normalizedStatus === "canceled"
                        ? "bg-[#FFE5E5] text-[#9A2424]"
                        : "bg-[#FFF4D8] text-[#8A5A00]";

    return (
        <tr className="border-b border-[#F3EFF6] transition hover:bg-[#FCFAFF] last:border-b-0">
            <td className="px-3 py-3">
                <p
                    title={booking.name}
                    className="truncate text-[10px] font-semibold text-[#1A1220]"
                >
                    {booking.name}
                </p>
                <p
                    title={booking.eventName || "Booking reservation"}
                    className="mt-1 truncate text-[9px] text-[#665D79]"
                >
                    {booking.eventName || "Booking reservation"}
                </p>
            </td>

            <td className="px-2 py-3">
                <p
                    title={branchName}
                    className="truncate text-[9px] font-semibold text-[#3B1B88]"
                >
                    {branchName}
                </p>
            </td>

            <td className="px-2 py-3">
                <p className="truncate text-[9px] font-semibold text-[#1A1220]">
                    {dateLabel}
                </p>
                {timeLabel && (
                    <p className="mt-1 text-[8px] text-[#776E84]">
                        {timeLabel}
                    </p>
                )}
            </td>

            <td className="px-2 py-3">
                <p
                    title={booking.packageName || "Package booking"}
                    className="truncate text-[9px] font-medium text-[#1A1220]"
                >
                    {booking.packageName || "Package booking"}
                </p>
            </td>

            <td className="px-3 py-3">
                <span
                    className={`inline-flex max-w-full truncate rounded-full px-2.5 py-1 text-[8px] font-semibold ${statusClass}`}
                >
                    {normalizedStatus === "pending review" ? "Pending" : status}
                </span>
            </td>
        </tr>
    );
}

function OwnerInventoryAlertRow({
                                    product,
                                    branchName,
                                    onRestock,
                                }: {
    product: Product;
    branchName: string;
    onRestock: () => void;
}) {
    const unitsLeft = Number(product.stock || 0);
    const isOutOfStock = unitsLeft <= 0;

    return (
        <tr className="border-b border-[#F3EFF6] transition hover:bg-[#FFFCFC] last:border-b-0">
            <td className="px-3 py-3">
                <p
                    title={product.name}
                    className="truncate text-[10px] font-semibold text-[#1A1220]"
                >
                    {product.name}
                </p>
                <p
                    className={`mt-1 text-[8px] font-semibold ${
                        isOutOfStock ? "text-[#B42318]" : "text-[#B45309]"
                    }`}
                >
                    {isOutOfStock ? "Out of stock" : "Low stock"}
                </p>
            </td>

            <td className="px-2 py-3">
                <p
                    title={branchName}
                    className="truncate text-[9px] font-semibold text-[#3B1B88]"
                >
                    {branchName}
                </p>
            </td>

            <td className="px-2 py-3">
                <p
                    title={product.category || "Uncategorized"}
                    className="truncate text-[9px] text-[#4C4556]"
                >
                    {product.category || "Uncategorized"}
                </p>
            </td>

            <td className="px-2 py-3">
                <span
                    className={`inline-flex whitespace-nowrap rounded-full px-2 py-1 text-[9px] font-semibold ${
                        isOutOfStock
                            ? "bg-[#FFE8E8] text-[#B42318]"
                            : "bg-[#FFF4D8] text-[#9A5A00]"
                    }`}
                >
                    {unitsLeft} left
                </span>
            </td>

            <td className="px-3 py-3 text-right">
                <button
                    type="button"
                    onClick={onRestock}
                    className="whitespace-nowrap rounded-lg bg-[#F2EDFF] px-2.5 py-1.5 text-[9px] font-semibold text-[#3B1B88] transition hover:bg-[#E6DDFF]"
                >
                    Restock
                </button>
            </td>
        </tr>
    );
}

function OwnerEmptyState({ text }: { text: string }) {
    return (
        <div className="flex min-h-[150px] items-center justify-center rounded-xl border border-dashed border-[#E6DDF0] bg-[#FCFBFE] px-5 text-center">
            <p className="text-[11px] text-[#665D79]">{text}</p>
        </div>
    );
}

