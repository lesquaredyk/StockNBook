/* eslint-disable @typescript-eslint/no-require-imports */
const mysql = require("mysql2/promise");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "stocknbook-secret-key";

const dbConfig = {
    host: "stocknbook-db.clyuqe48evd0.ap-southeast-1.rds.amazonaws.com",
    user: "admin",
    password: "2qJivedWDxCQS6TLjjEl",
    database: "stocknbook",
    ssl: { rejectUnauthorized: false },
};

exports.handler = async (event) => {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Content-Type": "application/json",
    };

    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 200, headers, body: "" };
    }

    let body = {};
    try {
        body = JSON.parse(event.body || "{}");
    } catch {
        body = {};
    }

    const action = body.action;
    const connection = await mysql.createConnection(dbConfig);

    try {
        // ── PUBLIC: create_booking ────────────────────────────────────────────
        if (action === "create_booking") {
            const {
                storeId,
                branchId,
                bookingReference,
                bookingType,
                name,
                facebookName,
                phone,
                email,
                date,
                eventTime,
                eventType,
                package: packageName,
                customOrder,
                theme,
                venue,
                notes,
                status,
            } = body;

            if (!storeId || !bookingType || !name || !phone || !date) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: "Missing required booking fields" }),
                };
            }

            const [result] = await connection.execute(
                `INSERT INTO bookings
                 (store_id, branch_id, booking_reference, booking_type, name, facebook_name,
                  phone, email, event_date, event_time, event_type, package_name,
                  custom_order, theme, venue, notes, status)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    Number(storeId),
                    branchId ? Number(branchId) : null,
                    bookingReference || null,
                    bookingType,
                    name,
                    facebookName || null,
                    phone,
                    email || null,
                    date,
                    eventTime || null,
                    eventType || "Based on selected package",
                    packageName || "",
                    customOrder || "",
                    theme || null,
                    venue || null,
                    notes || "",
                    status || "Pending Review",
                ]
            );

            return {
                statusCode: 201,
                headers,
                body: JSON.stringify({ success: true, id: result.insertId }),
            };
        }

        // ── PUBLIC: get_booking_by_reference ─────────────────────────────────
        if (action === "get_booking_by_reference") {
            const { bookingReference } = body;

            if (!bookingReference) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: "Missing bookingReference" }),
                };
            }

            const [rows] = await connection.execute(
                `SELECT
                     bookings.id,
                     bookings.branch_id          AS branchId,
                     branches.branch_name        AS branchName,
                     bookings.booking_reference  AS bookingReference,
                     bookings.booking_type       AS bookingType,
                     bookings.name,
                     bookings.facebook_name      AS facebookName,
                     bookings.phone,
                     bookings.email,
                     bookings.event_date         AS date,
                     bookings.event_time         AS eventTime,
                     bookings.event_type         AS eventType,
                     bookings.package_name       AS package,
                     bookings.custom_order       AS customOrder,
                     bookings.theme,
                     bookings.venue,
                     bookings.notes,
                     bookings.status,
                     bookings.agreed_price       AS agreedPrice,
                     bookings.created_at         AS createdAt
                 FROM bookings
                     LEFT JOIN branches
                 ON bookings.branch_id = branches.id
                     AND bookings.store_id = branches.store_id
                 WHERE bookings.booking_reference = ?
                     LIMIT 1`,
                [bookingReference]
            );

            if (!rows.length) {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({ error: "Booking not found" }),
                };
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ booking: rows[0] }),
            };
        }

        // ── PUBLIC: get_bookings_by_phone ─────────────────────────────────────
        if (action === "get_bookings_by_phone") {
            const { phone, storeId } = body;

            if (!phone || !storeId) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: "Missing phone or storeId" }),
                };
            }

            const [rows] = await connection.execute(
                `SELECT
                     bookings.id,
                     bookings.branch_id          AS branchId,
                     branches.branch_name        AS branchName,
                     bookings.booking_reference  AS bookingReference,
                     bookings.booking_type       AS bookingType,
                     bookings.name,
                     bookings.phone,
                     bookings.event_date         AS date,
                     bookings.event_time         AS eventTime,
                     bookings.event_type         AS eventType,
                     bookings.package_name       AS package,
                     bookings.custom_order       AS customOrder,
                     bookings.theme,
                     bookings.venue,
                     bookings.notes,
                     bookings.status,
                     bookings.agreed_price       AS agreedPrice,
                     bookings.created_at         AS createdAt
                 FROM bookings
                     LEFT JOIN branches
                 ON bookings.branch_id = branches.id
                     AND bookings.store_id = branches.store_id
                 WHERE bookings.phone = ? AND bookings.store_id = ?
                 ORDER BY bookings.created_at DESC`,
                [phone, Number(storeId)]
            );

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ bookings: rows }),
            };
        }

        // ── PUBLIC: get_public_bookings ───────────────────────────────────────
        if (action === "get_public_bookings") {
            const { storeId } = body;

            if (!storeId) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: "Missing storeId" }),
                };
            }

            const [rows] = await connection.execute(
                `SELECT id, name, event_date AS date, status
                 FROM bookings
                 WHERE store_id = ?
                 ORDER BY created_at DESC`,
                [Number(storeId)]
            );

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ bookings: rows }),
            };
        }

        // ── PROTECTED: verify token ───────────────────────────────────────────
        const authHeader = event.headers?.Authorization || event.headers?.authorization;

        if (!authHeader) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: "No token" }),
            };
        }

        let store_id;
        try {
            const token = authHeader.replace("Bearer ", "");
            const decoded = jwt.verify(token, JWT_SECRET);
            store_id = decoded.store_id;
        } catch {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: "Invalid token" }),
            };
        }

        // ── PROTECTED: get_bookings ───────────────────────────────────────────
        if (action === "get_bookings") {
            const { branch_id, branchId } = body;
            const requestedBranchId = branch_id || branchId;

            let query = `
                SELECT
                    bookings.id,
                    bookings.branch_id          AS branchId,
                    branches.branch_name        AS branchName,
                    bookings.booking_reference  AS bookingReference,
                    bookings.booking_type       AS bookingType,
                    bookings.name,
                    bookings.facebook_name      AS facebookName,
                    bookings.phone,
                    bookings.event_date         AS date,
                    bookings.event_time         AS eventTime,
                    bookings.event_type         AS eventType,
                    bookings.package_name       AS package,
                    bookings.custom_order       AS customOrder,
                    bookings.theme,
                    bookings.venue,
                    bookings.notes,
                    bookings.status,
                    bookings.agreed_price,
                    bookings.payment_status,
                    bookings.created_at         AS createdAt
                FROM bookings
                    LEFT JOIN branches
                ON bookings.branch_id = branches.id
                    AND bookings.store_id = branches.store_id
                WHERE bookings.store_id = ?
            `;

            const params = [store_id];

            if (requestedBranchId) {
                query += ` AND bookings.branch_id = ?`;
                params.push(Number(requestedBranchId));
            }

            query += ` ORDER BY bookings.created_at DESC`;

            const [rows] = await connection.execute(query, params);

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ bookings: rows }),
            };
        }

        // ── PROTECTED: update_status ──────────────────────────────────────────
        if (action === "update_status") {
            const { booking_id, status, agreed_price, branch_id, branchId } = body;
            const requestedBranchId = branch_id || branchId;

            if (!booking_id || !status) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: "Missing booking_id or status" }),
                };
            }

            let query = `UPDATE bookings SET status = ?`;
            const params = [status];

            if (agreed_price !== undefined && agreed_price !== null) {
                query += `, agreed_price = ?`;
                params.push(agreed_price);
            }

            query += ` WHERE id = ? AND store_id = ?`;
            params.push(booking_id, store_id);

            if (requestedBranchId) {
                query += ` AND branch_id = ?`;
                params.push(Number(requestedBranchId));
            }

            await connection.execute(query, params);

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true }),
            };
        }

        // ── PROTECTED: update_price ───────────────────────────────────────────
        if (action === "update_price") {
            const { booking_id, agreed_price, branch_id, branchId } = body;
            const requestedBranchId = branch_id || branchId;

            if (!booking_id || agreed_price === undefined || agreed_price === null) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: "Missing booking_id or agreed_price" }),
                };
            }

            let query = `
                UPDATE bookings
                SET agreed_price = ?
                WHERE id = ? AND store_id = ?
            `;
            const params = [agreed_price, booking_id, store_id];

            if (requestedBranchId) {
                query += ` AND branch_id = ?`;
                params.push(Number(requestedBranchId));
            }

            await connection.execute(query, params);

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true }),
            };
        }

        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: "Invalid action" }),
        };
    } catch (err) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: err.message }),
        };
    } finally {
        await connection.end();
    }
};