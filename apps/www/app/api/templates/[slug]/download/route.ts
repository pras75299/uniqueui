import { NextResponse } from "next/server";
import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";
import JSZip from "jszip";
import { TEMPLATES } from "@/config/templates";

// ── Static file content generators ───────────────────────────────────────────

function makePackageJson(id: string, _name: string) {
  return JSON.stringify(
    {
      name: `${id}-template`,
      version: "0.1.0",
      private: true,
      scripts: {
        dev: "next dev",
        build: "next build",
        start: "next start",
        lint: "next lint",
        "ui:add": "npx uniqueui add",
      },
      dependencies: {
        clsx: "^2.1.1",
        "lucide-react": "^0.562.0",
        motion: "^12.26.0",
        next: "16.1.1",
        react: "19.2.3",
        "react-dom": "19.2.3",
        "tailwind-merge": "^3.4.0",
      },
      devDependencies: {
        "@tailwindcss/postcss": "^4",
        "@types/node": "^20",
        "@types/react": "^19",
        "@types/react-dom": "^19",
        eslint: "^9",
        "eslint-config-next": "16.1.1",
        tailwindcss: "^4",
        typescript: "^5",
        "uniqueui-cli": "^1.0.0",
      },
    },
    null,
    2
  );
}

const NEXT_CONFIG = `import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
`;

const TSCONFIG = JSON.stringify(
  {
    compilerOptions: {
      target: "ES2017",
      lib: ["dom", "dom.iterable", "esnext"],
      allowJs: true,
      skipLibCheck: true,
      strict: true,
      noEmit: true,
      esModuleInterop: true,
      module: "esnext",
      moduleResolution: "bundler",
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: "react-jsx",
      incremental: true,
      plugins: [{ name: "next" }],
      paths: { "@/*": ["./*"] },
    },
    include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
    exclude: ["node_modules"],
  },
  null,
  2
);

const POSTCSS_CONFIG = `const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
`;

const COMPONENTS_JSON = JSON.stringify(
  {
    $schema: "https://uniqueui.com/schema.json",
    style: "default",
    rsc: true,
    tsx: true,
    tailwind: {
      config: "tailwind.config.ts",
      css: "app/globals.css",
      baseColor: "slate",
      cssVariables: true,
    },
    aliases: {
      components: "@/components",
      utils: "@/lib",
    },
    paths: {
      components: "components/ui",
      lib: "lib",
    },
  },
  null,
  2
);

const GLOBALS_CSS = `@import "tailwindcss";

@layer utilities {
  body {
    min-height: 100vh;
  }
}

/* ── SaaS Landing Template shared styles ─────────────────────────────────── */

.fs-syne { font-family: var(--font-syne, 'Syne', system-ui, sans-serif); }

.grad-text {
  background: linear-gradient(135deg, #67E8F9 0%, #22D3EE 50%, #818CF8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.btn-outline {
  background: transparent;
  color: #94A3B8;
  font-weight: 500;
  padding: 0.75rem 1.75rem;
  border-radius: 0.75rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: color 0.18s, border-color 0.18s;
  border: 1px solid rgba(34, 211, 238, 0.2);
  font-size: 0.95rem;
  text-decoration: none;
}
.btn-outline:hover { color: #22D3EE; border-color: rgba(34, 211, 238, 0.5); }

.nav-link {
  color: #94A3B8;
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.15s;
  cursor: pointer;
}
.nav-link:hover { color: #F0F9FF; }

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.85rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  background: rgba(34, 211, 238, 0.1);
  border: 1px solid rgba(34, 211, 238, 0.25);
  color: #22D3EE;
}

.feat-tag {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  background: rgba(34, 211, 238, 0.1);
  color: #22D3EE;
  font-size: 0.7rem;
  font-weight: 600;
  border-radius: 0.35rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.check { color: #22D3EE; font-weight: 700; margin-right: 0.5rem; }

.section-divider {
  width: 48px;
  height: 3px;
  background: linear-gradient(90deg, #22D3EE, transparent);
  border-radius: 2px;
  margin-bottom: 1rem;
}

.toggle-pill {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #0D1634;
  border: 1px solid rgba(34, 211, 238, 0.15);
  border-radius: 999px;
  padding: 0.3rem 0.75rem;
}

.toggle-option {
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  transition: background 0.18s, color 0.18s;
  color: #64748B;
}
.toggle-option.active {
  background: rgba(34, 211, 238, 0.15);
  color: #22D3EE;
}

.testimonial-card {
  background: #0D1634;
  border: 1px solid rgba(34, 211, 238, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@keyframes ping {
  75%, 100% { transform: scale(2); opacity: 0; }
}
.badge-dot-ping {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: #22D3EE;
  animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes iso-float {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-14px); }
}
@keyframes iso-float-b {
  0%, 100% { transform: translateY(0px); }
  50%      { transform: translateY(-10px); }
}
@keyframes iso-float-c {
  0%, 100% { transform: translateY(0px); }
  50%      { transform: translateY(-8px); }
}
@keyframes pulse-glow {
  0%, 100% { opacity: 0.5; }
  50%      { opacity: 0.85; }
}
.iso-main  { animation: iso-float   4s   ease-in-out infinite; }
.iso-a     { animation: iso-float-b 3.4s ease-in-out infinite 0.6s; }
.iso-b     { animation: iso-float-c 4.8s ease-in-out infinite 1.1s; }
.iso-c     { animation: iso-float-b 3.8s ease-in-out infinite 0.3s; }
.iso-d     { animation: iso-float-c 4.2s ease-in-out infinite 0.9s; }
.glow-pulse { animation: pulse-glow 3s ease-in-out infinite; }

@media (max-width: 768px) {
  .hero-grid        { grid-template-columns: 1fr !important; }
  .stats-grid       { grid-template-columns: 1fr 1fr !important; }
  .pricing-grid     { grid-template-columns: 1fr !important; }
  .testimonials-grid { grid-template-columns: 1fr !important; }
}
`;

