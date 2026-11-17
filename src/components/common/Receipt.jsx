import { useRef } from 'react';
import { Printer } from 'lucide-react';
import { useStore } from '../../services/store';
import { formatLKR, formatDateTime } from '../../utils/format';

export function printHtml(title, html) {
  const w = window.open('', '_blank', 'width=420,height=700');
  if (!w) { alert('Please allow pop-ups to print.'); return; }
  w.document.write(`<!doctype html><html><head><title>${title}</title><style>
    body{font-family:Arial,sans-serif;color:#111;margin:0;padding:16px;font-size:12px}
    table{width:100%;border-collapse:collapse} td,th{padding:3px 0;vertical-align:top}
    .r{text-align:right}.c{text-align:center}.b{font-weight:bold}.hr{border-top:1px dashed #555;margin:8px 0}
    @media print{body{padding:0}}
  </style></head><body>${html}<script>window.onload=function(){window.print()}<\/script></body></html>`);
  w.document.close();
}

export default function Receipt({ sale, showPrint = true }) {
  const ref = useRef(null);
  const settings = useStore('settings');
  const branches = useStore('branches');
  const { business, receipt, tax } = settings;
  const branch = branches.find((b) => b.id === sale.branchId);
  return (
    <div>
      <div ref={ref} className="mx-auto max-w-[320px] rounded-lg border border-dashed border-slate-300 bg-white p-4 text-xs text-slate-800">
        <div className="c" style={{ textAlign: 'center' }}>
          {receipt.showLogo && business.logo && <img src={business.logo} alt="" style={{ height: 40, margin: '0 auto 4px' }} />}
          <div className="b" style={{ fontWeight: 700, fontSize: 14 }}>{business.name}</div>
          <div>{branch?.name}</div><div>{branch?.address || business.address}</div><div>Tel: {branch?.phone || business.phone}</div>
          {business.regNo && <div>Reg: {business.regNo}</div>}
        </div>
        <div className="hr" style={{ borderTop: '1px dashed #555', margin: '8px 0' }} />
        <div>Invoice: <b>{sale.invoice}</b></div>
        <div>Date: {formatDateTime(sale.date)}</div>
        <div>Customer: {sale.customerName}</div><div>Cashier: {sale.cashierName}</div>
        <div className="hr" style={{ borderTop: '1px dashed #555', margin: '8px 0' }} />
        <table style={{ width: '100%' }}>
          <thead><tr><th align="left">Item</th><th align="right">Qty</th><th align="right">Amount</th></tr></thead>
          <tbody>
            {sale.items.map((i) => (
              <tr key={i.productId}><td>{i.name}<br /><span style={{ color: '#666' }}>@ {formatLKR(i.price)}</span></td><td align="right">{i.qty}{i.returned ? ` (-${i.returned})` : ''}</td><td align="right">{formatLKR(i.qty * i.price)}</td></tr>
            ))}
          </tbody>
        </table>
        <div className="hr" style={{ borderTop: '1px dashed #555', margin: '8px 0' }} />
        <table style={{ width: '100%' }}><tbody>
          <tr><td>Subtotal</td><td align="right">{formatLKR(sale.subtotal)}</td></tr>
          {sale.discount > 0 && <tr><td>Discount</td><td align="right">-{formatLKR(sale.discount)}</td></tr>}
          {receipt.showTax && sale.tax > 0 && <tr><td>{tax.name} ({sale.taxRate}%)</td><td align="right">{formatLKR(sale.tax)}</td></tr>}
          <tr><td><b>TOTAL</b></td><td align="right"><b>{formatLKR(sale.total)}</b></td></tr>
          <tr><td>Paid ({sale.paymentMethod})</td><td align="right">{formatLKR(sale.paid)}</td></tr>
          {sale.paymentMethod === 'Cash' && <tr><td>Change</td><td align="right">{formatLKR(sale.change)}</td></tr>}
          {sale.refunded > 0 && <tr><td>Refunded</td><td align="right">-{formatLKR(sale.refunded)}</td></tr>}
        </tbody></table>
        <div className="hr" style={{ borderTop: '1px dashed #555', margin: '8px 0' }} />
        <div style={{ textAlign: 'center' }}>{receipt.header}<br /><span style={{ color: '#666' }}>{receipt.footer}</span></div>
      </div>
      {showPrint && <div className="mt-3 text-center"><button className="btn-navy" onClick={() => printHtml(sale.invoice, ref.current.innerHTML)}><Printer size={16} /> Print receipt</button></div>}
    </div>
  );
}
