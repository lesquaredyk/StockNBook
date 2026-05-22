"use client";

import Link from "next/link";
import RoleSidebar from "@/components/RoleSidebar";
import { useEffect, useState } from "react";
import {
  Check, X, Clock, MessageCircle, Package, Sparkles,
  ChevronRight, PhilippinePeso, Search, RefreshCw,
} from "lucide-react";

type Booking = {
  id: number;
  bookingReference?: string;
  bookingType?: string;
  name: string;
  facebookName?: string;
  phone?: string;
  date: string;
  eventTime?: string;
  eventType?: string;
  package?: string;
  customOrder?: string;
  theme?: string;
  venue?: string;
  notes?: string;
  status: string;
  agreed_price?: number | null;
  payment_status?: string;
  createdAt?: string;
};

const TABS = ["All", "Pending Review", "Confirmed", "Preparing", "Completed", "Cancelled"] as const;
type FilterType = (typeof TABS)[number];

const STATUS_STYLE: Record<string, string> = {
  "Pending Review": "bg-yellow-100 text-yellow-700",
  "Confirmed":      "bg-blue-100 text-blue-700",
  "Preparing":      "bg-purple-100 text-purple-700",
  "Completed":      "bg-green-100 text-green-700",
  "Cancelled":      "bg-red-100 text-red-700",
};

