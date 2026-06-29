import { NextResponse } from "next/server";

const GITHUB_REPO = "pras75299/uniqueui";
const NPM_PACKAGE = "uniqueui-cli";
const REVALIDATE = 3600; // 1 hour

// Cache the rendered response on the server for an hour.
// Note: route segment config must be a static literal, not a reference.
export const revalidate = 3600;

async function getGitHub(): Promise<{ stars: number | null; forks: number | null }> {
  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}`, {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) return { stars: null, forks: null };
    const data = await res.json();
    return {
      stars: typeof data.stargazers_count === "number" ? data.stargazers_count : null,
      forks: typeof data.forks_count === "number" ? data.forks_count : null,
    };
  } catch {
    return { stars: null, forks: null };
  }
}

async function getNpmDownloads(): Promise<{ downloads: number | null }> {
  try {
    // A wide range auto-clamps to the first published day, so this is the
    // effective all-time total for the package.
    const today = new Date().toISOString().slice(0, 10);
    const res = await fetch(
      `https://api.npmjs.org/downloads/point/2015-01-01:${today}/${NPM_PACKAGE}`,
      { next: { revalidate: REVALIDATE } },
    );
    if (!res.ok) return { downloads: null };
    const data = await res.json();
    return { downloads: typeof data.downloads === "number" ? data.downloads : null };
  } catch {
    return { downloads: null };
  }
}

export async function GET() {
  const [gh, npm] = await Promise.all([getGitHub(), getNpmDownloads()]);
  return NextResponse.json(
    { ...gh, ...npm },
    {
      headers: {
        // Let browsers/CDN reuse the value for an hour, serve stale while revalidating.
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    },
  );
}
