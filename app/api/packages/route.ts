import { NextRequest, NextResponse } from "next/server";

const LAMBDA_URL =
    "https://3pwsbsqwvwmuce5fgj6f574lmu0cfeje.lambda-url.ap-southeast-1.on.aws";

async function readLambdaResponse(response: Response) {
    const text = await response.text();

    try {
        return text ? JSON.parse(text) : {};
    } catch {
        return {
            error: text || "Invalid response from server.",
        };
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const authHeader = req.headers.get("authorization") || "";

        if (!body || typeof body !== "object") {
            return NextResponse.json(
                { error: "Invalid request body." },
                { status: 400 }
            );
        }

        if (!body.action) {
            return NextResponse.json(
                { error: "Missing package action." },
                { status: 400 }
            );
        }

        console.log("PACKAGES ROUTE ACTION:", body.action);
        console.log("PACKAGES ROUTE BODY:", body);

        const response = await fetch(LAMBDA_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(authHeader ? { Authorization: authHeader } : {}),
            },
            body: JSON.stringify(body),
            cache: "no-store",
        });

        const data = await readLambdaResponse(response);

        console.log("PACKAGES LAMBDA STATUS:", response.status);
        console.log("PACKAGES LAMBDA RESPONSE:", data);

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("PACKAGES ROUTE ERROR:", error);

        return NextResponse.json(
            { error: "Failed to process package request." },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const store_id = searchParams.get("store_id");
        const branch_id = searchParams.get("branch_id");
        const authHeader = req.headers.get("authorization") || "";

        if (!store_id && !branch_id) {
            return NextResponse.json(
                { error: "store_id or branch_id is required." },
                { status: 400 }
            );
        }

        const body: Record<string, unknown> = {
            action: "get_packages",
        };

        if (store_id) body.store_id = Number(store_id);
        if (branch_id) body.branch_id = Number(branch_id);

        console.log("PACKAGES GET BODY:", body);

        const response = await fetch(LAMBDA_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(authHeader ? { Authorization: authHeader } : {}),
            },
            body: JSON.stringify(body),
            cache: "no-store",
        });

        const data = await readLambdaResponse(response);

        console.log("PACKAGES GET LAMBDA STATUS:", response.status);
        console.log("PACKAGES GET LAMBDA RESPONSE:", data);

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("PACKAGES GET ROUTE ERROR:", error);

        return NextResponse.json(
            { error: "Failed to load packages." },
            { status: 500 }
        );
    }
}