import { jsPDF } from 'jspdf';

/**
 * Quotation PDF built on A4.
 *
 * Note on currency: jsPDF's built-in Helvetica is WinAnsi-encoded and has no
 * glyph for "₹", which would render as a broken box. Amounts are printed as
 * "Rs." instead, which every PDF reader shows correctly.
 */

const PAGE = { w: 595.28, h: 841.89 };
const M = 48; // page margin
const RIGHT = PAGE.w - M;

const INK = [21, 34, 56];
const MUTED = [109, 124, 147];
const BRAND = [11, 132, 114];
const LINE = [222, 228, 236];
const SOFT = [242, 246, 250];

const rs = (n) => `Rs. ${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const today = () =>
  new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

/** Small uppercase section label. */
function eyebrow(doc, text, x, y, align = 'left') {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  doc.text(String(text).toUpperCase(), x, y, { align, charSpace: 0.8 });
}

function rule(doc, y, color = LINE, width = 0.8) {
  doc.setDrawColor(...color);
  doc.setLineWidth(width);
  doc.line(M, y, RIGHT, y);
}

export function quotationPdf(quote, settings, { save = true } = {}) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const agency = settings?.agency || {};
  let y = M + 6;

  // -- Letterhead ----------------------------------------------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(...INK);
  doc.text(agency.name || 'Smira Club', M, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  const address = doc.splitTextToSize(agency.address || '', 260);
  doc.text(address, M, y + 16);

  let metaY = y + 16 + address.length * 11 + 2;
  [
    agency.gstin && `GSTIN ${agency.gstin}`,
    agency.licence && `Licence ${agency.licence}`,
    [agency.phone, agency.email].filter(Boolean).join('  ·  '),
  ]
    .filter(Boolean)
    .forEach((line) => {
      doc.text(line, M, metaY);
      metaY += 11;
    });

  // Document title block, right aligned
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...BRAND);
  doc.text('QUOTATION', RIGHT, y + 2, { align: 'right' });

  doc.setFontSize(10.5);
  doc.setTextColor(...INK);
  doc.text(quote.id, RIGHT, y + 20, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  doc.text(`Issued  ${today()}`, RIGHT, y + 34, { align: 'right' });
  if (quote.validTill) doc.text(`Valid till  ${quote.validTill}`, RIGHT, y + 46, { align: 'right' });

  y = Math.max(metaY, y + 58) + 6;
  rule(doc, y, BRAND, 1.6);
  y += 26;

  // -- Parties -------------------------------------------------------------
  eyebrow(doc, 'Prepared for', M, y);
  eyebrow(doc, 'Consultant', RIGHT, y, 'right');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...INK);
  doc.text(quote.customer || '—', M, y + 16);
  doc.text(quote.owner || '—', RIGHT, y + 16, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(
    `${quote.pax || 1} ${Number(quote.pax) === 1 ? 'traveller' : 'travellers'}`,
    M,
    y + 30
  );
  doc.text(`Status  ${quote.status || 'Draft'}`, RIGHT, y + 30, { align: 'right' });

  y += 52;

  // -- Line items ----------------------------------------------------------
  const COL_QTY = RIGHT - 165;
  const COL_AMT = RIGHT;

  doc.setFillColor(...SOFT);
  doc.rect(M, y, RIGHT - M, 22, 'F');
  eyebrow(doc, 'Description', M + 10, y + 14);
  eyebrow(doc, 'Travellers', COL_QTY, y + 14, 'right');
  eyebrow(doc, 'Amount', COL_AMT - 10, y + 14, 'right');
  y += 22;

  const desc = doc.splitTextToSize(quote.pkg || 'Travel package', COL_QTY - M - 30);
  const rowH = Math.max(30, desc.length * 12 + 18);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...INK);
  doc.text(desc, M + 10, y + 18);

  doc.setFont('helvetica', 'normal');
  doc.text(String(quote.pax || 1), COL_QTY, y + 18, { align: 'right' });
  doc.text(rs(quote.subtotal ?? quote.amount), COL_AMT - 10, y + 18, { align: 'right' });

  y += rowH;
  rule(doc, y);
  y += 18;

  // -- Totals --------------------------------------------------------------
  const totals = [];
  if (quote.subtotal !== undefined && quote.tax !== undefined) {
    totals.push(['Subtotal', rs(quote.subtotal)], ['GST', rs(quote.tax)]);
  }

  doc.setFontSize(9.5);
  totals.forEach(([label, value]) => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...MUTED);
    doc.text(label, COL_AMT - 130, y, { align: 'right' });
    doc.setTextColor(...INK);
    doc.text(value, COL_AMT - 10, y, { align: 'right' });
    y += 15;
  });

  doc.setFillColor(...BRAND);
  doc.rect(COL_AMT - 230, y - 2, 230, 34, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL PAYABLE', COL_AMT - 220, y + 19, { charSpace: 0.8 });
  doc.setFontSize(14);
  doc.text(rs(quote.amount), COL_AMT - 12, y + 20, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  doc.text(
    `${rs(Math.round((quote.amount || 0) / (quote.pax || 1)))} per traveller`,
    M,
    y + 20
  );
  y += 56;

  // -- Inclusions ----------------------------------------------------------
  if (quote.inclusions?.length) {
    eyebrow(doc, "What's included", M, y);
    y += 16;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    quote.inclusions.forEach((item) => {
      const lines = doc.splitTextToSize(item, RIGHT - M - 22);
      if (y + lines.length * 12 > PAGE.h - 110) {
        doc.addPage();
        y = M;
      }
      doc.setTextColor(...BRAND);
      doc.text('•', M + 4, y);
      doc.setTextColor(...INK);
      doc.text(lines, M + 18, y);
      y += lines.length * 12 + 5;
    });
    y += 10;
  }

  // -- Terms + footer ------------------------------------------------------
  if (y > PAGE.h - 130) {
    doc.addPage();
    y = M;
  }

  eyebrow(doc, 'Terms', M, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  const terms = doc.splitTextToSize(
    `Prices are quoted for the travel dates discussed and are subject to availability at the time of confirmation. ` +
      `A booking is confirmed only once the advance payment is received. Rates may change if airline fares, hotel tariffs ` +
      `or taxes change before confirmation. This quotation is valid till ${quote.validTill || 'the date stated above'}.`,
    RIGHT - M
  );
  doc.text(terms, M, y + 14);

  const footY = PAGE.h - 42;
  rule(doc, footY - 14);
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text(`${agency.name || 'Smira Club'}  ·  ${agency.phone || ''}`, M, footY);
  doc.text('Thank you for travelling with us', RIGHT, footY, { align: 'right' });

  if (save) doc.save(`${quote.id}.pdf`);
  return doc;
}
