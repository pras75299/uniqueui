const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const registryPath = path.join(__dirname, 'registry');
const files = fs.readdirSync(registryPath).filter(f => f.endsWith('.tsx'));

const parsedProps = {};

for (const file of files) {
  const content = fs.readFileSync(path.join(registryPath, file), 'utf-8');
  const key = file.replace('.tsx', '');
  
  const sourceFile = ts.createSourceFile(
      file,
      content,
      ts.ScriptTarget.Latest,
      true
  );

  let propsList = [];
  let propsNode = null;
  
  // 1. Find dedicated Props interface or type alias
  ts.forEachChild(sourceFile, node => {
      if ((ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) && node.name.text.endsWith('Props')) {
          propsNode = node;
      }
  });

  // 2. If not found, look for inline props in exported function
  if (!propsNode) {
      ts.forEachChild(sourceFile, node => {
          if (ts.isFunctionDeclaration(node) && node.name && node.name.text[0] === node.name.text[0].toUpperCase()) {
              const params = node.parameters;
              if (params.length > 0) {
                  const firstParam = params[0];
                  if (firstParam.type && ts.isTypeLiteralNode(firstParam.type)) {
                      propsNode = firstParam.type;
                  }
              }
          } else if (ts.isVariableStatement(node)) {
             const declarationList = node.declarationList;
             for (const decl of declarationList.declarations) {
                 if (decl.name && decl.name.text && decl.name.text[0] === decl.name.text[0].toUpperCase()) {
                     if (decl.initializer && (ts.isArrowFunction(decl.initializer) || ts.isFunctionExpression(decl.initializer))) {
                         const params = decl.initializer.parameters;
                         if (params.length > 0) {
                             const firstParam = params[0];
                             if (firstParam.type && ts.isTypeLiteralNode(firstParam.type)) {
                                 propsNode = firstParam.type;
                             }
                         }
                     }
                 }
             }
          }
      });
  }

  if (propsNode) {
      let members = [];
      if (ts.isInterfaceDeclaration(propsNode)) {
          members = propsNode.members;
      } else if (ts.isTypeAliasDeclaration(propsNode) && ts.isTypeLiteralNode(propsNode.type)) {
          members = propsNode.type.members;
      } else if (ts.isTypeLiteralNode(propsNode)) {
          members = propsNode.members;
      }
      
      for (const member of members) {
          if (ts.isPropertySignature(member)) {
              const name = member.name.getText(sourceFile);
              let typeStr = "any";
              if (member.type) {
                  typeStr = member.type.getText(sourceFile).replace(/\s+/g, ' ');
              }
              propsList.push({
                  name: name,
                  type: typeStr,
                  description: "Description coming soon"
              });
          }
      }
  }
  
  parsedProps[key] = propsList;
}

module.exports = { parsedProps };

if (require.main === module) {
  console.log(JSON.stringify(parsedProps, null, 2));
}