function makeRootLayout(templateName: string) {
  return `import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "${templateName}",
  description: "Built with UniqueUI — uniqueui.com",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={\`\${syne.variable} \${dmSans.variable}\`}>
      <body>{children}</body>
    </html>
  );
}
`;
}

function makePageTsx(slug: string) {
  // Convert slug to PascalCase component name
  const componentName = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");

  // Import resolves to templates/{slug}/index.tsx (folder-based) or templates/{slug}.tsx
  return `import ${componentName} from "@/templates/${slug}";

export default function Page() {
  return <${componentName} />;
}
`;
}

const LIB_UTILS = `import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`;

const README = (name: string, id: string) => `# ${name} — UniqueUI Template

## Getting started

\`\`\`bash
npm install
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to see your template.

## What's included

- \`templates/${id}.tsx\` — the main template component
- \`components/ui/\` — UniqueUI components used by this template (pre-installed)
- \`lib/utils.ts\` — \`cn()\` utility (clsx + tailwind-merge)
- \`components.json\` — UniqueUI project config (paths & aliases)

## Add more UniqueUI components

\`\`\`bash
npm run ui:add <component-name>
# example
npm run ui:add ripple
\`\`\`

Powered by \`uniqueui-cli\` (installed as a devDependency).
Run \`npx uniqueui --help\` to see all available components.

## Customise

Edit \`templates/${id}.tsx\` to change copy, colours, and layout.
Components in \`components/ui/\` are fully self-contained — edit them freely.

---

Built with [UniqueUI](https://uniqueui.com)
`;

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const template = TEMPLATES.find((t) => t.id === slug && t.status === "available");
  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  const cwd = process.cwd(); // apps/www

  // ── Read template source files (single .tsx or folder with index.tsx) ───
  const templateFiles: Record<string, string> = {};

  const folderPath = join(cwd, "templates", slug);
  const singleFilePath = join(cwd, "templates", `${slug}.tsx`);

  if (existsSync(folderPath) && statSync(folderPath).isDirectory()) {
    // Folder-based template: read all .tsx files recursively
    function collectFiles(dir: string) {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
          collectFiles(fullPath);
        } else if (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts")) {
          const relPath = relative(folderPath, fullPath);
          templateFiles[relPath] = readFileSync(fullPath, "utf-8");
        }
      }
    }
    collectFiles(folderPath);
  } else if (existsSync(singleFilePath)) {
    templateFiles[`${slug}.tsx`] = readFileSync(singleFilePath, "utf-8");
  } else {
    return NextResponse.json({ error: "Template source not found" }, { status: 404 });
  }

  // ── Read required UI component files ────────────────────────────────────
  const componentFiles = template.componentFiles ?? [];
  const componentSources: Record<string, string> = {};
  for (const file of componentFiles) {
    const filePath = join(cwd, "components", "ui", `${file}.tsx`);
    if (existsSync(filePath)) {
      componentSources[file] = readFileSync(filePath, "utf-8");
    }
  }

  // ── Build ZIP ────────────────────────────────────────────────────────────
  const zip = new JSZip();
  const root = zip.folder(`${slug}-template`)!;

  // Config files
  root.file("package.json", makePackageJson(slug, template.name));
  root.file("next.config.ts", NEXT_CONFIG);
  root.file("tsconfig.json", TSCONFIG);
  root.file("postcss.config.mjs", POSTCSS_CONFIG);
  root.file("README.md", README(template.name, slug));
  root.file("components.json", COMPONENTS_JSON);

  // App directory
  const app = root.folder("app")!;
  app.file("layout.tsx", makeRootLayout(template.name));
  app.file("page.tsx", makePageTsx(slug));
  app.file("globals.css", GLOBALS_CSS);

  // lib/utils.ts
  root.folder("lib")!.file("utils.ts", LIB_UTILS);

  // Template files (folder structure preserved under templates/{slug}/)
  const templatesFolder = root.folder("templates")!.folder(slug)!;
  for (const [relPath, source] of Object.entries(templateFiles)) {
    templatesFolder.file(relPath, source);
  }

  // UI components
  const uiFolder = root.folder("components")!.folder("ui")!;
  for (const [name, source] of Object.entries(componentSources)) {
    uiFolder.file(`${name}.tsx`, source);
  }

  // ── Generate and return ZIP ──────────────────────────────────────────────
  const zipBuffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  return new NextResponse(zipBuffer.buffer as ArrayBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${slug}-template.zip"`,
      "Content-Length": String(zipBuffer.byteLength),
    },
  });
}
