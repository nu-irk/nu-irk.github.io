import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const toolsDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.dirname(toolsDirectory);
const rootPage = await readFile(path.join(projectDirectory, "index.html"), "utf8");
const script = await readFile(path.join(projectDirectory, "script.js"), "utf8");
const paymentLinks = Object.fromEntries(
  [...script.matchAll(/^\s*(\d+):\s*"(https:\/\/netmonet\.co\/tip\/session\?[^"]+)",?$/gm)].map(
    (match) => [Number(match[1]), match[2]],
  ),
);

if (Object.keys(paymentLinks).length !== 12) {
  throw new Error("В script.js должны быть заданы 12 ссылок Netmonet.");
}

for (let table = 1; table <= 12; table += 1) {
  const label = String(table).padStart(2, "0");
  const tableDirectory = path.join(projectDirectory, `table-${label}`);
  const tablePage = rootPage
    .replace("<head>", '<head>\n    <base href="../" />')
    .replace("<title>Не усложняй</title>", `<title>Стол ${label} — Не усложняй</title>`)
    .replace("<body>", `<body data-table="${table}">`)
    .replace(
      '<button class="hotspot payment" type="button" data-pay-table aria-label="Оплатить счёт или оставить чаевые"></button>',
      `<a class="hotspot payment" href="${paymentLinks[table]}" data-pay-table aria-label="Оплатить счёт или оставить чаевые за столом ${label}"></a>`,
    );

  await mkdir(tableDirectory, { recursive: true });
  await writeFile(path.join(tableDirectory, "index.html"), tablePage, "utf8");
}

console.log("Созданы 12 самостоятельных страниц столов.");
