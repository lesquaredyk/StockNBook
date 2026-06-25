"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useInventoryController } from "@/hooks/useInventory";
import {
    InventoryDialogs,
    type Product as InventoryProduct,
} from "@/components/inventory/_shared";

type Product = {
    id: number;
    branchId?: number | null;
    branch_id?: number | null;
    name: string;
    category: string;
    stock: number;
    alertLevel: number;
    alert_level?: number;
    originalPrice: number;
    original_price?: number;
    salesPrice: number;
    sales_price?: number;
    hasVariants?: boolean;
};

type ProductApiRaw = {
    id: number | string;
    branchId?: number | string | null;
    branch_id?: number | string | null;
    name: string;
    category?: string;
    stock?: number | string;
    alertLevel?: number | string;
    alert_level?: number | string;
    originalPrice?: number | string;
    original_price?: number | string;
    salesPrice?: number | string;
    sales_price?: number | string;
    hasVariants?: boolean;
    has_variants?: boolean;
};

type Order = {
    id?: string;
    orderId?: string;
    branchId?: number | null;
    branch_id?: number | null;
    total?: number;
    date?: string;
    orderDate?: string;
    createdAt?: string;
    item?: string;
    items?: {
        name?: string;
        quantity?: number;
    }[];
};

type OrderApiRaw = {
    id?: string;
    orderId?: string;
    order_id?: string;
    branchId?: number | string | null;
    branch_id?: number | string | null;
    total?: number | string;
    date?: string;
    orderDate?: string;
    order_date?: string;
    createdAt?: string;
    created_at?: string;
    item?: string;
    items?: {
        name?: string;
        quantity?: number;
    }[];
};

type Booking = {
    id: number;
    branchId?: number | null;
    branch_id?: number | null;
    date: string;
    name: string;
    status?: string;
    packageName?: string;
    eventName?: string;
};

type BookingApiRaw = {
    id?: number | string;
    booking_id?: number | string;
    branchId?: number | string | null;
    branch_id?: number | string | null;
    date?: string;
    event_date?: string;
    name?: string;
    customer_name?: string;
    status?: string;
    packageName?: string;
    package_name?: string;
    package?: string;
    package_title?: string;
    service_name?: string;
    eventName?: string;
    event_name?: string;
    event?: string;
    event_type?: string;
};

const STORAGE_KEY = "stocknbook_inventory_products";
const ORDERS_KEY = "stocknbook_orders";

function getSavedItem(key: string) {
    if (typeof window === "undefined") return "";
    return sessionStorage.getItem(key) || localStorage.getItem(key) || "";
}

function getSavedJson<T>(key: string, fallback: T): T {
    try {
        if (typeof window === "undefined") return fallback;

        const raw =
            sessionStorage.getItem(key) ||
            localStorage.getItem(key) ||
            "";

        return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
        return fallback;
    }
}

function getSavedPermissions() {
    try {
        return JSON.parse(
            sessionStorage.getItem("permissions") ||
            localStorage.getItem("permissions") ||
            "{}"
        );
    } catch {
        return {};
    }
}

function getUserValue(user: unknown, key: string) {
    if (!user || typeof user !== "object") return "";
    return String((user as Record<string, unknown>)[key] ?? "");
}

function mapProduct(p: ProductApiRaw): Product {
    const rawBranchId = p.branchId ?? p.branch_id ?? null;

    return {
        id: Number(p.id),
        branchId: rawBranchId ? Number(rawBranchId) : null,
        branch_id: rawBranchId ? Number(rawBranchId) : null,
        name: String(p.name ?? ""),
        category: String(p.category ?? ""),
        stock: Number(p.stock ?? 0),
        alertLevel: Number(p.alertLevel ?? p.alert_level ?? 0),
        alert_level: Number(p.alertLevel ?? p.alert_level ?? 0),
        originalPrice: Number(p.originalPrice ?? p.original_price ?? 0),
        original_price: Number(p.originalPrice ?? p.original_price ?? 0),
        salesPrice: Number(p.salesPrice ?? p.sales_price ?? 0),
        sales_price: Number(p.salesPrice ?? p.sales_price ?? 0),
        hasVariants: Boolean(p.hasVariants ?? p.has_variants ?? false),
    };
}

function toInventoryProduct(
    product: Product,
    branchName: string
): InventoryProduct {
    return {
        id: Number(product.id),
        branchId: product.branchId ?? product.branch_id ?? null,
        branchName,
        name: product.name,
        category: product.category,
        stock: Number(product.stock || 0),
        alertLevel: Number(product.alertLevel || 0),
        originalPrice: Number(product.originalPrice ?? product.original_price ?? 0),
        salesPrice: Number(product.salesPrice ?? product.sales_price ?? 0),
        hasVariants: Boolean(product.hasVariants),
        variants: [],
    };
}

