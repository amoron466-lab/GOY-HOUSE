const fs = require('fs');
const path = require('path');

try {
  const filePath = path.join(__dirname, 'src/assets/logo.png');
  const fileBuffer = fs.readFileSync(filePath);
  const base64 = fileBuffer.toString('base64');
  console.log(`data:image/png;base64,${base64.substring(0, 50)}... [Total length: ${base64.length}]`);
  
  // Write the base64 string to a JS file so we can import it
  fs.writeFileSync(
    path.join(__dirname, 'src/assets/logoBase64.ts'), 
    `export const logoBase64 = "data:image/png;base64,${base64}";\n`
  );
  console.log('Successfully created src/assets/logoBase64.ts');
} catch (e) {
  console.error(e);
}
