import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const toolsDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.dirname(toolsDirectory);
const html = await readFile(path.join(projectDirectory, "index.html"), "utf8");
const css = await readFile(path.join(projectDirectory, "styles.css"), "utf8");
const script = await readFile(path.join(projectDirectory, "script.js"), "utf8");

assert.equal((html.match(/data-menu-open/g) || []).length, 2, "Нужны две кнопки меню");
assert.ok(html.includes("data-menu-viewer"), "Нет всплывающего окна меню");
assert.ok(html.includes("data-menu-frame"), "Нет встроенного просмотрщика PDF");
assert.ok(html.includes("data-menu-external"), "Нет резервной ссылки на PDF");
assert.ok(html.includes("data-menu-close"), "Нет кнопки закрытия");
assert.ok(css.includes(".menu-viewer[hidden]"), "Окно не скрывается");
assert.ok(css.includes("position: fixed"), "Окно не закреплено поверх страницы");
assert.ok(script.includes('event.preventDefault()'), "Прямая загрузка PDF не перехватывается");
assert.ok(script.includes('menuFrame.src = `${url}#view=FitH&toolbar=0&navpanes=0`'), "PDF не загружается в окно");
assert.ok(script.includes('menuFrame.src = "about:blank"'), "PDF не выгружается при закрытии");

console.log("OK: оба PDF открываются во всплывающем просмотрщике с резервной ссылкой.");