function peso(n?: number | null) {
  if (!n && n !== 0) return "—";
  return `₱${Number(n).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ─── Price Input Modal ────────────────────────────────────────────────────────

function PriceModal({
                      booking,
                      onConfirm,
                      onClose,
                    }: {
  booking: Booking;
  onConfirm: (price: number) => void;
  onClose: () => void;
}) {
  const [price, setPrice] = useState(booking.agreed_price?.toString() || "");
  const [error, setError] = useState("");

  function handleConfirm() {
    const parsed = parseFloat(price);
    if (!price || isNaN(parsed) || parsed <= 0) {
      setError("Please enter a valid price before confirming.");
      return;
    }
    onConfirm(parsed);
  }

  return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 px-4">
        <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
          <h3 className="text-lg font-bold text-[#1f2a44]">Set Agreed Price</h3>
          <p className="mt-1 text-sm text-gray-500">
            Enter the price agreed with <span className="font-semibold text-[#1f2a44]">{booking.name}</span> via Messenger before confirming.
          </p>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-semibold text-gray-700">Agreed Price (₱)</label>
            <div className="relative">
              <PhilippinePeso size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => { setPrice(e.target.value); setError(""); }}
                  placeholder="0.00"
                  className="w-full rounded-2xl border border-gray-200 py-3 pl-10 pr-4 outline-none focus:border-purple-400"
              />
            </div>
            {error && <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>}
          </div>

          <div className="mt-4 rounded-2xl bg-gray-50 p-4 text-sm text-gray-600">
            <p className="font-semibold text-[#1f2a44]">Custom Request:</p>
            <p className="mt-1 text-gray-500">{booking.customOrder || "—"}</p>
          </div>

          <div className="mt-6 flex gap-3">
            <button
                onClick={onClose}
                className="flex-1 rounded-2xl border border-gray-200 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
                onClick={handleConfirm}
                className="flex-1 rounded-2xl bg-purple-600 py-3 text-sm font-semibold text-white hover:bg-purple-700"
            >
              Confirm Booking
            </button>
          </div>
        </div>
      </div>
  );
}

// ─── Booking Card ─────────────────────────────────────────────────────────────

function BookingCard({
                       b,
                       onUpdateStatus,
                       onSetPrice,
                     }: {
  b: Booking;
  onUpdateStatus: (id: number, status: string, price?: number) => void;
  onSetPrice: (b: Booking) => void;
}) {
  const isCustom = b.bookingType === "custom";
  const messengerLink = b.facebookName
      ? `https://www.facebook.com/search/top?q=${encodeURIComponent(b.facebookName)}`
      : null;

  return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                            isCustom ? "bg-pink-100 text-pink-700" : "bg-indigo-100 text-indigo-700"
                        }`}>
                            {isCustom ? <Sparkles size={10} /> : <Package size={10} />}
                          {isCustom ? "Custom" : "Package"}
                        </span>
              {b.bookingReference && (
                  <span className="font-mono text-xs font-bold text-purple-600">
                                {b.bookingReference}
                            </span>
              )}
            </div>
            <p className="text-base font-bold text-[#1f2a44]">{b.name}</p>
            {b.facebookName && (
                <p className="text-xs text-gray-400">FB: {b.facebookName}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[b.status] || "bg-gray-100 text-gray-600"}`}>
                        {b.status}
                    </span>
            {messengerLink && (
                <a
                    href={messengerLink}
                    target="_blank"
                    rel="noreferrer"
                    title="Open Messenger"
                    className="flex items-center gap-1.5 rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-100"
                >
                  <MessageCircle size={13} />
                  Messenger
                </a>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 border-t border-gray-100 pt-4 text-sm md:grid-cols-4">
          <Detail label="Date" value={b.date ? new Date(b.date).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }) : "—"} />
          {b.eventTime && <Detail label="Time" value={b.eventTime} />}
          {b.phone && <Detail label="Phone" value={b.phone} />}
          {b.venue && <Detail label="Venue" value={b.venue} />}
          {b.theme && <Detail label="Theme" value={b.theme} />}
          {!isCustom && b.package && <Detail label="Package" value={b.package} />}
          {isCustom && b.eventType && <Detail label="Event Type" value={b.eventType} />}

          {/* Price */}
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-gray-400">Agreed Price</span>
            <span className={`text-sm font-bold ${b.agreed_price ? "text-green-600" : "text-gray-400"}`}>
                        {peso(b.agreed_price)}
                    </span>
          </div>
        </div>

        {/* Custom order description */}
        {isCustom && b.customOrder && (
            <div className="mt-3 rounded-xl bg-pink-50 px-4 py-3 text-xs text-gray-600">
              <span className="font-semibold text-pink-700">Custom Request: </span>
              {b.customOrder}
            </div>
        )}

        {/* Notes */}
        {b.notes && (
            <div className="mt-2 rounded-xl bg-gray-50 px-4 py-3 text-xs text-gray-500">
              <span className="font-semibold text-gray-600">Notes: </span>
              {b.notes}
            </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4">
          {b.status === "Pending Review" && (
              <>
                {isCustom ? (
                    // Custom — must set price first
                    <button
                        onClick={() => onSetPrice(b)}
                        className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-700"
                    >
                      <PhilippinePeso size={13} />
                      Set Price & Confirm
                    </button>
                ) : (
                    // Package — price already known, confirm directly
                    <button
                        onClick={() => onUpdateStatus(b.id, "Confirmed")}
                        className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                    >
                      <Check size={13} />
                      Confirm
                    </button>
                )}
                <button
                    onClick={() => onUpdateStatus(b.id, "Cancelled")}
                    className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-100"
                >
                  <X size={13} />
                  Cancel
                </button>
              </>
          )}

          {b.status === "Confirmed" && (
              <button
                  onClick={() => onUpdateStatus(b.id, "Preparing")}
                  className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-700"
              >
                <Clock size={13} />
                Mark as Preparing
              </button>
          )}

          {b.status === "Preparing" && (
              <button
                  onClick={() => onUpdateStatus(b.id, "Completed")}
                  className="flex items-center gap-1.5 rounded-xl bg-green-600 px-4 py-2 text-xs font-semibold text-white hover:bg-green-700"
              >
                <Check size={13} />
                Mark as Completed
              </button>
          )}

          {(b.status === "Confirmed" || b.status === "Preparing") && (
              <button
                  onClick={() => onUpdateStatus(b.id, "Cancelled")}
                  className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-100"
              >
                <X size={13} />
                Cancel
              </button>
          )}

          {/* Edit price for custom confirmed bookings */}
          {isCustom && b.status !== "Pending Review" && b.status !== "Cancelled" && (
              <button
                  onClick={() => onSetPrice(b)}
                  className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
              >
                <PhilippinePeso size={13} />
                Edit Price
              </button>
          )}
        </div>
      </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-gray-400">{label}</span>
        <span className="text-sm font-semibold text-[#1f2a44]">{value}</span>
      </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<FilterType>("All");
  const [storeName, setStoreName] = useState("Store Name");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [priceModal, setPriceModal] = useState<Booking | null>(null);

  async function loadBookings() {
    setLoading(true);
    const token = localStorage.getItem("token");
    const savedStoreName =
        localStorage.getItem("store_name") ||
        localStorage.getItem("stocknbook_store_name") ||
        "Store Name";
    setStoreName(savedStoreName);

    if (!token) { setBookings([]); setLoading(false); return; }

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: "get_bookings" }),
      });
      const data = await res.json();
      if (!res.ok) { setBookings([]); return; }
      setBookings(data.bookings || []);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadBookings(); }, []);

  async function updateStatus(id: number, newStatus: string, price?: number) {
    const token = localStorage.getItem("token");
    try {
      const body: Record<string, unknown> = { action: "update_status", booking_id: id, status: newStatus };
      if (price !== undefined) body.agreed_price = price;

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed");

      setBookings((prev) =>
          prev.map((b) =>
              b.id === id
                  ? { ...b, status: newStatus, ...(price !== undefined ? { agreed_price: price } : {}) }
                  : b
          )
      );
    } catch (err) {
      console.error("Failed to update:", err);
    }
  }

  async function handlePriceConfirm(price: number) {
    if (!priceModal) return;
    await updateStatus(priceModal.id, "Confirmed", price);
    setPriceModal(null);
  }

  async function handleEditPrice(booking: Booking, price: number) {
    const token = localStorage.getItem("token");
    try {
      await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: "update_price", booking_id: booking.id, agreed_price: price }),
      });
      setBookings((prev) =>
          prev.map((b) => (b.id === booking.id ? { ...b, agreed_price: price } : b))
      );
    } catch (err) {
      console.error("Failed to update price:", err);
    }
    setPriceModal(null);
  }

  const filtered = bookings
      .filter((b) => filter === "All" || b.status === filter)
      .filter((b) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            b.name.toLowerCase().includes(q) ||
            b.bookingReference?.toLowerCase().includes(q) ||
            b.phone?.includes(q) ||
            b.facebookName?.toLowerCase().includes(q)
        );
      });

  const counts = TABS.reduce((acc, tab) => {
    acc[tab] = tab === "All" ? bookings.length : bookings.filter((b) => b.status === tab).length;
    return acc;
  }, {} as Record<string, number>);

  return (
      <div className="flex min-h-screen bg-[#f5f6f8]">
        {/* ── Sidebar ── */}
        <RoleSidebar />

        {/* ── Main ── */}
        <main className="flex-1 p-5">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#1f2a44]">Booking Management</h1>
              <p className="mt-1 text-sm text-gray-500">View and manage customer bookings</p>
            </div>
            <button
                onClick={loadBookings}
                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, reference, phone, or Messenger name..."
                className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-purple-400"
            />
          </div>

          {/* Tabs */}
          <div className="mb-5 flex flex-wrap gap-2">
            {TABS.map((tab) => (
                <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition ${
                        filter === tab
                            ? "bg-purple-600 text-white shadow-sm"
                            : "bg-white text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  {tab}
                  {counts[tab] > 0 && (
                      <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                          filter === tab ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                      }`}>
                                    {counts[tab]}
                                </span>
                  )}
                </button>
            ))}
          </div>

          {/* Bookings list */}
          {loading ? (
              <div className="flex min-h-[220px] items-center justify-center rounded-2xl bg-white shadow-sm">
                <p className="text-sm text-gray-400">Loading bookings...</p>
              </div>
          ) : filtered.length === 0 ? (
              <div className="flex min-h-[220px] items-center justify-center rounded-2xl bg-white shadow-sm">
                <p className="text-sm text-gray-400">No bookings found.</p>
              </div>
          ) : (
              <div className="space-y-3">
                {filtered.map((b) => (
                    <BookingCard
                        key={b.id}
                        b={b}
                        onUpdateStatus={updateStatus}
                        onSetPrice={setPriceModal}
                    />
                ))}
              </div>
          )}
        </main>

        {/* ── Price Modal ── */}
        {priceModal && (
            <PriceModal
                booking={priceModal}
                onConfirm={priceModal.status === "Pending Review" ? handlePriceConfirm : async (price) => { await handleEditPrice(priceModal, price); }}
                onClose={() => setPriceModal(null)}
            />
        )}
      </div>
  );
}





