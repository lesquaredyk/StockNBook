"use client";

import { useState } from "react";

const reasons = [
    "Payment not found",
    "Incorrect amount",
    "Invalid reference number",
    "Duplicate reference number",
    "Unclear payment proof",
    "Payment details do not match",
    "Other",
];

export default function RejectPaymentModal({
                                               isSaving,
                                               onCancel,
                                               onConfirm,
                                           }: {
    isSaving: boolean;
    onCancel: () => void;
    onConfirm: (reason: string, explanation: string) => void;
}) {
    const [reason, setReason] = useState("");
    const [explanation, setExplanation] = useState("");

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="reject-payment-title"
                className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl"
            >
                <div className="mb-2 h-1 w-8 rounded-full bg-[#DC2626]" />
                <h2
                    id="reject-payment-title"
                    className="text-[18px] font-semibold text-[#1A1220]"
                >
                    Reject Subscription Payment
                </h2>

                <p className="mt-2 text-[11px] leading-5 text-[#665D79]">
                    A rejection reason is required. The business&apos;s current subscription will remain unchanged.
                </p>

                <label className="mt-4 block text-[10px] font-semibold text-[#1A1220]">
                    Reason for rejection
                </label>
                <select
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    className="mt-2 w-full rounded-lg border border-[#E6DDF0] bg-white px-3 py-2 text-[10px] outline-none transition focus:border-[#3B1B88]"
                >
                    <option value="">Select a reason</option>
                    {reasons.map((item) => (
                        <option key={item} value={item}>
                            {item}
                        </option>
                    ))}
                </select>

                <label className="mt-4 block text-[10px] font-semibold text-[#1A1220]">
                    Additional explanation
                </label>
                <textarea
                    value={explanation}
                    onChange={(event) => setExplanation(event.target.value)}
                    rows={4}
                    placeholder="Optional details for the Business Owner"
                    className="mt-2 w-full resize-none rounded-lg border border-[#E6DDF0] bg-white px-3 py-2 text-[10px] outline-none transition focus:border-[#3B1B88]"
                />

                <div className="mt-5 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSaving}
                        className="rounded-lg border border-[#E6DDF0] px-3 py-2 text-[10px] font-semibold text-[#2D1B4E] disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={() => onConfirm(reason, explanation)}
                        disabled={isSaving || !reason}
                        className="rounded-lg bg-[#9A2424] px-3 py-2 text-[10px] font-semibold text-white transition hover:bg-[#7D1E1E] disabled:opacity-50"
                    >
                        {isSaving ? "Saving…" : "Confirm Rejection"}
                    </button>
                </div>
            </div>
        </div>
    );
}
