const tableDialog = document.querySelector('#table-dialog');
const qrDialog = document.querySelector('#qr-dialog');
const qrImage = document.querySelector('#qr-image');
const tableNumber = document.querySelector('#table-number');

document.querySelectorAll('[data-open-tables]').forEach((button) => {
  button.addEventListener('click', () => tableDialog.showModal());
});

document.querySelectorAll('[data-table]').forEach((button) => {
  button.addEventListener('click', () => {
    const table = button.dataset.table.padStart(2, '0');
    tableNumber.textContent = table;
    qrImage.src = `table-${table}.svg`;
    qrImage.alt = `QR-код для оплаты за столом ${table}`;
    tableDialog.close();
    qrDialog.showModal();
  });
});

document.querySelectorAll('[data-close]').forEach((button) => {
  button.addEventListener('click', () => button.closest('dialog').close());
});

document.querySelector('#back-to-tables').addEventListener('click', () => {
  qrDialog.close();
  tableDialog.showModal();
});

document.querySelectorAll('dialog').forEach((dialog) => {
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
});
