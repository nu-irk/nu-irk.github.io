const paymentLinks = {
  1: "https://netmonet.co/tip/session?qrId=0c70df9f-7b8f-4570-a082-96766b0bdc1b&wpid=5296049&o=4",
  2: "https://netmonet.co/tip/session?qrId=7c307886-e61a-4a15-b735-4368cae03d6f&wpid=5296049&o=4",
  3: "https://netmonet.co/tip/session?qrId=90d43b54-947d-40ca-a5d3-00399f166696&wpid=5296049&o=4",
  4: "https://netmonet.co/tip/session?qrId=24f9eff0-1304-4e19-a093-579f0417356a&wpid=5296049&o=4",
  5: "https://netmonet.co/tip/session?qrId=6723a3f6-c287-4a69-bf21-6f3b5a43b39d&wpid=5296049&o=4",
  6: "https://netmonet.co/tip/session?qrId=0f129369-86fc-421e-a3ed-d5c24fe860c5&wpid=5296049&o=4",
  7: "https://netmonet.co/tip/session?qrId=184b07cf-f593-4903-b7f7-3d999e17c645&wpid=5296049&o=4",
  8: "https://netmonet.co/tip/session?qrId=1d7d9b21-d1c5-4d47-bace-9c2043696815&wpid=5296049&o=4",
  9: "https://netmonet.co/tip/session?qrId=f4776ee1-22e6-490a-a132-16e8d3921abf&wpid=5296049&o=4",
  10: "https://netmonet.co/tip/session?qrId=e0ec61c0-bf2d-413d-a766-4a95c70c8da6&wpid=5296049&o=4",
  11: "https://netmonet.co/tip/session?qrId=6de1dd0b-ca6f-4ac2-bf6f-46bf9856915b&wpid=5296049&o=4",
  12: "https://netmonet.co/tip/session?qrId=1dfc490d-6b5d-46ba-bdf8-75e5a8d869c4&wpid=5296049&o=4",
};

const paymentButton = document.querySelector("[data-pay-table]");
const requestedTable =
  document.body.dataset.table ||
  new URLSearchParams(window.location.search).get("table");
const activeTable = Object.prototype.hasOwnProperty.call(paymentLinks, requestedTable)
  ? requestedTable
  : null;

if (activeTable) {
  const tableLabel = activeTable.padStart(2, "0");
  document.title = `Стол ${tableLabel} — Не усложняй`;
  paymentButton.setAttribute(
    "aria-label",
    `Оплатить счёт или оставить чаевые за столом ${tableLabel}`,
  );
  if (paymentButton.tagName !== "A") {
    paymentButton.addEventListener("click", () => {
      window.location.assign(paymentLinks[activeTable]);
    });
  }
} else {
  paymentButton.setAttribute(
    "aria-label",
    "Как открыть оплату счёта своего стола",
  );
  paymentButton.addEventListener("click", () => {
    document.querySelector("[data-table-notice]")?.showModal();
  });
}

const introDialog = document.querySelector("[data-bonus-intro]");
const introCloseButtons = document.querySelectorAll("[data-intro-close]");
const introStorageKey = "nu-bonus-intro-v2";

function hasSeenIntro() {
  try {
    return window.localStorage.getItem(introStorageKey) === "seen";
  } catch {
    return false;
  }
}

function rememberIntro() {
  try {
    window.localStorage.setItem(introStorageKey, "seen");
  } catch {
    // The site remains usable when private browsing blocks local storage.
  }
}

function closeIntro() {
  rememberIntro();
  if (introDialog?.open) introDialog.close();
}

if (introDialog && !hasSeenIntro()) {
  window.requestAnimationFrame(() => introDialog.showModal());
}

introCloseButtons.forEach((button) => {
  button.addEventListener("click", closeIntro);
});

introDialog?.addEventListener("cancel", rememberIntro);
introDialog?.addEventListener("click", (event) => {
  if (event.target === introDialog) closeIntro();
});

const tableNotice = document.querySelector("[data-table-notice]");
document.querySelector("[data-table-notice-close]")?.addEventListener("click", () => {
  tableNotice?.close();
});
tableNotice?.addEventListener("click", (event) => {
  if (event.target === tableNotice) tableNotice.close();
});

const menuViewer = document.querySelector("[data-menu-viewer]");
const menuFrame = document.querySelector("[data-menu-frame]");
const menuTitle = document.querySelector("[data-menu-viewer-title]");
const menuExternal = document.querySelector("[data-menu-external]");
const menuClose = document.querySelector("[data-menu-close]");

function openMenuViewer(link) {
  const url = link.href;
  const title = link.dataset.menuTitle || "МЕНЮ";
  if (!menuViewer || !menuFrame || !menuTitle || !menuExternal) return;

  menuTitle.textContent = title;
  menuFrame.title = title;
  menuFrame.src = `${url}#view=FitH&toolbar=0&navpanes=0`;
  menuExternal.href = url;
  menuViewer.hidden = false;
  document.body.classList.add("menu-viewer-open");
  menuClose?.focus();
}

function closeMenuViewer() {
  if (!menuViewer || !menuFrame) return;
  menuViewer.hidden = true;
  menuFrame.src = "about:blank";
  document.body.classList.remove("menu-viewer-open");
}

document.querySelectorAll("[data-menu-open]").forEach((link) => {
  link.addEventListener("click", (event) => {
    if (!menuViewer || !menuFrame) return;
    event.preventDefault();
    openMenuViewer(link);
  });
});

menuClose?.addEventListener("click", closeMenuViewer);
menuViewer?.addEventListener("click", (event) => {
  if (event.target === menuViewer) closeMenuViewer();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuViewer && !menuViewer.hidden) {
    closeMenuViewer();
  }
});
