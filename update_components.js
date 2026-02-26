const fs = require('fs');
const path = require('path');

const propsData = require('./get_props.js').parsedProps;

const parsedProps = propsData;

const configPath = path.join(__dirname, 'apps/www/config/components.ts');
let configContent = fs.readFileSync(configPath, 'utf-8');

// Update ComponentItem type
configContent = configContent.replace(
  /export type ComponentItem = \{[\s\S]*?\};/,
  "export type ComponentItem = {\n" +
  "    slug: string;\n" +
  "    name: string;\n" +
  "    description: string;\n" +
  "    installCmd: string;\n" +
  "    icon: ElementType; // Lucide icon\n" +
  "    category?: string;\n" +
  "    props?: { name: string; type: string; default?: string; description: string }[];\n" +
  "    usageCode?: string;\n" +
  "};"
);

if (!/import\s+type\s+\{\s*ElementType\s*\}\s+from\s+['"]react['"]/.test(configContent)) {
  configContent = `import type { ElementType } from 'react';\n` + configContent;
}

for (const [slug, propsObj] of Object.entries(parsedProps)) {
  const propsString = JSON.stringify(propsObj, null, 6);
  
  const componentNames = {
    "moving-border": "Button",
    "typewriter-text": "TypewriterText",
    "3d-tilt-card": "TiltCard",
    "spotlight-card": "SpotlightCard",
    "aurora-background": "AuroraBackground",
    "animated-tabs": "AnimatedTabs",
    "magnetic-button": "MagneticButton",
    "infinite-marquee": "InfiniteMarquee",
    "scroll-reveal": "ScrollReveal",
    "skeleton-shimmer": "SkeletonShimmer",
    "morphing-modal": "MorphingModal",
    "gradient-text-reveal": "GradientTextReveal",
    "scramble-text": "ScrambleText",
    "meteors-card": "MeteorsCard",
    "flip-card": "FlipCard",
    "dot-grid-background": "DotGridBackground",
    "floating-dock": "FloatingDock",
    "confetti-burst": "ConfettiBurst",
    "drawer-slide": "DrawerSlide",
    "notification-stack": "NotificationStack",
    "animated-timeline": "AnimatedTimeline"
  };
  const cName = componentNames[slug] || "Component";
  let usageCode = "import { " + cName + " } from \"@/components/ui/" + slug + "\";\n\nexport default function Example() {\n  return (\n    <" + cName + ">\n      Content goes here\n    </" + cName + ">\n  );\n}";
  
  if (slug === 'moving-border') usageCode = "import { Button } from \"@/components/ui/moving-border\";\n\nexport default function Example() {\n  return (\n    <Button borderRadius=\"1.75rem\">\n      Click me\n    </Button>\n  );\n}";
  if (slug === 'typewriter-text') usageCode = "import { TypewriterText } from \"@/components/ui/typewriter-text\";\n\nexport default function Example() {\n  return (\n    <TypewriterText words={[\"Hello\", \"World\"]} />\n  );\n}";
  if (slug === 'animated-tabs') usageCode = "import { AnimatedTabs } from \"@/components/ui/animated-tabs\";\n\nexport default function Example() {\n  return (\n    <AnimatedTabs tabs={[{ id: \"1\", label: \"Tab 1\", content: \"Content 1\" }]} />\n  );\n}";
  if (slug === 'floating-dock') usageCode = `import { FloatingDock } from "@/components/ui/floating-dock";
import { Anchor, Sparkles } from "lucide-react";

export default function Example() {
  const items = [
    { id: "1", label: "Home", icon: <Anchor className="w-5 h-5" />, href: "#" },
    { id: "2", label: "Magic", icon: <Sparkles className="w-5 h-5" />, href: "#" }
  ];

  return (
    <div className="h-[200px] w-full flex items-center justify-center">
      <FloatingDock items={items} position="bottom" />
    </div>
  );
}`;
  
  let startIdx = configContent.indexOf(`slug: "${slug}",`);
  if (startIdx !== -1) {
    let blockStart = configContent.lastIndexOf('{', startIdx);
    let braceCount = 0;
    let blockEnd = -1;
    for (let i = blockStart; i < configContent.length; i++) {
        if (configContent[i] === '{') braceCount++;
        else if (configContent[i] === '}') braceCount--;
        if (braceCount === 0) {
            blockEnd = i;
            break;
        }
    }
    
    if (blockEnd !== -1) {
        let blockText = configContent.substring(blockStart, blockEnd + 1);
        
        let propsMatch = blockText.match(/\n\s*props\s*:/);
        let usageMatch = blockText.match(/\n\s*usageCode\s*:/);
        
        let minCut = blockText.length - 1; // before the closing brace
        if (propsMatch) minCut = Math.min(minCut, propsMatch.index);
        if (usageMatch) minCut = Math.min(minCut, usageMatch.index);
        
        let cleanedBlock = blockText.substring(0, minCut);
        cleanedBlock = cleanedBlock.replace(/,\s*$/, ''); // strip trailing comma before we append

        const injectContent = "props: " + propsString + ",\n        usageCode: `" + usageCode.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$') + "`";

        const updatedBlock = cleanedBlock + ",\n        " + injectContent + "\n    }";

        configContent =
          configContent.substring(0, blockStart) +
          updatedBlock +
          configContent.substring(blockEnd + 1);
    }
  }
}

// Ensure only the final array terminator is normalized
configContent = configContent.replace(/,\s*\n(\s*\]\s*;?\s*)$/m, "\n$1");

fs.writeFileSync(configPath, configContent);
console.log('Successfully updated components.ts');
