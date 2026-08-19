import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const toolsDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.dirname(toolsDirectory);
const script = await readFile(path.join(projectDirectory, "script.js"), "utf8");
const linkPattern = /^\s*(\d+):\s*"(https:\/\/netmonet\.co\/tip\/session\?[^"]+)",?$/gm;
const links = Object.fromEntries(
  [...script.matchAll(linkPattern)].map((match) => [Number(match[1]), match[2]]),
);

assert.deepEqual(Object.keys(links).map(Number), [...Array(12)].map((_, index) => index + 1));
assert.equal(new Set(Object.values(links)).size, 12, "Ссылки Netmonet должны быть уникальными");

for (let table = 1; table <= 12; table += 1) {
  const label = String(table).padStart(2, "0");
  const page = await readFile(
    path.join(projectDirectory, `table-${label}`, "index.html"),
    "utf8",
  );
  assert.ok(page.includes(`<body data-table="${table}">`), `Стол ${label}: не задан номер`);
  assert.ok(page.includes('<base href="../" />'), `Стол ${label}: неверная база ресурсов`);
  assert.ok(!page.includes("http-equiv=\"refresh\""), `Стол ${label}: остался редирект`);
  assert.ok(page.includes(`Стол ${label} — Не усложняй`), `Стол ${label}: неверный заголовок`);
  assert.ok(
    page.includes(`href="${links[table]}" data-pay-table`),
    `Стол ${label}: ссылка Netmonet не встроена в страницу`,
  );
  assert.ok(
    !page.includes('<button class="hotspot payment"'),
    `Стол ${label}: оплата всё ещё зависит от JavaScript`,
  );
  assert.equal(
    (page.match(/data-menu-target/g) || []).length,
    2,
    `Стол ${label}: должны быть две кнопки меню`,
  );
  assert.equal(
    (page.match(/data-menu-dialog/g) || []).length,
    2,
    `Стол ${label}: нет двух нативных окон меню`,
  );
  assert.ok(
    page.includes("data-bonus-intro") &&
      page.includes('data-src="assets/nu-bonus-info-v2.webp') &&
      page.includes("data-intro-open"),
    `Стол ${label}: нет приветственного информационного окна`,
  );
}

console.log("OK: 12 страниц, 12 ссылок Netmonet и информационное окно на каждом столе.");
