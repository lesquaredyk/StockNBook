"use client";

import { useEffect, useState } from "react";
import {
    PaymentFilter,
    PaymentSubmission,
    PaymentStatus,
    usePlatformAdmin,
} from "@/hooks/usePlatformAdmin";
import PaymentReviewModal from "./paymentReviewModal";
import ApprovePaymentModal from "./approvePaymentModal";
import RejectPaymentModal from "./rejectPaymentModal";

const filters: { value: PaymentFilter; label: string }[] = [
    { value: "PENDING", label: "Pending Payments" },
    { value: "APPROVED", label: "Approved" },
    { value: "REJECTED", label: "Rejected" },
    { value: "ALL", label: "All Payments" },
];

function formatCurrency(value: number) {
    return `₱${Number(value || 0).toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function formatDate(value?: string | null, withTime = false) {
    if (!value) return "—";

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) return String(value);

    return parsed.toLocaleString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
        ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
    });
}

export default function SubscriptionManagement() {
    const {
        payments,
        summary,
        isLoading,
        error,
        clearError,
        loadSummary,
        loadPayments,
        loadPaymentDetails,
        approvePayment,
        rejectPayment,
    } = usePlatformAdmin();

    const [filter, setFilter] = useState<PaymentFilter>("PENDING");
    const [search, setSearch] = useState("");
    const [selectedPayment, setSelectedPayment] =
        useState<PaymentSubmission | null>(null);
    const [showApprove, setShowApprove] = useState(false);
    const [showReject, setShowReject] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [notice, setNotice] = useState("");

    const loadCurrentPayments = async (
        requestedFilter = filter,
        requestedSearch = search
    ) => {
        try {
            await Promise.all([
                loadSummary(),
                loadPayments(requestedFilter, requestedSearch),
            ]);
        } catch (requestError) {
            setNotice(
                requestError instanceof Error
                    ? requestError.message
                    : "Unable to load payment submissions."
            );
        }
    };

    useEffect(() => {
        void loadCurrentPayments(filter, "");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter]);

    const openReview = async (payment: PaymentSubmission) => {
        try {
            const details = await loadPaymentDetails(
                payment.payment_submission_id
            );
            setSelectedPayment(details);
        } catch (requestError) {
            setNotice(
                requestError instanceof Error
                    ? requestError.message
                    : "Unable to open payment details."
            );
        }
    };

    const confirmApprove = async () => {
        if (!selectedPayment) return;

        setIsSaving(true);

        try {
            const result = await approvePayment(
                selectedPayment.payment_submission_id
            );

            setNotice(
                `${result.message}: ${result.plan_name} was activated for ${result.store_name}. ` +
                `Expiration date: ${formatDate(result.expiration_date)}.`
            );
            setShowApprove(false);
            setSelectedPayment(null);
            await loadCurrentPayments();
        } catch (requestError) {
            setNotice(
                requestError instanceof Error
                    ? requestError.message
                    : "Unable to approve payment."
            );
        } finally {
            setIsSaving(false);
        }
    };

    const confirmReject = async (reason: string, explanation: string) => {
        if (!selectedPayment) return;

        setIsSaving(true);

        try {
            const result = await rejectPayment(
                selectedPayment.payment_submission_id,
                reason,
                explanation
            );

            setNotice(
                `${result.message}: ${result.store_name}. Reason: ${result.reason}.`
            );
            setShowReject(false);
            setSelectedPayment(null);
            await loadCurrentPayments();
        } catch (requestError) {
            setNotice(
                requestError instanceof Error
                    ? requestError.message
                    : "Unable to reject payment."
            );
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <main className="p-5">
            <div className="mx-auto max-w-[1550px]">
                <section className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <MiniSummary
                        label="Pending"
                        value={summary?.pending_verification ?? 0}
                        tone="amber"
                    />
                    <MiniSummary
                        label="Approved"
                        value={summary?.approved_payments ?? 0}
                        tone="green"
                    />
                    <MiniSummary
                        label="Rejected"
                        value={summary?.rejected_payments ?? 0}
                        tone="red"
                    />
                    <MiniSummary
                        label="Active Subscriptions"
                        value={summary?.active_subscriptions ?? 0}
                        tone="violet"
                    />
                </section>

                {(notice || error) && (
                    <div className="mb-4 flex items-start justify-between gap-4 rounded-xl border border-[#E6DDF0] bg-white px-4 py-3 text-[11px] text-[#2D1B4E] shadow-sm">
                        <p>{notice || error}</p>
                        <button
                            type="button"
                            onClick={() => {
                                setNotice("");
                                clearError();
                            }}
                            className="text-base leading-none text-[#776E84]"
                            aria-label="Dismiss message"
                        >
                            ×
                        </button>
                    </div>
                )}

                <section className="overflow-hidden rounded-[16px] border border-[#E6DDF0] bg-white shadow-sm">
                    <div className="border-b border-[#F0ECF5] px-5 py-4">
                        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                            <div>
                                <div className="mb-2 h-1 w-8 rounded-full bg-[#3B1B88]" />
                                <h2 className="text-[16px] font-semibold">
                                    Payment Verification
                                </h2>
                                <p className="mt-1 text-[10px] text-[#776E84]">
                                    Verify payment proof manually against the receiving GCash record.
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter") {
                                            void loadCurrentPayments();
                                        }
                                    }}
                                    placeholder="Store, owner, or reference number"
                                    className="min-w-0 flex-1 rounded-lg border border-[#E6DDF0] bg-[#FCFBFE] px-3 py-2 text-[10px] outline-none transition focus:border-[#3B1B88] sm:w-[270px]"
                                />
                                <button
                                    type="button"
                                    onClick={() => void loadCurrentPayments()}
                                    className="rounded-lg bg-[#2D1B4E] px-3 py-2 text-[10px] font-semibold text-white transition hover:bg-[#3B1B88]"
                                >
                                    Search
                                </button>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            {filters.map((item) => (
                                <button
                                    key={item.value}
                                    type="button"
                                    onClick={() => {
                                        setFilter(item.value);
                                        setSearch("");
                                    }}
                                    className={[
                                        "rounded-lg px-3 py-2 text-[10px] font-semibold transition",
                                        filter === item.value
                                            ? "bg-[#2D1B4E] text-white"
                                            : "border border-[#E6DDF0] bg-white text-[#2D1B4E] hover:bg-[#F7F1FF]",
                                    ].join(" ")}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1010px] border-collapse">
                            <thead>
                            <tr className="border-b border-[#F1EDF5] bg-[#FBFAFD]">
                                <TableHead>Store / Owner</TableHead>
                                <TableHead>Current Plan</TableHead>
                                <TableHead>Requested Plan</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Reference Number</TableHead>
                                <TableHead>Submitted</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead align="right">Action</TableHead>
                            </tr>
                            </thead>
                            <tbody>
                            {isLoading ? (
                                <EmptyRow text="Loading payment submissions…" />
                            ) : payments.length === 0 ? (
                                <EmptyRow text="No payment submissions found." />
                            ) : (
                                payments.map((payment) => (
                                    <tr
                                        key={payment.payment_submission_id}
                                        className="border-b border-[#F3EFF6] transition hover:bg-[#FCFAFF] last:border-b-0"
                                    >
                                        <td className="px-4 py-3">
                                            <p className="text-[10px] font-semibold">
                                                {payment.store_name_snapshot}
                                            </p>
                                            <p className="mt-1 text-[9px] text-[#665D79]">
                                                {payment.owner_name_snapshot}
                                            </p>
                                        </td>
                                        <td className="px-3 py-3 text-[10px]">
                                            {payment.current_plan_name_snapshot || "Free"}
                                        </td>
                                        <td className="px-3 py-3 text-[10px] font-semibold text-[#3B1B88]">
                                            {payment.requested_plan_name_snapshot}
                                        </td>
                                        <td className="px-3 py-3 text-[10px] font-semibold">
                                            {formatCurrency(payment.required_amount)}
                                        </td>
                                        <td className="px-3 py-3 font-mono text-[9px]">
                                            {payment.reference_number}
                                        </td>
                                        <td className="px-3 py-3 text-[9px]">
                                            {formatDate(payment.submitted_at, true)}
                                        </td>
                                        <td className="px-3 py-3">
                                            <StatusBadge status={payment.status} />
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                type="button"
                                                onClick={() => void openReview(payment)}
                                                className="rounded-lg bg-[#F2EDFF] px-3 py-1.5 text-[9px] font-semibold text-[#3B1B88] transition hover:bg-[#E6DDFF]"
                                            >
                                                Review
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>

            {selectedPayment && (
                <PaymentReviewModal
                    payment={selectedPayment}
                    onClose={() => setSelectedPayment(null)}
                    onApprove={() => setShowApprove(true)}
                    onReject={() => setShowReject(true)}
                />
            )}

            {showApprove && selectedPayment && (
                <ApprovePaymentModal
                    payment={selectedPayment}
                    isSaving={isSaving}
                    onCancel={() => setShowApprove(false)}
                    onConfirm={() => void confirmApprove()}
                />
            )}

            {showReject && selectedPayment && (
                <RejectPaymentModal
                    isSaving={isSaving}
                    onCancel={() => setShowReject(false)}
                    onConfirm={(reason, explanation) =>
                        void confirmReject(reason, explanation)
                    }
                />
            )}
        </main>
    );
}

function MiniSummary({
                         label,
                         value,
                         tone,
                     }: {
    label: string;
    value: number;
    tone: "violet" | "amber" | "red" | "green";
}) {
    const color =
        tone === "red"
            ? "text-[#B42318]"
            : tone === "green"
                ? "text-[#226B36]"
                : tone === "amber"
                    ? "text-[#9A5A00]"
                    : "text-[#3B1B88]";

    return (
        <div className="rounded-[14px] border border-[#E6DDF0] bg-white px-4 py-3 shadow-sm">
            <p className="text-[10px] font-semibold text-[#776E84]">{label}</p>
            <p className={`mt-1 text-[22px] font-bold ${color}`}>{value}</p>
        </div>
    );
}

function TableHead({
                       children,
                       align = "left",
                   }: {
    children: React.ReactNode;
    align?: "left" | "right";
}) {
    return (
        <th
            className={[
                "px-3 py-2.5 text-[8px] font-semibold uppercase tracking-[0.07em] text-[#776E84]",
                align === "right" ? "text-right" : "text-left",
            ].join(" ")}
        >
            {children}
        </th>
    );
}

function EmptyRow({ text }: { text: string }) {
    return (
        <tr>
            <td
                colSpan={8}
                className="px-4 py-12 text-center text-[11px] text-[#776E84]"
            >
                {text}
            </td>
        </tr>
    );
}

function StatusBadge({ status }: { status: PaymentStatus }) {
    const className =
        status === "APPROVED"
            ? "bg-[#E6F6EA] text-[#226B36]"
            : status === "REJECTED"
                ? "bg-[#FFE5E5] text-[#9A2424]"
                : "bg-[#FFF4D8] text-[#8A5A00]";

    return (
        <span
            className={`inline-flex rounded-full px-2.5 py-1 text-[8px] font-semibold ${className}`}
        >
            {status.charAt(0) + status.slice(1).toLowerCase()}
        </span>
    );
}
