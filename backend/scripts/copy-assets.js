const fs = require("node:fs");
const path = require("node:path");

const srcDir = path.join(__dirname, "..", "src", "assets");
const destDir = path.join(__dirname, "..", "dist", "assets");

fs.mkdirSync(destDir, { recursive: true });

for (const nome of fs.readdirSync(srcDir)) {
  fs.writeFileSync(path.join(destDir, nome), fs.readFileSync(path.join(srcDir, nome)));
}
