import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const toolsDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.dirname(toolsDirectory);
const source = await readFile(path.join(projectDirectory, "script.js"), "utf8");
const links = Object.fromEntries(
  [...source.matchAll(/^\s*(\d+):\s*"(https:\/\/netmonet\.co\/[^"]+)",?$/gm)].map(
    (match) => [match[1], match[2]],
  ),
);

for (let table = 1; table <= 12; table += 1) {
  const label = String(table).padStart(2, "0");
  const page = await readFile(
    path.join(projectDirectory, `table-${label}`, "index.html"),
    "utf8",
  );
  assert.ok(
    page.includes(`href="${links[String(table)]}" data-pay-table`),
    `Стол ${table}: в HTML встроен неверный Netmonet`,
  );

  let paymentHandler;
  let assignedUrl;
  const paymentButton = {
    tagName: "BUTTON",
    setAttribute() {},
    addEventListener(event, handler) {
      if (event === "click") paymentHandler = handler;
    },
  };
  const document = {
    title: "",
    body: {
      dataset: { table: String(table) },
      classList: { add() {}, remove() {} },
    },
    querySelector(selector) {
      return selector === "[data-pay-table]" ? paymentButton : null;
    },
    querySelectorAll() {
      return [];
    },
    addEventListener() {},
  };
  const window = {
    location: {
      search: "",
      assign(url) {
        assignedUrl = url;
      },
    },
    localStorage: {
      getItem() {
        return "seen";
      },
      setItem() {},
    },
    requestAnimationFrame() {},
  };

  vm.runInNewContext(source, {
    document,
    window,
    URLSearchParams,
    Object,
  });
  assert.equal(typeof paymentHandler, "function", `Стол ${table}: кнопка не активна`);
  paymentHandler();
  assert.equal(assignedUrl, links[String(table)], `Стол ${table}: неверный Netmonet`);
}

console.log("OK: прямые ссылки и резервная JS-маршрутизация проверены для 12 столов.");
