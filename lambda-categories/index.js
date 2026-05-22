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

function badRequest(headers, message) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: message }) };
}

function unauthorized(headers, message) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: message }) };
}

function serverError(headers) {
    return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "Internal server error" }),
    };
}

function toSafeString(value, max = 255) {
    return String(value ?? "").trim().slice(0, max);
}

const DEFAULT_CATEGORIES = [
    "Balloons",
    "Backdrops",
    "Tables & Chairs",
    "Linens & Covers",
    "Decorations",
    "Party Favors",
    "Catering / Food",
    "Cake & Desserts",
    "Lights & Sounds",
    "Costumes & Props",
    "Candles & Accessories",
    "Miscellaneous",
];

async function ensureDefaultCategories(connection, storeId) {
    const parsedStoreId = Number(storeId);

    if (!Number.isInteger(parsedStoreId) || parsedStoreId <= 0) return;

    for (const categoryName of DEFAULT_CATEGORIES) {
        const [existing] = await connection.execute(
            `SELECT id
             FROM categories
             WHERE store_id = ?
               AND LOWER(category_name) = LOWER(?)
             LIMIT 1`,
            [parsedStoreId, categoryName]
        );

        if (existing.length === 0) {
            await connection.execute(
                `INSERT INTO categories (store_id, category_name, description, status)
                 VALUES (?, ?, ?, ?)`,
                [parsedStoreId, categoryName, "", "active"]
            );
        }
    }
}

async function ensureStoreExists(connection, storeId) {
    const parsed = Number(storeId);

    if (!Number.isInteger(parsed) || parsed <= 0) return false;

    const [rows] = await connection.execute(
        "SELECT id FROM stores WHERE id = ? LIMIT 1",
        [parsed]
    );

    return rows.length > 0;
}

exports.handler = async (event) => {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Content-Type": "application/json",
    };

    const method = event?.requestContext?.http?.method || event.httpMethod;

    if (method === "OPTIONS") {
        return { statusCode: 204, headers, body: "" };
    }

    let body = {};

    try {
        body = JSON.parse(event.body || "{}");
    } catch {
        return badRequest(headers, "Invalid JSON body");
    }

    const action = body.action;
    let connection;

    try {
        connection = await mysql.createConnection(dbConfig);
        console.log("[lambda-categories] action:", action);

        // ── PUBLIC: get_public_categories ────────────────────────────────────
        if (action === "get_public_categories") {
            const storeId = Number(body.storeId);

            if (!Number.isInteger(storeId) || storeId <= 0) {
                return badRequest(headers, "Missing or invalid storeId");
            }

            await ensureDefaultCategories(connection, storeId);

            const [rows] = await connection.execute(
                `SELECT
                     id,
                     store_id AS storeId,
                     category_name AS categoryName,
                     description,
                     status,
                     created_at AS createdAt,
                     updated_at AS updatedAt
                 FROM categories
                 WHERE store_id = ?
                 ORDER BY created_at DESC`,
                [storeId]
            );

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ categories: rows }),
            };
        }

        // ── PROTECTED: verify token ──────────────────────────────────────────
        const authHeader =
            event?.headers?.authorization ||
            event?.headers?.Authorization ||
            "";

        if (!authHeader) {
            return unauthorized(headers, "No token provided");
        }

        let store_id;

        try {
            const token = authHeader.replace("Bearer ", "");
            const decoded = jwt.verify(token, JWT_SECRET);
            store_id = Number(decoded.store_id);
        } catch {
            return unauthorized(headers, "Invalid token");
        }

        if (!Number.isInteger(store_id) || store_id <= 0) {
            return unauthorized(headers, "Invalid store in token");
        }

        const storeExists = await ensureStoreExists(connection, store_id);

        if (!storeExists) {
            return badRequest(headers, "Store account not found");
        }

        // ── PROTECTED: create_category ───────────────────────────────────────
        if (action === "create_category") {
            const safeName = toSafeString(body.categoryName, 120);
            const safeDescription = toSafeString(body.description, 500);

            if (!safeName) {
                return badRequest(headers, "categoryName is required");
            }

            const [existing] = await connection.execute(
                `SELECT id
                 FROM categories
                 WHERE store_id = ?
                   AND LOWER(category_name) = LOWER(?)
                     LIMIT 1`,
                [store_id, safeName]
            );

            if (existing.length > 0) {
                return badRequest(headers, "Category already exists for this store");
            }

            const [result] = await connection.execute(
                `INSERT INTO categories (store_id, category_name, description, status)
                 VALUES (?, ?, ?, ?)`,
                [store_id, safeName, safeDescription, "active"]
            );

            const [rows] = await connection.execute(
                `SELECT
                     id,
                     store_id AS storeId,
                     category_name AS categoryName,
                     description,
                     status,
                     created_at AS createdAt,
                     updated_at AS updatedAt
                 FROM categories
                 WHERE id = ?
                     LIMIT 1`,
                [result.insertId]
            );

            return {
                statusCode: 201,
                headers,
                body: JSON.stringify({
                    success: true,
                    category: rows[0] || { id: result.insertId },
                }),
            };
        }

        // ── PROTECTED: get_categories ────────────────────────────────────────
        if (action === "get_categories") {
            await ensureDefaultCategories(connection, store_id);

            const [rows] = await connection.execute(
                `SELECT
                     id,
                     store_id AS storeId,
                     category_name AS categoryName,
                     description,
                     status,
                     created_at AS createdAt,
                     updated_at AS updatedAt
                 FROM categories
                 WHERE store_id = ?
                 ORDER BY created_at DESC`,
                [store_id]
            );

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ categories: rows }),
            };
        }

        // ── PROTECTED: update_category ───────────────────────────────────────
        if (action === "update_category") {
            const categoryId = Number(body.category_id);
            const safeName = toSafeString(body.categoryName, 120);
            const safeDescription = toSafeString(body.description, 500);

            if (!Number.isInteger(categoryId) || categoryId <= 0) {
                return badRequest(headers, "Missing or invalid category_id");
            }

            if (!safeName) {
                return badRequest(headers, "categoryName is required");
            }

            const [duplicate] = await connection.execute(
                `SELECT id
                 FROM categories
                 WHERE store_id = ?
                   AND LOWER(category_name) = LOWER(?)
                   AND id <> ?
                     LIMIT 1`,
                [store_id, safeName, categoryId]
            );

            if (duplicate.length > 0) {
                return badRequest(headers, "Category already exists for this store");
            }

            const [result] = await connection.execute(
                `UPDATE categories
                 SET category_name = ?,
                     description = ?,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?
                   AND store_id = ?`,
                [safeName, safeDescription, categoryId, store_id]
            );

            if (result.affectedRows === 0) {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({ error: "Category not found" }),
                };
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true }),
            };
        }

        // ── PROTECTED: delete_category ───────────────────────────────────────
        if (action === "delete_category") {
            const categoryId = Number(body.category_id);

            if (!Number.isInteger(categoryId) || categoryId <= 0) {
                return badRequest(headers, "Missing or invalid category_id");
            }

            const [result] = await connection.execute(
                `DELETE FROM categories
                 WHERE id = ?
                   AND store_id = ?`,
                [categoryId, store_id]
            );

            if (result.affectedRows === 0) {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({ error: "Category not found" }),
                };
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true }),
            };
        }

        return badRequest(headers, "Invalid action");
    } catch (err) {
        console.error("Lambda error:", err);
        return serverError(headers);
    } finally {
        if (connection) await connection.end();
    }
};