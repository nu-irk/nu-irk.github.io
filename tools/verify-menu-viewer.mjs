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
assert.ok(html.includes("data-menu-image"), "Нет облегчённого просмотрщика изображений");
assert.ok(html.includes("data-menu-previous"), "Нет перехода на предыдущую страницу");
assert.ok(html.includes("data-menu-next"), "Нет перехода на следующую страницу");
assert.ok(html.includes("data-menu-external"), "Нет резервной ссылки на PDF");
assert.ok(html.includes("data-menu-close"), "Нет кнопки закрытия");
assert.ok(css.includes(".menu-viewer[hidden]"), "Окно не скрывается");
assert.ok(css.includes("position: fixed"), "Окно не закреплено поверх страницы");
assert.ok(script.includes('event.preventDefault()'), "Прямая загрузка PDF не перехватывается");
assert.ok(script.includes('"assets/menu/images/main-01.webp"'), "Нет первой страницы меню");
assert.ok(script.includes('"assets/menu/images/main-05.webp"'), "Нет пятой страницы меню");
assert.ok(!script.includes('"assets/menu/images/main-06.webp"'), "Устаревшая шестая страница всё ещё подключена");
assert.ok(script.includes('"assets/menu/images/seasonal-01.webp"'), "Нет сезонного меню");
assert.ok(script.includes('menuImage.src = activeMenuPages[activeMenuPage]'), "Страница не загружается в окно");
assert.ok(script.includes('menuImage.removeAttribute("src")'), "Изображение не выгружается при закрытии");

console.log("OK: оба меню открываются как лёгкие WebP с постраничной навигацией.");
