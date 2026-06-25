import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/*
  This keeps the AWS Lambda URL private from the browser.

  Add this to .env.local:
  SUBSCRIPTION_ADMIN_LAMBDA_URL=https://your-api-gateway-or-lambda-url/
*/

export async function POST(request: NextRequest) {
    const lambdaUrl = process.env.SUBSCRIPTION_ADMIN_LAMBDA_URL;

    if (!lambdaUrl) {
        return NextResponse.json(
            {
                message:
                    "SUBSCRIPTION_ADMIN_LAMBDA_URL is missing in .env.local.",
            },
            { status: 500 }
        );
    }

    const authorization = request.headers.get("authorization") || "";
    const body = await request.text();

    const upstream = await fetch(lambdaUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: authorization,
        },
        body,
        cache: "no-store",
    });

    const contentType =
        upstream.headers.get("content-type") || "application/json";
    const text = await upstream.text();

    return new NextResponse(text, {
        status: upstream.status,
        headers: {
            "Content-Type": contentType,
        },
    });
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            Allow: "POST, OPTIONS",
        },
    });
}
