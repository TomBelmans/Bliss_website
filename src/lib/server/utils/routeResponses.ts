import { NextResponse } from "next/server";

/** Retourneert een 200 OK response. */
export function ok(body?: unknown, headers: HeadersInit = {}): NextResponse {
  return buildResponse(200, body, headers);
}

/** Retourneert een 400 Bad Request response. */
export function badRequest(body?: unknown, headers: HeadersInit = {}): NextResponse {
  return buildResponse(400, body, headers);
}

/** Retourneert een 401 Unauthorized response. */
export function unauthorized(body?: unknown, headers: HeadersInit = {}): NextResponse {
  return buildResponse(401, body, headers);
}

/** Retourneert een 403 Forbidden response. */
export function forbidden(body?: unknown, headers: HeadersInit = {}): NextResponse {
  return buildResponse(403, body, headers);
}

/** Retourneert een 404 Not Found response. */
export function notFound(body?: unknown, headers: HeadersInit = {}): NextResponse {
  return buildResponse(404, body, headers);
}

/** Retourneert een 409 Conflict response. */
export function conflict(body?: unknown, headers: HeadersInit = {}): NextResponse {
  return buildResponse(409, body, headers);
}

/** Retourneert een 500 Internal Server Error response. */
export function serverError(body?: unknown, headers: HeadersInit = {}): NextResponse {
  return buildResponse(500, body, headers);
}

function buildResponse(status: number, body?: unknown, headers: HeadersInit = {}): NextResponse {
  return NextResponse.json(body ?? null, { status, headers });
}
