const fs = require('fs');
const ts = require('typescript');

const content = fs.readFileSync('./registry/floating-dock.tsx', 'utf-8');
const sourceFile = ts.createSourceFile('floating-dock.tsx', content, ts.ScriptTarget.Latest, true);

let propsList = [];
let propsNode = null;
ts.forEachChild(sourceFile, node => {
    if (ts.isInterfaceDeclaration(node) && node.name.text.endsWith('Props')) {
        propsNode = node;
    }
});

if (propsNode && ts.isInterfaceDeclaration(propsNode)) {
    for (const member of propsNode.members) {
        if (ts.isPropertySignature(member)) {
            const name = member.name.getText(sourceFile);
            const typeStr = member.type ? member.type.getText(sourceFile).replace(/\s+/g, ' ') : "any";
            propsList.push({ name, type: typeStr });
        }
    }
}
console.log(JSON.stringify(propsList, null, 2));