function toDashboardProduct(product: InventoryProduct): Product {
    return {
        id: Number(product.id),
        branchId: product.branchId ?? null,
        branch_id: product.branchId ?? null,
        name: product.name,
        category: product.category,
        stock: Number(product.stock || 0),
        alertLevel: Number(product.alertLevel || 0),
        alert_level: Number(product.alertLevel || 0),
        originalPrice: Number(product.originalPrice || 0),
        original_price: Number(product.originalPrice || 0),
        salesPrice: Number(product.salesPrice || 0),
        sales_price: Number(product.salesPrice || 0),
        hasVariants: Boolean(product.hasVariants),
    };
}

function normalizeBooking(raw: BookingApiRaw): Booking {
    const rawBranchId = raw.branchId ?? raw.branch_id ?? null;

    return {
        id: Number(raw.id ?? raw.booking_id),
        branchId: rawBranchId ? Number(rawBranchId) : null,
        branch_id: rawBranchId ? Number(rawBranchId) : null,
        date: raw.date ?? raw.event_date ?? "",
        name: raw.name ?? raw.customer_name ?? "",
        status: raw.status ?? "Pending Review",
        packageName: String(
            raw.packageName ??
            raw.package_name ??
            raw.package ??
            raw.package_title ??
            raw.service_name ??
            ""
        ),
        eventName: String(
            raw.eventName ??
            raw.event_name ??
            raw.event ??
            raw.event_type ??
            ""
        ),
    };
}

function parseOrderItems(itemText?: string) {
    if (!itemText) return [];

    return itemText
        .split(",")
        .map((s) => {
            const [name, qty] = s.split(" x");

            return {
                name: name?.trim() || "Unnamed item",
                quantity: Number(qty || 0),
            };
        })
        .filter((item) => item.name);
}

function normalizeOrder(raw: OrderApiRaw): Order {
    const rawBranchId = raw.branchId ?? raw.branch_id ?? null;

    return {
        id: raw.id ?? raw.orderId ?? raw.order_id,
        orderId: raw.orderId ?? raw.order_id ?? raw.id,
        branchId: rawBranchId ? Number(rawBranchId) : null,
        branch_id: rawBranchId ? Number(rawBranchId) : null,
        total: Number(raw.total ?? 0),
        date: raw.date ?? raw.orderDate ?? raw.order_date ?? raw.createdAt ?? raw.created_at ?? "",
        orderDate: raw.orderDate ?? raw.order_date ?? raw.date ?? "",
        createdAt: raw.createdAt ?? raw.created_at ?? "",
        item: raw.item ?? "",
        items: Array.isArray(raw.items) ? raw.items : parseOrderItems(raw.item),
    };
}

function filterByBranch<T extends { branchId?: number | null; branch_id?: number | null }>(
    items: T[],
    branchId: string
) {
    if (!branchId) return items;

    const hasBranchIds = items.some((item) => item.branchId || item.branch_id);

    if (!hasBranchIds) return items;

    return items.filter((item) => {
        const itemBranchId = item.branchId ?? item.branch_id;
        return String(itemBranchId) === String(branchId);
    });
}

async function loadBranchStaffCount(token: string, branchId: string, storeId: string) {
    const possibleActions = [
        "get_staff",
        "get_staff_members",
        "get_branch_staff",
        "get_staff_by_branch",
        "get_users",
    ];

    for (const action of possibleActions) {
        try {
            const res = await fetch("/api/staff-management", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    action,
                    store_id: Number(storeId),
                    branch_id: Number(branchId),
                    branchId: Number(branchId),
                }),
            });

            const text = await res.text();
            const data = text ? JSON.parse(text) : {};

            if (!res.ok) continue;

            if (Array.isArray(data.staff)) return data.staff.length;
            if (Array.isArray(data.staffMembers)) return data.staffMembers.length;
            if (Array.isArray(data.users)) return data.users.length;
            if (Array.isArray(data.members)) return data.members.length;
            if (Array.isArray(data.data)) return data.data.length;
        } catch {
            // Try next possible action.
        }
    }

    return 0;
}

