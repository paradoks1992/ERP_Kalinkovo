// apps/manager/src/lib/export.js
import { utils, writeFile } from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Экспорт заказов в Excel
 */
export function exportOrdersToExcel(orders) {
  const rows = orders.map(o => ({
    Название: o.title,
    Операция: o.operation === 'inbound' ? 'Ввоз' : 'Вывоз',
    Вид: o.apple_kind,
    Категория: o.category || '',
    Сорт: o.apple_type,
    Количество: o.qty_total,
    Статус: statusLabel(o.status),
    Откуда: o.from_site || '',
    Куда: o.to_site || '',
    Клиент: o.customer || '',
    Когда: o.when || '',
  }));
  const ws = utils.json_to_sheet(rows);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, 'Задачи');
  writeFile(wb, `Задачи_${new Date().toISOString().slice(0,10)}.xlsx`);
}

/**
 * Экспорт заказов в PDF
 */
export function exportOrdersToPDF(orders) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text('Отчёт по задачам', 14, 18);
  const tableData = orders.map(o => [
    o.title,
    o.operation === 'inbound' ? 'Ввоз' : 'Вывоз',
    o.apple_type,
    o.qty_total,
    statusLabel(o.status),
  ]);
  autoTable(doc, {
    head: [['Название','Операция','Сорт','Кол-во','Статус']],
    body: tableData,
    startY: 26,
  });
  doc.save(`Задачи_${new Date().toISOString().slice(0,10)}.pdf`);
}

function statusLabel(st){
  if (st==='pending') return 'в ожидании';
  if (st==='in_progress') return 'в работе';
  return 'выполнена';
}
