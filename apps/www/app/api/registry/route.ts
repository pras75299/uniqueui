import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const REGISTRY_CACHE_CONTROL = 'public, s-maxage=60, stale-while-revalidate=600';
const MAX_REGISTRY_SIZE_BYTES = 2 * 1024 * 1024;

function isValidRegistryPayload(data: unknown): boolean {
    return Array.isArray(data) && data.every((entry) => {
        if (!entry || typeof entry !== "object" || Array.isArray(entry)) return false;
        const item = entry as Record<string, unknown>;
        return typeof item.name === "string" && Array.isArray(item.files);
    });
}

function readRegistryFileSafe(filePath: string): unknown {
    const stat = fs.statSync(filePath);
    if (stat.size > MAX_REGISTRY_SIZE_BYTES) {
        throw new Error(`Registry file too large: ${stat.size} bytes`);
    }
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    if (!isValidRegistryPayload(data)) {
        throw new Error("Registry file has invalid shape");
    }
    return data;
}

/**
 * Public registry JSON for CLI and browsers. Intentionally readable from any origin
 * unless REGISTRY_CORS_ORIGIN is set (single origin or comma-separated list for self-hosted).
 */
function corsHeaders(request: Request): Record<string, string> {
    const raw = process.env.REGISTRY_CORS_ORIGIN?.trim();
    const base = { 'Cache-Control': REGISTRY_CACHE_CONTROL } as Record<string, string>;
    if (!raw) {
        return { ...base, 'Access-Control-Allow-Origin': '*' };
    }
    const allowed = raw.split(',').map((o) => o.trim()).filter(Boolean);
    if (allowed.length === 0) {
        return base;
    }
    if (allowed.length === 1) {
        return { ...base, 'Access-Control-Allow-Origin': allowed[0]! };
    }
    const variedBase = { ...base, Vary: 'Origin' };
    const origin = request.headers.get('Origin');
    if (origin && allowed.includes(origin)) {
        return { ...variedBase, 'Access-Control-Allow-Origin': origin };
    }
    // Non-browser clients (no Origin) still get JSON; browsers on a disallowed origin get no ACAO.
    return variedBase;
}

export async function GET(request: Request) {
    try {
        // Try to read from the public directory first (static copy)
        const publicPath = path.join(process.cwd(), 'public', 'registry.json');
        if (fs.existsSync(publicPath)) {
            const data = readRegistryFileSafe(publicPath);
            return NextResponse.json(data, {
                headers: corsHeaders(request),
            });
        }

        // Fallback: try to read from project root (monorepo)
        const rootPath = path.join(process.cwd(), '..', '..', 'registry.json');
        if (fs.existsSync(rootPath)) {
            const data = readRegistryFileSafe(rootPath);
            return NextResponse.json(data, {
                headers: corsHeaders(request),
            });
        }

        return NextResponse.json(
            { error: 'Registry not found' },
            { status: 404 }
        );
    } catch (error) {
        console.error('[registry API]', error);
        return NextResponse.json(
            { error: 'Failed to load registry' },
            { status: 500 }
        );
    }
}
