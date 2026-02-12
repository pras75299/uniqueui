import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        // Try to read from the public directory first (static copy)
        const publicPath = path.join(process.cwd(), 'public', 'registry.json');
        if (fs.existsSync(publicPath)) {
            const data = JSON.parse(fs.readFileSync(publicPath, 'utf-8'));
            return NextResponse.json(data, {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600',
                },
            });
        }

        // Fallback: try to read from project root (monorepo)
        const rootPath = path.join(process.cwd(), '..', '..', 'registry.json');
        if (fs.existsSync(rootPath)) {
            const data = JSON.parse(fs.readFileSync(rootPath, 'utf-8'));
            return NextResponse.json(data, {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600',
                },
            });
        }

        return NextResponse.json(
            { error: 'Registry not found' },
            { status: 404 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to load registry' },
            { status: 500 }
        );
    }
}
