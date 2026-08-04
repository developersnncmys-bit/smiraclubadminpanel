/** Turns the rows currently on screen into a CSV file the browser downloads. */
export function downloadCsv(filename, rows, columns) {
  const cols = columns.filter((c) => c.key !== 'actions' && c.header);
  const escape = (v) => {
    const s = v === undefined || v === null ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const head = cols.map((c) => escape(c.header)).join(',');
  const body = rows
    .map((r) => cols.map((c) => escape(c.csv ? c.csv(r) : r[c.key])).join(','))
    .join('\n');

  const blob = new Blob([`${head}\n${body}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Downloads any text blob (used for the plain-text quotation/invoice copies). */
export function downloadText(filename, text) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
