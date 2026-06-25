"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    PaymentSubmission,
    usePlatformAdmin,
} from "@/hooks/usePlatformAdmin";
import PaymentReviewModal from "./paymentReviewModal";
import ApprovePaymentModal from "./approvePaymentModal";
import RejectPaymentModal from "./rejectPaymentModal";

function formatCurrency(value: number) {
    return `₱${Number(value || 0).toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function formatDate(value?: string | null, withTime = false) {
    if (!value) return "—";

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
        return String(value);
    }

    return parsed.toLocaleString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
        ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
    });
}

export default function AdminDashboard() {
    const {
        summary,
        payments,
        isLoading,
        error,
        clearError,
        loadDashboard,
        loadPaymentDetails,
        approvePayment,
        rejectPayment,
    } = usePlatformAdmin();

    const [selectedPayment, setSelectedPayment] =
        useState<PaymentSubmission | null>(null);
    const [showApprove, setShowApprove] = useState(false);
    const [showReject, setShowReject] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [notice, setNotice] = useState("");

    useEffect(() => {
        void loadDashboard();
    }, [loadDashboard]);

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
                `${result.message}: ${result.plan_name} plan activated for ${result.store_name}. ` +
                `Expires ${formatDate(result.expiration_date)}.`
            );
            setShowApprove(false);
            setSelectedPayment(null);
            await loadDashboard();
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
            await loadDashboard();
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
                <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        title="Pending Verification"
                        value={summary?.pending_verification ?? 0}
                        description="Payments awaiting manual review"
                        tone="amber"
                    />
                    <SummaryCard
                        title="Active Subscriptions"
                        value={summary?.active_subscriptions ?? 0}
                        description="Currently active businesses"
                        tone="violet"
                    />
                    <SummaryCard
                        title="Expiring Soon"
                        value={summary?.expiring_soon ?? 0}
                        description="Expiring within 7 days"
                        tone="amber"
                    />
                    <SummaryCard
                        title="Expired Subscriptions"
                        value={summary?.expired_subscriptions ?? 0}
                        description="Need renewal or review"
                        tone="red"
                    />
                </section>

                {(notice || error) && (
                    <div className="mt-4 flex items-start justify-between gap-4 rounded-xl border border-[#E6DDF0] bg-white px-4 py-3 text-[11px] text-[#2D1B4E] shadow-sm">
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

                <section className="mt-4 overflow-hidden rounded-[16px] border border-[#E6DDF0] bg-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-[#F0ECF5] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="mb-2 h-1 w-8 rounded-full bg-[#3B1B88]" />
                            <h2 className="text-[16px] font-semibold">
                                Pending Payment Requests
                            </h2>
                            <p className="mt-1 text-[10px] text-[#776E84]">
                                Manually verify the GCash transaction before approving.
                            </p>
                        </div>

                        <Link
                            href="/platform-admin/subscriptions"
                            className="text-[10px] font-semibold text-[#3B1B88] transition hover:text-[#5B2FC6]"
                        >
                            View all payments →
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[790px] border-collapse">
                            <thead>
                            <tr className="border-b border-[#F1EDF5] bg-[#FBFAFD]">
                                <TableHead>Store / Owner</TableHead>
                                <TableHead>Current Plan</TableHead>
                                <TableHead>Requested Plan</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Reference</TableHead>
                                <TableHead>Submitted</TableHead>
                                <TableHead align="right">Action</TableHead>
                            </tr>
                            </thead>
                            <tbody>
                            {isLoading ? (
                                <EmptyRow text="Loading pending payment requests…" />
                            ) : payments.length === 0 ? (
                                <EmptyRow text="No pending payment requests." />
                            ) : (
                                payments.slice(0, 5).map((payment) => (
                                    <tr
                                        key={payment.payment_submission_id}
                                        className="border-b border-[#F3EFF6] transition hover:bg-[#FCFAFF] last:border-b-0"
                                    >
                                        <td className="px-4 py-3">
                                            <p className="text-[10px] font-semibold text-[#1A1220]">
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

function SummaryCard({
                         title,
                         value,
                         description,
                         tone,
                     }: {
    title: string;
    value: number;
    description: string;
    tone: "violet" | "amber" | "red";
}) {
    const valueColor =
        tone === "red"
            ? "text-[#B42318]"
            : tone === "amber"
                ? "text-[#9A5A00]"
                : "text-[#3B1B88]";

    const barColor =
        tone === "red"
            ? "bg-[#DC2626]"
            : tone === "amber"
                ? "bg-[#D97706]"
                : "bg-[#3B1B88]";

    return (
        <article className="h-[122px] rounded-[14px] border border-[#E6DDF0] bg-white p-4 shadow-sm">
            <div className={`mb-3 h-1 w-8 rounded-full ${barColor}`} />
            <p className="text-[11px] font-semibold text-[#1A1220]">{title}</p>
            <p className={`mt-2 text-[28px] font-bold leading-none ${valueColor}`}>
                {value}
            </p>
            <p className="mt-2 text-[9px] text-[#776E84]">{description}</p>
        </article>
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
                colSpan={7}
                className="px-4 py-12 text-center text-[11px] text-[#776E84]"
            >
                {text}
            </td>
        </tr>
    );
}
