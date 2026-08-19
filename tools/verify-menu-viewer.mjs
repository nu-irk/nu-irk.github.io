import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const toolsDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.dirname(toolsDirectory);
const html = await readFile(path.join(projectDirectory, "index.html"), "utf8");
const css = await readFile(path.join(projectDirectory, "styles.css"), "utf8");
const script = await readFile(path.join(projectDirectory, "script.js"), "utf8");

assert.equal((html.match(/data-menu-target/g) || []).length, 2, "Нужны две кнопки меню");
assert.equal((html.match(/data-menu-dialog/g) || []).length, 2, "Нужны два нативных окна меню");
assert.ok(html.includes("data-menu-close"), "Нет кнопки закрытия");
assert.ok(html.includes('<dialog class="menu-dialog"'), "Меню должно использовать нативный dialog");
assert.ok(css.includes("height: 100dvh"), "Меню не занимает экран телефона");
assert.ok(html.includes('src="assets/menu/images/main-01.webp"'), "Нет первой страницы меню");
assert.ok(html.includes('loading="lazy" src="assets/menu/images/main-05.webp"'), "Нет ленивой загрузки пятой страницы");
assert.ok(!html.includes('main-06.webp'), "Устаревшая шестая страница всё ещё подключена");
assert.ok(html.includes('loading="lazy" src="assets/menu/images/seasonal-01.webp"'), "Нет сезонного меню");
assert.ok(!html.includes("data-menu-previous"), "Постраничная навигация не должна использоваться");
assert.ok(script.includes('typeof dialog.showModal === "function"'), "Нет нативного открытия dialog");
assert.ok(script.includes('dialog.setAttribute("open", "")'), "Нет запасного режима старых телефонов");
assert.ok(html.includes('data-src="assets/nu-bonus-info-v2.webp'), "Бонусная заставка должна загружаться только при необходимости");
assert.ok(html.includes("data-intro-open"), "Нет повторного вызова правил бонусной программы");
assert.ok(script.includes("function openIntro()"), "Повторный вызов бонусного окна не реализован");

console.log("OK: оба меню работают по лёгкой мобильной схеме «Густого».");
