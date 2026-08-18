import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const toolsDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.dirname(toolsDirectory);
const rootPage = await readFile(path.join(projectDirectory, "index.html"), "utf8");

for (let table = 1; table <= 12; table += 1) {
  const label = String(table).padStart(2, "0");
  const tableDirectory = path.join(projectDirectory, `table-${label}`);
  const tablePage = rootPage
    .replace("<head>", '<head>\n    <base href="../" />')
    .replace("<title>Не усложняй</title>", `<title>Стол ${label} — Не усложняй</title>`)
    .replace("<body>", `<body data-table="${table}">`);

  await mkdir(tableDirectory, { recursive: true });
  await writeFile(path.join(tableDirectory, "index.html"), tablePage, "utf8");
}

console.log("Созданы 12 самостоятельных страниц столов.");