function formatBookingDate(date: string) {
    if (!date) {
        return { dateLabel: "—", timeLabel: "" };
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
        return {
            dateLabel: date.slice(0, 10),
            timeLabel: date.length > 10 ? date.slice(11, 16) : "",
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

export default function ManagerDashboard() {
    const { user } = useCurrentUser();
    const inventoryController = useInventoryController();

    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [branchName, setBranchName] = useState("Branch");
    const [permissions, setPermissions] = useState<Record<string, boolean>>({});
    const [activeStaffCount, setActiveStaffCount] = useState(0);

    const [showAlertsModal, setShowAlertsModal] = useState(false);
    const [alertFilter, setAlertFilter] = useState<"all" | "low" | "out">("all");
    const [inventoryEditWasOpen, setInventoryEditWasOpen] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            const currentBranchName =
                getUserValue(user, "branch_name") ||
                getSavedItem("branch_name") ||
                getSavedItem("stocknbook_branch_name") ||
                "Branch";

            const branchId =
                getUserValue(user, "branch_id") ||
                getSavedItem("branch_id") ||
                getSavedItem("stocknbook_branch_id");

            const storeId =
                getUserValue(user, "store_id") ||
                getSavedItem("store_id") ||
                getSavedItem("stocknbook_store_id");

            const token = getSavedItem("token");

            setBranchName(currentBranchName);

            setPermissions(
                user && typeof user === "object" && "permissions" in user
                    ? ((user as { permissions?: Record<string, boolean> }).permissions || {})
                    : getSavedPermissions()
            );

            const savedProducts = getSavedJson<Product[]>(STORAGE_KEY, []);
            setProducts(filterByBranch(savedProducts, branchId));

            const savedOrders = getSavedJson<Order[]>(ORDERS_KEY, []);
            setOrders(filterByBranch(savedOrders, branchId));

            if (!token || !branchId) {
                setBookings([]);
                setActiveStaffCount(0);
                return;
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
                        branch_id: Number(branchId),
                    }),
                });

                const productsText = await productsRes.text();
                const productsData = productsText ? JSON.parse(productsText) : {};

                if (productsRes.ok && Array.isArray(productsData.products)) {
                    const scopedProducts = productsData.products.map(mapProduct);
                    setProducts(scopedProducts);
                    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(scopedProducts));
                }
            } catch (error) {
                console.warn("Manager dashboard products fetch failed:", error);
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
                        branch_id: Number(branchId),
                    }),
                });

                const ordersText = await ordersRes.text();
                const ordersData: { orders?: OrderApiRaw[] } = ordersText
                    ? JSON.parse(ordersText)
                    : {};

                if (ordersRes.ok && Array.isArray(ordersData.orders)) {
                    const normalizedOrders: Order[] = ordersData.orders.map(normalizeOrder);

                    const currentBranchProducts: Product[] = products.length
                        ? products
                        : getSavedJson<Product[]>(STORAGE_KEY, []);

                    const branchProductNames = new Set(
                        currentBranchProducts
                            .filter((product: Product) => {
                                const productBranchId = product.branchId ?? product.branch_id;
                                return !productBranchId || String(productBranchId) === String(branchId);
                            })
                            .map((product: Product) => product.name.trim().toLowerCase())
                    );

                    const hasOrderBranchIds = normalizedOrders.some((order: Order) => {
                        return Boolean(order.branchId ?? order.branch_id);
                    });

                    const scopedOrders = hasOrderBranchIds
                        ? normalizedOrders.filter((order: Order) => {
                            const orderBranchId = order.branchId ?? order.branch_id;
                            return String(orderBranchId) === String(branchId);
                        })
                        : normalizedOrders.filter((order: Order) => {
                            return (order.items || []).some((item) =>
                                branchProductNames.has((item.name || "").trim().toLowerCase())
                            );
                        });

                    setOrders(scopedOrders);
                    sessionStorage.setItem(ORDERS_KEY, JSON.stringify(scopedOrders));
                }
            } catch (error) {
                console.warn("Manager dashboard orders fetch failed:", error);
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
                        role: "manager",
                        store_id: storeId ? Number(storeId) : undefined,
                        branch_id: Number(branchId),
                    }),
                });

                const bookingsText = await bookingsRes.text();
                const bookingsData = bookingsText ? JSON.parse(bookingsText) : {};

                if (bookingsRes.ok && Array.isArray(bookingsData.bookings)) {
                    setBookings(bookingsData.bookings.map(normalizeBooking));
                } else {
                    setBookings([]);
                }
            } catch (error) {
                console.warn("Manager dashboard bookings fetch failed:", error);
                setBookings([]);
            }

            if (storeId) {
                const staffCount = await loadBranchStaffCount(
                    token,
                    String(branchId),
                    String(storeId)
                );

                setActiveStaffCount(staffCount);
            } else {
                setActiveStaffCount(0);
            }
        };

        void loadData();
        window.addEventListener("focus", loadData);

        return () => {
            window.removeEventListener("focus", loadData);
        };
    }, [user]);

    const canAccess = (permission: string) => {
        return permissions[permission] === true;
    };

    const initials = branchName
        .split(" ")
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    const totalSales = orders.reduce(
        (sum, order) => sum + Number(order.total || 0),
        0
    );

    const totalRevenue = orders.reduce((orderSum, order) => {
        const orderRevenue = (order.items || []).reduce((itemSum, item) => {
            const product = products.find(
                (product) =>
                    product.name.trim().toLowerCase() ===
                    (item.name || "").trim().toLowerCase()
            );

            const sellingPrice = Number(
                product?.salesPrice ??
                product?.sales_price ??
                0
            );

            const originalPrice = Number(
                product?.originalPrice ??
                product?.original_price ??
                0
            );

            const quantity = Number(item.quantity || 1);

            return itemSum + Math.max(sellingPrice - originalPrice, 0) * quantity;
        }, 0);

        return orderSum + orderRevenue;
    }, 0);

    const totalBookings = bookings.length;
    const totalProducts = products.length;

    const allAlertItems = products.filter(
        (product) => product.stock <= product.alertLevel
    );
    const lowStockAlertItems = allAlertItems.filter(
        (product) => product.stock > 0
    );
    const outOfStockAlertItems = allAlertItems.filter(
        (product) => product.stock <= 0
    );

    const modalAlertItems =
        alertFilter === "low"
            ? lowStockAlertItems
            : alertFilter === "out"
                ? outOfStockAlertItems
                : allAlertItems;

    const lowStockItems = allAlertItems.slice(0, 3);
    const recentBookings = bookings.slice(0, 3);

    const popularItems = Object.values(
        orders.reduce<Record<string, { name: string; quantity: number }>>((acc, order) => {
            (order.items || []).forEach((item) => {
                const name = item.name || "Unnamed item";
                const quantity = item.quantity || 0;

                if (!acc[name]) {
                    acc[name] = { name, quantity: 0 };
                }

                acc[name].quantity += quantity;
            });

            return acc;
        }, {})
    )
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 3);

    const mostBookedPackages = Object.values(
        bookings.reduce<Record<string, { name: string; quantity: number }>>(
            (acc, booking) => {
                const packageName = booking.packageName?.trim() || "Package booking";

                if (!acc[packageName]) {
                    acc[packageName] = { name: packageName, quantity: 0 };
                }

                acc[packageName].quantity += 1;
                return acc;
            },
            {}
        )
    )
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 3);

    const popularMax = Math.max(...popularItems.map((item) => item.quantity), 1);
    const packageMax = Math.max(...mostBookedPackages.map((item) => item.quantity), 1);

    const openInventoryEditProduct = (product: Product) => {
        const matchingInventoryProduct = inventoryController.products.find(
            (inventoryProduct) =>
                Number(inventoryProduct.id) === Number(product.id)
        );

        inventoryController.handleEditProduct(
            matchingInventoryProduct ?? toInventoryProduct(product, branchName)
        );
    };

    const inventoryEditOpen =
        inventoryController.showForm &&
        inventoryController.editingId !== null;

    useEffect(() => {
        if (inventoryEditOpen) {
            setInventoryEditWasOpen(true);
            return;
        }

        if (!inventoryEditWasOpen) return;

        const activeBranchId =
            getUserValue(user, "branch_id") ||
            getSavedItem("branch_id") ||
            getSavedItem("stocknbook_branch_id");

        const refreshedProducts = filterByBranch(
            inventoryController.products.map(toDashboardProduct),
            activeBranchId
        );

        if (refreshedProducts.length > 0) {
            setProducts(refreshedProducts);
            sessionStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(refreshedProducts)
            );
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(refreshedProducts)
            );
        }

        setInventoryEditWasOpen(false);
    }, [
        inventoryEditOpen,
        inventoryEditWasOpen,
        inventoryController.products,
        user,
    ]);

    // The active-staff data loading stays untouched; this keeps the original dashboard data flow intact.
    void activeStaffCount;

    return (
        <>
            <main className="min-w-0 flex-1 overflow-x-hidden bg-[#FDFAF4] text-[#1A1220]">
                <div className="flex h-[54px] items-center justify-between border-b border-[#EBE4F0] bg-[#FDFAF4] px-5">
                    <div className="flex items-center gap-3">
                        <h1 className="text-[18px] font-medium text-[#1A1220]">
                            Dashboard
                        </h1>

                        <span className="rounded-[6px] bg-[#EEE8F8] px-3 py-1 text-[11px] font-medium text-[#2D1B4E]">
                        {branchName}
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
                            {initials}
                        </div>
                    </div>
                </div>

                {/* Dashboard content only: header and sidebar remain unchanged. */}
                <section className="p-5 font-sans">
                    <div className="mx-auto max-w-[1500px] space-y-4">
                        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                            <MetricCard
                                title="Total Sales"
                                value={canAccess("pos") ? `₱${totalSales.toLocaleString("en-PH")}` : "—"}
                                subtext={canAccess("pos") ? `₱${totalRevenue.toLocaleString("en-PH")} revenue` : "No access"}
                            />

                            <MetricCard
                                title="Total Booking"
                                value={canAccess("bookings") ? String(totalBookings) : "—"}
                                subtext={canAccess("bookings") ? "This month" : "No access"}
                            />

                            <MetricCard
                                title="Total Products"
                                value={canAccess("inventory") ? String(totalProducts) : "—"}
                                subtext={canAccess("inventory") ? "In inventory" : "No access"}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                            <DashboardPanel className="min-h-[282px]">
                                <PanelHeading
                                    title="Popular Items"
                                    action="View all"
                                    href="/analytics"
                                />

                                {canAccess("pos") ? (
                                    popularItems.length > 0 ? (
                                        <div className="space-y-5 pt-2">
                                            {popularItems.map((item, index) => (
                                                <RankedProgressRow
                                                    key={item.name}
                                                    rank={index + 1}
                                                    label={item.name}
                                                    value={`${item.quantity} sold`}
                                                    percent={(item.quantity / popularMax) * 100}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <DashboardEmptyText text="No popular items yet." />
                                    )
                                ) : (
                                    <DashboardEmptyText text="Popular items are hidden because POS access is not enabled." />
                                )}

                                <PanelLegend text="Units sold this month" />
                            </DashboardPanel>

                            <DashboardPanel className="min-h-[282px]">
                                <PanelHeading
                                    title="Most Booked Packages"
                                    action="View all"
                                    href="/analytics"
                                />

                                {canAccess("bookings") ? (
                                    mostBookedPackages.length > 0 ? (
                                        <div className="space-y-5 pt-2">
                                            {mostBookedPackages.map((item, index) => (
                                                <RankedProgressRow
                                                    key={item.name}
                                                    rank={index + 1}
                                                    label={item.name}
                                                    value={`${item.quantity} booking${item.quantity === 1 ? "" : "s"}`}
                                                    percent={(item.quantity / packageMax) * 100}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <DashboardEmptyText text="No package bookings yet." />
                                    )
                                ) : (
                                    <DashboardEmptyText text="Package bookings are hidden because booking access is not enabled." />
                                )}

                                <PanelLegend text="Bookings this month" />
                            </DashboardPanel>
                        </div>

                        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                            <DashboardPanel className="min-h-[324px] overflow-hidden !p-0 shadow-[0_8px_22px_rgba(45,27,78,0.06)]">
                                <div className="border-b border-[#F0ECF5] px-5 py-3.5">
                                    <ManagerTableHeader
                                        title="Upcoming Booking"
                                        subtitle="Next scheduled reservations for this branch"
                                        count={recentBookings.length}
                                        countLabel="bookings"
                                        action="View calendar"
                                        onAction={() => window.location.assign("/bookings")}
                                        tone="violet"
                                    />
                                </div>

                                {!canAccess("bookings") ? (
                                    <div className="px-5 py-4">
                                        <DashboardEmptyText text="Booking access is not enabled for this account." />
                                    </div>
                                ) : recentBookings.length === 0 ? (
                                    <div className="px-5 py-4">
                                        <DashboardEmptyText text="No upcoming bookings yet." />
                                    </div>
                                ) : (
                                    <>
                                        <div className="overflow-hidden">
                                            <table className="w-full table-fixed border-collapse">
                                                <colgroup>
                                                    <col className="w-[32%]" />
                                                    <col className="w-[22%]" />
                                                    <col className="w-[27%]" />
                                                    <col className="w-[19%]" />
                                                </colgroup>
                                                <thead>
                                                <tr className="border-b border-[#F1EDF5] bg-[#FBFAFD]">
                                                    <th className="px-4 py-2.5 text-left text-[8px] font-semibold uppercase tracking-[0.07em] text-[#776E84]">
                                                        Customer / Event
                                                    </th>
                                                    <th className="px-2 py-2.5 text-left text-[8px] font-semibold uppercase tracking-[0.07em] text-[#776E84]">
                                                        Schedule
                                                    </th>
                                                    <th className="px-2 py-2.5 text-left text-[8px] font-semibold uppercase tracking-[0.07em] text-[#776E84]">
                                                        Package
                                                    </th>
                                                    <th className="px-4 py-2.5 text-left text-[8px] font-semibold uppercase tracking-[0.07em] text-[#776E84]">
                                                        Status
                                                    </th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {recentBookings.map((booking) => (
                                                    <UpcomingBookingRow
                                                        key={booking.id}
                                                        booking={booking}
                                                    />
                                                ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="flex items-center justify-center border-t border-[#F0ECF5] bg-[#FCFBFE] py-3">
                                            <Link
                                                href="/bookings"
                                                className="text-[10px] font-semibold text-[#3B1B88] transition hover:text-[#5B2FC6]"
                                            >
                                                View all bookings →
                                            </Link>
                                        </div>
                                    </>
                                )}
                            </DashboardPanel>

                            <DashboardPanel className="min-h-[324px] overflow-hidden !p-0 shadow-[0_8px_22px_rgba(45,27,78,0.06)]">
                                <div className="border-b border-[#F0ECF5] px-5 py-3.5">
                                    <ManagerTableHeader
                                        title="Inventory Alerts"
                                        subtitle="Products that need attention or restocking"
                                        count={lowStockItems.length}
                                        countLabel="alerts"
                                        action="View all inventory"
                                        onAction={() => window.location.assign("/inventory")}
                                        tone="red"
                                    />
                                </div>

                                {!canAccess("inventory") ? (
                                    <div className="px-5 py-4">
                                        <DashboardEmptyText text="Inventory access is not enabled for this account." />
                                    </div>
                                ) : lowStockItems.length === 0 ? (
                                    <div className="px-5 py-4">
                                        <DashboardEmptyText text="All items are well stocked." />
                                    </div>
                                ) : (
                                    <>
                                        <div className="overflow-hidden">
                                            <table className="w-full table-fixed border-collapse">
                                                <colgroup>
                                                    <col className="w-[37%]" />
                                                    <col className="w-[25%]" />
                                                    <col className="w-[20%]" />
                                                    <col className="w-[18%]" />
                                                </colgroup>
                                                <thead>
                                                <tr className="border-b border-[#F1EDF5] bg-[#FBFAFD]">
                                                    <th className="px-4 py-2.5 text-left text-[8px] font-semibold uppercase tracking-[0.07em] text-[#776E84]">
                                                        Item
                                                    </th>
                                                    <th className="px-2 py-2.5 text-left text-[8px] font-semibold uppercase tracking-[0.07em] text-[#776E84]">
                                                        Category
                                                    </th>
                                                    <th className="px-2 py-2.5 text-left text-[8px] font-semibold uppercase tracking-[0.07em] text-[#776E84]">
                                                        Stock Level
                                                    </th>
                                                    <th className="px-4 py-2.5 text-right text-[8px] font-semibold uppercase tracking-[0.07em] text-[#776E84]">
                                                        Action
                                                    </th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {lowStockItems.map((product) => (
                                                    <InventoryAlertTableRow
                                                        key={product.id}
                                                        product={product}
                                                        onRestock={() => {
                                                            openInventoryEditProduct(product);
                                                        }}
                                                    />
                                                ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="flex items-center justify-center border-t border-[#F0ECF5] bg-[#FCFBFE] py-3">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setAlertFilter("all");
                                                    setShowAlertsModal(true);
                                                }}
                                                className="text-[10px] font-semibold text-[#3B1B88] transition hover:text-[#5B2FC6]"
                                            >
                                                View all alerts →
                                            </button>
                                        </div>
                                    </>
                                )}
                            </DashboardPanel>
                        </div>
                    </div>
                </section>

                {showAlertsModal && (
                    <RestockAlertsModal
                        items={modalAlertItems}
                        activeFilter={alertFilter}
                        lowStockCount={lowStockAlertItems.length}
                        outOfStockCount={outOfStockAlertItems.length}
                        onChangeFilter={setAlertFilter}
                        onClose={() => setShowAlertsModal(false)}
                        onRestock={(product) => {
                            setShowAlertsModal(false);
                            openInventoryEditProduct(product);
                        }}
                    />
                )}


            </main>

            <InventoryDialogs inv={inventoryController} />
        </>
    );
}

function DashboardPanel({
                            children,
                            className = "",
                        }: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={`rounded-[16px] border border-[#E6DDF0] bg-white p-5 shadow-sm ${className}`}
        >
            {children}
        </div>
    );
}

function MetricCard({
                        title,
                        value,
                        subtext,
                    }: {
    title: string;
    value: string;
    subtext: string;
}) {
    return (
        <div className="h-[112px] rounded-[14px] border border-[#E6DDF0] bg-white p-4 shadow-sm">
            <div className="flex h-full items-start justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#1A1220]">
                        {title}
                    </p>

                    <p className="mt-1 text-[24px] font-bold leading-tight tracking-[-0.03em] text-[#1A1220]">
                        {value}
                    </p>

                    <p className="mt-2 text-xs font-medium text-[#1A1220]">
                        {subtext}
                    </p>
                </div>


            </div>
        </div>
    );
}

function PanelHeading({
                          title,
                          action,
                          href,
                      }: {
    title: string;
    action: string;
    href: string;
}) {
    return (
        <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="min-w-0 truncate text-[16px] font-bold text-[#1A1220]">
                {title}
            </h2>

            <Link
                href={href}
                className="shrink-0 rounded-md bg-transparent px-1 py-1 text-[11px] font-semibold text-[#2B174C] transition hover:bg-transparent hover:text-[#5B2FC6]"
            >
                {action}
            </Link>
        </div>
    );
}

function ManagerTableHeader({
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

function RankedProgressRow({
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
        rank === 1
            ? "#3B1B88"
            : rank === 2
                ? "#D97706"
                : "#2563EB";

    return (
        <div>
            <div className="mb-2 flex items-center gap-3">
                <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] font-bold ${rankClass}`}
                >
                    {rank}
                </span>

                <p className="min-w-0 flex-1 truncate text-[13px] font-semibold text-[#1A1220]">
                    {label}
                </p>

                <p className="shrink-0 text-[11px] font-semibold text-[#1A1220]">
                    {value}
                </p>
            </div>

            <div className="ml-10 h-2 overflow-hidden rounded-full bg-[#EEE8F8]">
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

function PanelLegend({ text }: { text: string }) {
    return (
        <div className="mt-6 text-center text-[11px] font-medium text-[#1A1220]">
            {text}
        </div>
    );
}

function UpcomingBookingRow({ booking }: { booking: Booking }) {
    const { dateLabel, timeLabel } = formatBookingDate(booking.date);
    const status = booking.status || "Pending Review";
    const normalized = status.trim().toLowerCase();

    const statusClass =
        normalized === "completed"
            ? "bg-[#E6F6EA] text-[#226B36]"
            : normalized === "confirmed"
                ? "bg-[#E8F0FF] text-[#1D4ED8]"
                : normalized === "preparing"
                    ? "bg-[#F0EAFE] text-[#6B32BE]"
                    : normalized === "cancelled" || normalized === "canceled"
                        ? "bg-[#FFE5E5] text-[#9A2424]"
                        : "bg-[#FFF4D8] text-[#8A5A00]";

    const displayStatus =
        normalized === "pending review"
            ? "Pending"
            : status.charAt(0).toUpperCase() + status.slice(1);

    return (
        <tr className="border-b border-[#F3EFF6] transition hover:bg-[#FCFAFF] last:border-b-0">
            <td className="px-4 py-3">
                <p
                    title={booking.name || "Customer"}
                    className="truncate text-[10px] font-semibold text-[#1A1220]"
                >
                    {booking.name || "Customer"}
                </p>
                <p
                    title={booking.eventName || "Booking reservation"}
                    className="mt-1 truncate text-[9px] text-[#665D79]"
                >
                    {booking.eventName || "Booking reservation"}
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

            <td className="px-4 py-3">
                <span
                    className={`inline-flex max-w-full truncate rounded-full px-2.5 py-1 text-[8px] font-semibold ${statusClass}`}
                >
                    {displayStatus}
                </span>
            </td>
        </tr>
    );
}

function InventoryAlertTableRow({
                                    product,
                                    onRestock,
                                }: {
    product: Product;
    onRestock: () => void;
}) {
    const unitsLeft = Number(product.stock || 0);
    const isOutOfStock = unitsLeft <= 0;

    return (
        <tr className="border-b border-[#F3EFF6] transition hover:bg-[#FFFCFC] last:border-b-0">
            <td className="px-4 py-3">
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

            <td className="px-4 py-3 text-right">
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

function DashboardEmptyText({ text }: { text: string }) {
    return (
        <div className="flex min-h-[152px] items-center justify-center rounded-xl border border-dashed border-[#E6DDF0] bg-[#FCFBFF] px-5 text-center">
            <p className="text-[12px] leading-5 text-[#1A1220]">{text}</p>
        </div>
    );
}

function RestockAlertsModal({
                                items,
                                activeFilter,
                                lowStockCount,
                                outOfStockCount,
                                onChangeFilter,
                                onClose,
                                onRestock,
                            }: {
    items: Product[];
    activeFilter: "all" | "low" | "out";
    lowStockCount: number;
    outOfStockCount: number;
    onChangeFilter: (filter: "all" | "low" | "out") => void;
    onClose: () => void;
    onRestock: (product: Product) => void;
}) {
    const filterButtonClass = (
        isActive: boolean,
        tone: "all" | "low" | "out"
    ) => {
        if (tone === "all") {
            return isActive
                ? "bg-[#2B174C] text-white"
                : "border border-[#E6DDF0] bg-white text-[#6A5D6F] hover:bg-[#F7F1FF]";
        }

        if (tone === "low") {
            return isActive
                ? "bg-[#FFF8D8] text-[#8A5A00] ring-1 ring-[#F5D56B]"
                : "border border-[#E6DDF0] bg-white text-[#8A5A00] hover:bg-[#FFF8D8]";
        }

        return isActive
            ? "bg-[#FFE5E5] text-[#9A2424] ring-1 ring-[#F3A3A3]"
            : "border border-[#E6DDF0] bg-white text-[#9A2424] hover:bg-[#FFE5E5]";
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="dashboard-restock-alerts-title"
                className="w-full max-w-4xl rounded-2xl bg-white p-5 shadow-xl sm:p-6"
            >
                <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFF8D8] text-[#8A5A00]">
                            <span className="text-[20px] leading-none">⚠</span>
                        </div>

                        <div>
                            <h3
                                id="dashboard-restock-alerts-title"
                                className="font-serif text-xl font-semibold text-[#1A1220]"
                            >
                                Restock Alerts
                            </h3>

                            <p className="mt-1 text-sm text-[#6A5D6F]">
                                Low stock and out of stock items that need restocking.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close restock alerts"
                        className="text-xl text-[#9B8AAA] hover:text-[#1A1220]"
                    >
                        ×
                    </button>
                </div>

                <div className="mb-4 flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => onChangeFilter("all")}
                        className={[
                            "rounded-lg px-4 py-2 text-xs font-semibold",
                            filterButtonClass(activeFilter === "all", "all"),
                        ].join(" ")}
                    >
                        All
                    </button>

                    <button
                        type="button"
                        onClick={() => onChangeFilter("low")}
                        className={[
                            "rounded-lg px-4 py-2 text-xs font-semibold",
                            filterButtonClass(activeFilter === "low", "low"),
                        ].join(" ")}
                    >
                        Low Stock ({lowStockCount})
                    </button>

                    <button
                        type="button"
                        onClick={() => onChangeFilter("out")}
                        className={[
                            "rounded-lg px-4 py-2 text-xs font-semibold",
                            filterButtonClass(activeFilter === "out", "out"),
                        ].join(" ")}
                    >
                        Out of Stock ({outOfStockCount})
                    </button>
                </div>

                <div className="max-h-[420px] overflow-y-auto rounded-xl border border-[#E6DDF0]">
                    <table className="w-full table-fixed text-sm">
                        <colgroup>
                            <col className="w-[40%]" />
                            <col className="w-[27%]" />
                            <col className="w-[17%]" />
                            <col className="w-[16%]" />
                        </colgroup>

                        <thead>
                        <tr className="border-b border-[#E6DDF0] bg-[#FFFCF7]">
                            {["Product", "Category", "Current Stock", "Action"].map(
                                (heading) => (
                                    <th
                                        key={heading}
                                        className={`px-3 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#806A8C] ${
                                            heading === "Product"
                                                ? "text-left"
                                                : "text-center"
                                        }`}
                                    >
                                        {heading}
                                    </th>
                                )
                            )}
                        </tr>
                        </thead>

                        <tbody>
                        {items.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="px-3 py-8 text-center text-sm text-[#9B8AAA]"
                                >
                                    No stock alerts found.
                                </td>
                            </tr>
                        ) : (
                            items.map((product) => {
                                const isOutOfStock = product.stock <= 0;

                                return (
                                    <tr
                                        key={product.id}
                                        className="border-b border-[#EFE7F4] last:border-0"
                                    >
                                        <td className="px-3 py-3 text-left">
                                            <p className="truncate font-serif font-semibold text-[#1A1220]">
                                                {product.name}
                                            </p>

                                            <p
                                                className={[
                                                    "mt-0.5 text-[11px] font-semibold",
                                                    isOutOfStock
                                                        ? "text-[#9A2424]"
                                                        : "text-[#8A5A00]",
                                                ].join(" ")}
                                            >
                                                {isOutOfStock
                                                    ? "Out of Stock"
                                                    : "Low Stock"}
                                            </p>
                                        </td>

                                        <td className="px-3 py-3 text-center text-[#6A5D6F]">
                                                <span className="block truncate">
                                                    {product.category || "—"}
                                                </span>
                                        </td>

                                        <td
                                            className={[
                                                "px-3 py-3 text-center font-semibold",
                                                isOutOfStock
                                                    ? "text-[#9A2424]"
                                                    : "text-[#8A5A00]",
                                            ].join(" ")}
                                        >
                                            {product.stock}
                                        </td>

                                        <td className="px-3 py-3 text-center">
                                            <button
                                                type="button"
                                                onClick={() => onRestock(product)}
                                                className="rounded-lg border border-[#2B174C] px-3 py-1.5 text-xs font-semibold text-[#2B174C] hover:bg-[#F7F1FF]"
                                            >
                                                Restock
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

