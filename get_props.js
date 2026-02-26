const fs = require('fs');
const path = require('path');

const registryPath = path.join(__dirname, 'registry');
const files = fs.readdirSync(registryPath).filter(f => f.endsWith('.tsx'));

const results = {};

for (const file of files) {
  const content = fs.readFileSync(path.join(registryPath, file), 'utf-8');
  results[file.replace('.tsx', '')] = content;
}

const parsedProps = {};

for (const [key, content] of Object.entries(results)) {
  const propsMatch = content.match(/export\s+(?:interface|type)\s+[A-Za-z]+Props\s*=?\s*(\{)/);
  
  const componentPropsList = [];
  
  if (propsMatch) {
    let braceCount = 0;
    const startIndex = propsMatch.index + propsMatch[0].length - 1;
    let propsBlock = "";
    for (let i = startIndex; i < content.length; i++) {
        if (content[i] === '{') braceCount++;
        else if (content[i] === '}') braceCount--;
        propsBlock += content[i];
        if (braceCount === 0) break;
    }
    // extremely naive regex to find prop lines like `name?: string;` or `delay: number;`
    // this isn't perfect but helps a ton
    const propLines = propsBlock.split('\n');
    for (const line of propLines) {
      const match = line.match(/^\s*([a-zA-Z0-9_]+)\s*\??\s*:\s*([^;]+);?/);
      if (match) {
        componentPropsList.push({
          name: match[1],
          type: match[2].trim(),
          description: "Description coming soon"
        });
      }
    }
  } else {
    // try to find inline props
    const inlineMatch = content.match(/function\s+[A-Za-z]+\s*\(\s*\{\s*([^=}:,]+)(?:[\s\S]*?)\}\s*:\s*(\{[\s\S]*?\})/);
    if(inlineMatch) {
        const propsBlock = inlineMatch[2];
        const propLines = propsBlock.split('\n');
        for (const line of propLines) {
            const match = line.match(/^\s*([a-zA-Z0-9_]+)\s*\??\s*:\s*([^;]+);?/);
            if (match) {
              componentPropsList.push({
                name: match[1],
                type: match[2].trim(),
                description: "Description coming soon"
              });
            }
        }
    }
  }
  
parsedProps[key] = componentPropsList;
}

module.exports = { parsedProps };

if (require.main === module) {
  console.log(JSON.stringify(parsedProps, null, 2));
}
