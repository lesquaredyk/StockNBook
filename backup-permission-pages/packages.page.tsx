"use client";

import Link from "next/link";
import RoleSidebar from "@/components/RoleSidebar";
import { useEffect, useMemo, useState } from "react";

type DiscountType = "amount" | "percentage";

type PackageInclusion = {
    productId: number;
    productName: string;
    quantity: number;
    unitSalesPrice: number;
    lineValue: number;
};

type PackageItem = {
    id: number;
    name: string;
    description: string;
    original_value: number;
    discount_type: DiscountType;
    discount_value: number;
    package_price: number;
    duration: string;
    status: "Active" | "Inactive";
    inclusions: PackageInclusion[];
};

type Product = {
    id: number;
    name: string;
    salesPrice: number;
    stock: number;
};

export default function PackagesPage() {
    const [storeName, setStoreName] = useState("Store Name");
    const [storeId, setStoreId] = useState<number | null>(null);
    const [packages, setPackages] = useState<PackageItem[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [search, setSearch] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [duration, setDuration] = useState("");
    const [status, setStatus] = useState<"Active" | "Inactive">("Active");
    const [discountType, setDiscountType] = useState<DiscountType>("amount");
    const [discountValue, setDiscountValue] = useState("");
    const [inclusions, setInclusions] = useState<PackageInclusion[]>([]);
    const [selectedProductId, setSelectedProductId] = useState("");
    const [inclusionQty, setInclusionQty] = useState("");
    const [error, setError] = useState("");

    const labelClass = "text-xs font-semibold text-gray-600";
    const fieldClass =
        "w-full rounded-lg border border-gray-300 p-2 text-black placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-300";

    // ── Load store info + packages + products ──────────────────────
    useEffect(() => {
        const savedStoreName =
            localStorage.getItem("store_name") ||
            localStorage.getItem("stocknbook_store_name") ||
            "Store Name";
        const savedStoreId = localStorage.getItem("store_id");

        setStoreName(savedStoreName);

        if (savedStoreId) {
            const id = Number(savedStoreId);
            setStoreId(id);
            fetchPackages(id);
            fetchProducts(id);
        } else {
            setLoading(false);
        }
    }, []);

    async function fetchPackages(store_id: number) {
        try {
            const res = await fetch("/api/packages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "get_packages", store_id }),
            });
            const data = await res.json();
            setPackages(data.packages || []);
        } catch {
            setPackages([]);
        } finally {
            setLoading(false);
        }
    }

    async function fetchProducts(store_id: number) {
        try {
            const res = await fetch("/api/products", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getToken()}`,  // ← idagdag ito!
                },
                body: JSON.stringify({ action: "get_products", store_id }),
            });
            const data = await res.json();
            // salesPrice hindi sales_price
            setProducts(data.products || []);
        } catch {
            setProducts([]);
        }
    }

    // ── Computed values ────────────────────────────────────────────
    const originalValue = useMemo(
        () => inclusions.reduce((sum, item) => sum + item.lineValue, 0),
        [inclusions]
    );

    const discountNumber = Number(discountValue || 0);
    const computedDiscountAmount =
        discountType === "percentage"
            ? originalValue * (discountNumber / 100)
            : discountNumber;
    const discountAmount = Math.min(computedDiscountAmount, originalValue);
    const packagePrice = Math.max(originalValue - discountAmount, 0);

    const filteredPackages = useMemo(() => {
        const q = search.trim().toLowerCase();
        return packages.filter(
            (pkg) =>
                pkg.name.toLowerCase().includes(q) ||
                (pkg.description || "").toLowerCase().includes(q) ||
                (pkg.duration || "").toLowerCase().includes(q)
        );
    }, [packages, search]);

    // ── Helpers ────────────────────────────────────────────────────
    function peso(n: number) {
        return `₱${Number(n || 0).toLocaleString("en-PH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    }

    function getToken() {
        return localStorage.getItem("token") || "";
    }

    function resetForm() {
        setName("");
        setDescription("");
        setDuration("");
        setStatus("Active");
        setDiscountType("amount");
        setDiscountValue("");
        setEditingId(null);
        setInclusions([]);
        setSelectedProductId("");
        setInclusionQty("");
        setError("");
    }

    function openAddForm() {
        resetForm();
        setShowForm(true);
    }

    function handleEdit(pkg: PackageItem) {
        setEditingId(pkg.id);
        setName(pkg.name);
        setDescription(pkg.description || "");
        setDuration(pkg.duration || "");
        setStatus(pkg.status);
        setDiscountType(pkg.discount_type || "amount");
        setDiscountValue(String(pkg.discount_value || 0));
        setInclusions(pkg.inclusions || []);
        setError("");
        setShowForm(true);
    }

    async function handleDelete(id: number) {
        if (!confirm("Are you sure you want to delete this package?")) return;
        try {
            await fetch("/api/packages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify({ action: "delete_package", id }),
            });
            setPackages((prev) => prev.filter((pkg) => pkg.id !== id));
        } catch {
            alert("Failed to delete package.");
        }
    }

    function addInclusion() {
        const product = products.find((p) => p.id === Number(selectedProductId));
        const qty = Number(inclusionQty);

        if (!product || qty <= 0) {
            setError("Please select a product and enter a valid quantity.");
            return;
        }

        const existing = inclusions.find((item) => item.productId === product.id);
        const currentQty = existing ? existing.quantity : 0;
        const totalQty = currentQty + qty;
        const unitSalesPrice = Number(product.salesPrice || 0);
        const lineValue = unitSalesPrice * totalQty;

        if (existing) {
            setInclusions((prev) =>
                prev.map((item) =>
                    item.productId === product.id
                        ? { ...item, quantity: totalQty, unitSalesPrice, lineValue }
                        : item
                )
            );
        } else {
            setInclusions((prev) => [
                ...prev,
                {
                    productId: product.id,
                    productName: product.name,
                    quantity: qty,
                    unitSalesPrice,
                    lineValue: unitSalesPrice * qty,
                },
            ]);
        }

        setSelectedProductId("");
        setInclusionQty("");
        setError("");
    }

    function removeInclusion(productId: number) {
        setInclusions((prev) => prev.filter((item) => item.productId !== productId));
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!name.trim()) { setError("Please enter package name."); return; }
        if (inclusions.length === 0) { setError("Please add at least one product inclusion."); return; }
        if (discountNumber < 0) { setError("Discount cannot be negative."); return; }
        if (discountType === "percentage" && discountNumber > 100) { setError("Percentage discount cannot exceed 100%."); return; }
        if (discountType === "amount" && discountNumber > originalValue) { setError("Discount cannot exceed original value."); return; }

        setSubmitting(true);

        const payload = {
            action: editingId ? "update_package" : "create_package",
            ...(editingId && { id: editingId }),
            name: name.trim(),
            description: description.trim(),
            original_value: originalValue,
            discount_type: discountType,
            discount_value: discountNumber,
            package_price: packagePrice,
            duration: duration.trim() || "N/A",
            status,
            inclusions,
        };

        try {
            const res = await fetch("/api/packages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (editingId) {
                setPackages((prev) =>
                    prev.map((pkg) =>
                        pkg.id === editingId ? { ...pkg, ...payload, id: editingId } : pkg
                    )
                );
            } else {
                // Re-fetch para makuha yung exact data from DB
                if (storeId) fetchPackages(storeId);
            }

            resetForm();
            setShowForm(false);
        } catch {
            setError("Failed to save package. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="flex min-h-screen bg-[#f5f6f8]">
            <RoleSidebar />

            <main className="flex-1 p-5">
                <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-[#1f2a44]">Packages</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Manage inventory-based package inclusions and owner-defined discounts
                        </p>
                    </div>
                    <button
                        onClick={openAddForm}
                        className="rounded-xl bg-linear-to-r from-[#8b5cf6] to-[#d946ef] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90"
                    >
                        + Add Package
                    </button>
                </div>

                <section className="rounded-2xl bg-white p-5 shadow-sm">
                    <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="text-sm font-semibold text-[#1f2a44]">Package List</h2>
                            <p className="mt-1 text-xs text-gray-400">
                                {filteredPackages.length} package{filteredPackages.length !== 1 ? "s" : ""}
                            </p>
                        </div>
                        <div className="w-full md:w-64">
                            <label className={labelClass}>Search Package</label>
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search packages..."
                                className={fieldClass}
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex min-h-[220px] items-center justify-center">
                            <p className="text-sm text-gray-400">Loading packages...</p>
                        </div>
                    ) : filteredPackages.length === 0 ? (
                        <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-[#fafafa]">
                            <p className="text-sm text-gray-500">No packages yet.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1000px] text-sm">
                                <thead className="text-xs uppercase text-gray-500">
                                <tr className="border-b border-gray-100">
                                    <th className="pb-3 text-left font-semibold">Package</th>
                                    <th className="pb-3 text-left font-semibold">Inclusions</th>
                                    <th className="pb-3 text-center font-semibold">Duration</th>
                                    <th className="pb-3 text-center font-semibold">Original Value</th>
                                    <th className="pb-3 text-center font-semibold">Discount</th>
                                    <th className="pb-3 text-center font-semibold">Final Price</th>
                                    <th className="pb-3 text-center font-semibold">Status</th>
                                    <th className="pb-3 text-center font-semibold">Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredPackages.map((pkg) => (
                                    <tr key={pkg.id} className="border-b border-gray-100 last:border-0">
                                        <td className="py-4">
                                            <p className="font-medium text-[#1f2a44]">{pkg.name}</p>
                                            <p className="mt-1 text-xs text-gray-500">{pkg.description || "-"}</p>
                                        </td>
                                        <td className="py-4 text-gray-600">
                                            <div className="space-y-1">
                                                {(pkg.inclusions || []).map((item) => (
                                                    <div key={item.productId}>
                                                        {item.productName} x{item.quantity} — {peso(item.lineValue)}
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="py-4 text-center text-gray-700">{pkg.duration}</td>
                                        <td className="py-4 text-center font-semibold text-gray-700">{peso(pkg.original_value)}</td>
                                        <td className="py-4 text-center font-semibold text-green-600">
                                            {pkg.discount_type === "percentage"
                                                ? `${pkg.discount_value}%`
                                                : peso(pkg.discount_value)}
                                        </td>
                                        <td className="py-4 text-center font-semibold text-purple-600">{peso(pkg.package_price)}</td>
                                        <td className="py-4 text-center">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            pkg.status === "Active" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"
                        }`}>
                          {pkg.status}
                        </span>
                                        </td>
                                        <td className="py-4 text-center">
                                            <button onClick={() => handleEdit(pkg)} className="mr-3 text-sm font-medium text-blue-500 hover:text-blue-600">Edit</button>
                                            <button onClick={() => handleDelete(pkg.id)} className="text-sm font-medium text-red-500 hover:text-red-600">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                        <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="font-semibold text-black">{editingId ? "Edit Package" : "Add Package"}</h2>
                                <button onClick={() => { resetForm(); setShowForm(false); }} className="text-gray-500 hover:text-black">✕</button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-3">
                                <div className="space-y-1">
                                    <label className={labelClass}>Package Name</label>
                                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Birthday Basic Package" className={fieldClass} />
                                </div>

                                <div className="space-y-1">
                                    <label className={labelClass}>Description</label>
                                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short package details or notes" className={`${fieldClass} min-h-20 resize-none`} />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <label className={labelClass}>Duration</label>
                                        <input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g. 3 hours" className={fieldClass} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className={labelClass}>Status</label>
                                        <select value={status} onChange={(e) => setStatus(e.target.value as "Active" | "Inactive")} className={fieldClass}>
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                                    <label className={labelClass}>Package Inclusions from Inventory</label>
                                    {error && <div className="mt-2 rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-600">{error}</div>}

                                    <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-4">
                                        <select value={selectedProductId} onChange={(e) => { setSelectedProductId(e.target.value); setError(""); }} className={`${fieldClass} md:col-span-2`}>
                                            <option value="">Select product</option>
                                            {products.map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.name} — {peso(p.salesPrice)} — Stock: {p.stock}
                                                </option>
                                            ))}
                                        </select>
                                        <input type="number" min="1" value={inclusionQty} onChange={(e) => { setInclusionQty(e.target.value); setError(""); }} placeholder="Qty" className={fieldClass} />
                                        <button type="button" onClick={addInclusion} className="rounded-lg bg-purple-500 px-3 py-2 text-xs font-medium text-white hover:bg-purple-600">+ Add</button>
                                    </div>

                                    <div className="mt-3 space-y-2">
                                        {inclusions.length === 0 ? (
                                            <p className="text-xs text-gray-400">No inclusions added yet.</p>
                                        ) : (
                                            inclusions.map((item) => (
                                                <div key={item.productId} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm text-black">
                                                    <span>{item.productName} x{item.quantity} — {peso(item.lineValue)}</span>
                                                    <button type="button" onClick={() => removeInclusion(item.productId)} className="text-xs font-semibold text-red-500 hover:text-red-600">Remove</button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <label className={labelClass}>Discount Type</label>
                                        <select value={discountType} onChange={(e) => { setDiscountType(e.target.value as DiscountType); setDiscountValue(""); setError(""); }} className={fieldClass}>
                                            <option value="amount">Amount</option>
                                            <option value="percentage">Percentage</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className={labelClass}>Discount {discountType === "percentage" ? "(%)" : "(₱)"}</label>
                                        <input type="number" min="0" max={discountType === "percentage" ? 100 : originalValue} value={discountValue} onChange={(e) => { setDiscountValue(e.target.value); setError(""); }} placeholder={discountType === "percentage" ? "e.g. 10" : "e.g. 500"} className={fieldClass} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2 rounded-xl bg-purple-50 p-3 text-center text-sm">
                                    <div>
                                        <p className="text-xs text-gray-500">Original Value</p>
                                        <p className="font-bold text-gray-800">{peso(originalValue)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Discount</p>
                                        <p className="font-bold text-green-600">{discountType === "percentage" ? `${discountNumber || 0}%` : peso(discountNumber)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Final Package Price</p>
                                        <p className="font-bold text-purple-600">{peso(packagePrice)}</p>
                                    </div>
                                </div>

                                <button type="submit" disabled={submitting} className="w-full rounded-lg bg-linear-to-r from-purple-500 to-pink-500 py-2 text-white transition hover:opacity-90 disabled:opacity-60">
                                    {submitting ? "Saving..." : editingId ? "Update Package" : "Save Package"}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}





