"use client";

import { useState, useEffect, useCallback } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CustAccInfoRaw {
  id: number;
  transaction_number: number;
  customerid: string;
  bank_name: string;
  account_no: string;
  iban: string;
  account_name: string;
  address: string;
  po_box: number;
  building: string;
  area: string;
  city: string;
  postal_code: number;
  created_date: string;
  created_by: string;
  created_at: string;
}

interface CustomerResult {
  customerId: string;
  custAccInfo: {
    id: number;
    transaction_number: number;
    customerid: string;
    bank_name: string;
    account_no: string;
    iban: string;
    account_name: string;
    address: string;
    po_box: number;
    building: string;
    area: string;
    city: string;
    postal_code: number;
    created_date: string;
    created_by: string;
    created_at: string;
  };
  balances: {
    opening_balance: number;
    closing_available_balance: number;
    ledger_balance: number;
    unclear_balance: number;
    average_balance: number;
    average_debit_balance: number;
    average_credit_balance: number;
  };
  summary: {
    total_no_of_debits: number;
    total_no_of_credits: number;
    total_debit_amount: number;
    total_credit_amount: number;
  };
  transactions: Transaction[];
}

interface Transaction {
  id: number;
  transaction_number: number;
  txn_serial_no: number;
  date: string;
  value_date: string;
  bank_reference_no: string;
  customer_reference_no: string;
  description: string;
  category: string;
  debit_amount: string;
  credit_amount: string;
  running_balance: string;
  created_at: string;
  customerid: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: string | number) =>
  Number(n).toLocaleString("en-US", { minimumFractionDigits: 2 });

const fmtDate = (d: string) => {
  try {
    return new Date(d).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return d;
  }
};

const downloadDebitsByMonth = (
  transactions: Transaction[],
  customerId: string,
  accountName: string,
  bankName: string,
) => {
  const getMonthKey = (dateStr: string) => {
    const d = new Date(new Date(dateStr).getTime() + 4 * 60 * 60 * 1000);
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  };

  const script = document.createElement("script");
  script.src =
    "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
  script.onload = () => {
    const XLSX = (window as any).XLSX;

    const credits = transactions.filter((tx) => Number(tx.credit_amount) !== 0);

    // Build sorted unique month keys
    const monthSet = new Set<string>();
    credits.forEach((tx) => monthSet.add(getMonthKey(tx.date)));
    const monthKeys = Array.from(monthSet).sort();

    const monthLabel = (mk: string) => {
      const d = new Date(mk + "-01");
      const mon = d.toLocaleDateString("en-GB", { month: "short" });
      const yr = String(d.getFullYear()).slice(2);
      return `${mon}'${yr}`;
    };
    const monthLabels = monthKeys.map(monthLabel);

    // Group debits by month, sorted by serial within each month
    const byMonth: Record<string, number[]> = {};
    monthKeys.forEach((mk) => {
      byMonth[mk] = [];
    });
    credits
      .slice()
      .sort((a, b) => a.txn_serial_no - b.txn_serial_no)
      .forEach((tx) => {
        byMonth[getMonthKey(tx.date)].push(Number(tx.credit_amount));
      });

    const monthTotals: Record<string, number> = {};
    monthKeys.forEach((mk) => {
      monthTotals[mk] = byMonth[mk].reduce((s, v) => s + v, 0);
    });

    // Max rows needed = longest month column
    const maxRows = Math.max(...monthKeys.map((mk) => byMonth[mk].length));

    const NC = monthKeys.length;
    const COL_OFFSET = 2;

    // Build AOA: rows 0-1 = title, row 2 = average, row 3 = total, row 4 = month headers, rows 5+ = data
    const aoa: any[][] = [
      [null, null, accountName, ...Array(NC - 1).fill(null)],
      [null, null, bankName, ...Array(NC - 1).fill(null)],
      ["Average", "AVERAGE", ...monthKeys.map((mk) => monthTotals[mk] / 30)],
      ["Total", "TOTAL", ...monthKeys.map((mk) => monthTotals[mk])],
      [null, null, ...monthLabels],
    ];

    // Data rows: each row i gets byMonth[mk][i] for each month column
    for (let i = 0; i < maxRows; i++) {
      aoa.push([null, null, ...monthKeys.map((mk) => byMonth[mk][i] ?? null)]);
    }

    const ws = XLSX.utils.aoa_to_sheet(aoa);

    ws["!cols"] = [
      { wch: 10 },
      { wch: 10 },
      ...monthKeys.map(() => ({ wch: 16 })),
    ];

    ws["!merges"] = [
      { s: { r: 0, c: COL_OFFSET }, e: { r: 0, c: COL_OFFSET + NC - 1 } },
      { s: { r: 1, c: COL_OFFSET }, e: { r: 1, c: COL_OFFSET + NC - 1 } },
    ];

    const setStyle = (ref: string, style: any) => {
      if (!ws[ref]) ws[ref] = { t: "z", v: null };
      ws[ref].s = style;
    };

    const BLUE = "4472C4";
    const GREEN = "70AD47";
    const AMBER = "FFC000";
    const WHITE = "FFFFFF";
    const BLACK = "000000";

    const titleStyle = {
      font: { bold: true, sz: 12, color: { rgb: WHITE } },
      fill: { patternType: "solid", fgColor: { rgb: BLUE } },
      alignment: { horizontal: "center", vertical: "center" },
    };
    const avgLabelStyle = {
      font: { bold: true, color: { rgb: BLACK } },
      fill: { patternType: "solid", fgColor: { rgb: GREEN } },
      alignment: { horizontal: "left" },
    };
    const avgNumStyle = {
      font: { bold: true, color: { rgb: BLACK } },
      fill: { patternType: "solid", fgColor: { rgb: GREEN } },
      alignment: { horizontal: "right" },
      numFmt: "#,##0.00",
    };
    const totalLabelStyle = {
      font: { bold: true, color: { rgb: BLACK } },
      fill: { patternType: "solid", fgColor: { rgb: AMBER } },
      alignment: { horizontal: "left" },
    };
    const totalNumStyle = {
      font: { bold: true, color: { rgb: BLACK } },
      fill: { patternType: "solid", fgColor: { rgb: AMBER } },
      alignment: { horizontal: "right" },
      numFmt: "#,##0.00",
    };
    const monthHeaderStyle = {
      font: { bold: true, color: { rgb: WHITE } },
      fill: { patternType: "solid", fgColor: { rgb: BLUE } },
      alignment: { horizontal: "center" },
    };
    const dataNumStyle = {
      numFmt: "#,##0.00",
      alignment: { horizontal: "right" },
    };

    for (let c = 0; c < NC + COL_OFFSET; c++) {
      setStyle(XLSX.utils.encode_cell({ r: 0, c }), titleStyle);
      setStyle(XLSX.utils.encode_cell({ r: 1, c }), titleStyle);
    }
    setStyle(XLSX.utils.encode_cell({ r: 2, c: 0 }), avgLabelStyle);
    setStyle(XLSX.utils.encode_cell({ r: 2, c: 1 }), avgLabelStyle);
    for (let c = COL_OFFSET; c < NC + COL_OFFSET; c++) {
      setStyle(XLSX.utils.encode_cell({ r: 2, c }), avgNumStyle);
    }
    setStyle(XLSX.utils.encode_cell({ r: 3, c: 0 }), totalLabelStyle);
    setStyle(XLSX.utils.encode_cell({ r: 3, c: 1 }), totalLabelStyle);
    for (let c = COL_OFFSET; c < NC + COL_OFFSET; c++) {
      setStyle(XLSX.utils.encode_cell({ r: 3, c }), totalNumStyle);
    }
    for (let c = 0; c < NC + COL_OFFSET; c++) {
      setStyle(XLSX.utils.encode_cell({ r: 4, c }), monthHeaderStyle);
    }
    for (let r = 5; r < aoa.length; r++) {
      for (let c = COL_OFFSET; c < NC + COL_OFFSET; c++) {
        const ref = XLSX.utils.encode_cell({ r, c });
        if (ws[ref] && ws[ref].v != null) {
          ws[ref].s = dataNumStyle;
        }
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Debit Transactions");
    XLSX.writeFile(wb, `debit-transactions-${customerId}.xlsx`);
  };
  document.head.appendChild(script);
};
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
      {children}
    </p>
  );
}

function KVGrid({
  items,
}: {
  items: { label: string; value: string | number; highlight?: boolean }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {items.map(({ label, value, highlight }) => (
        <div key={label}>
          <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {label}
          </p>
          <p
            className={`truncate text-xs font-medium ${highlight ? "text-blue-600" : "text-foreground"}`}
          >
            {value || "—"}
          </p>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
        <svg
          className="h-5 w-5 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
          />
        </svg>
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

// ─── Customer Detail View ─────────────────────────────────────────────────────

function CustomerDetail({
  customerId,
  onBack,
}: {
  customerId: string;
  onBack: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CustomerResult | null>(null);
  const [activeSection, setActiveSection] = useState<
    "account" | "balances" | "summary" | "transactions"
  >("account");
  const [txnPage, setTxnPage] = useState(1);
  const TXN_PAGE_SIZE = 20;

  useEffect(() => {
    setTxnPage(1);
  }, [activeSection]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${API_BASE_URL}/bank-statement/customer/${encodeURIComponent(customerId)}`,
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setData(json);
      } catch {
        setError("Failed to load customer statement details.");
      }
      setLoading(false);
    };
    load();
  }, [customerId]);

  const tabs = [
    { key: "account", label: "Account Info" },
    { key: "balances", label: "Balances" },
    { key: "summary", label: "Summary" },
    {
      key: "transactions",
      label: "Transactions",
      count: data?.transactions?.length,
    },
  ] as const;

  return (
    <div className="space-y-4">
      {/* Back + Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
          Back
        </button>
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Customer: {customerId}
          </h3>
          {data?.custAccInfo && (
            <p className="text-xs text-muted-foreground">
              {data.custAccInfo.account_name} · {data.custAccInfo.bank_name}
            </p>
          )}
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-1 rounded-lg border border-border bg-muted/30 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveSection(tab.key)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors
              ${
                activeSection === tab.key
                  ? "bg-background text-foreground shadow-sm border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
          >
            {tab.label}
            {"count" in tab && tab.count != null && tab.count > 0 && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold
                ${
                  activeSection === tab.key
                    ? "bg-blue-100 text-blue-700"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading && (
        <div className="rounded-lg border bg-card p-10 text-center">
          <div className="mx-auto mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
            <svg
              className="h-4 w-4 animate-spin text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
          </div>
          <p className="text-xs text-muted-foreground">Loading details…</p>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {!loading && !error && data && (
        <>
          {/* Account Info */}
          {activeSection === "account" && (
            <div className="rounded-lg border bg-card p-5">
              <div className="mb-4 flex items-center justify-between">
                <SectionLabel>
                  Account Info · ID #{data.custAccInfo.id}
                </SectionLabel>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                  {fmtDate(data.custAccInfo.created_at)}
                </span>
              </div>
              <KVGrid
                items={[
                  {
                    label: "Account Name",
                    value: data.custAccInfo.account_name,
                    highlight: true,
                  },
                  { label: "Bank", value: data.custAccInfo.bank_name },
                  { label: "Account No.", value: data.custAccInfo.account_no },
                  { label: "IBAN", value: data.custAccInfo.iban },
                  { label: "Customer ID", value: data.custAccInfo.customerid },
                  {
                    label: "Txn Number",
                    value: data.custAccInfo.transaction_number,
                  },
                  { label: "City", value: data.custAccInfo.city },
                  { label: "Area", value: data.custAccInfo.area },
                  { label: "Building", value: data.custAccInfo.building },
                  { label: "PO Box", value: data.custAccInfo.po_box },
                  { label: "Postal Code", value: data.custAccInfo.postal_code },
                  { label: "Created By", value: data.custAccInfo.created_by },
                  { label: "Address", value: data.custAccInfo.address },
                ]}
              />
            </div>
          )}

          {/* Balances */}
          {activeSection === "balances" && (
            <div className="rounded-lg border bg-card p-5">
              <SectionLabel>Balance Overview</SectionLabel>
              <KVGrid
                items={[
                  {
                    label: "Opening Balance",
                    value: fmt(data.balances.opening_balance),
                  },
                  {
                    label: "Closing Balance",
                    value: fmt(data.balances.closing_available_balance),
                    highlight: true,
                  },
                  {
                    label: "Ledger Balance",
                    value: fmt(data.balances.ledger_balance),
                  },
                  {
                    label: "Unclear Balance",
                    value: fmt(data.balances.unclear_balance),
                  },
                  {
                    label: "Average Balance",
                    value: fmt(data.balances.average_balance),
                  },
                  {
                    label: "Avg Debit Balance",
                    value: fmt(data.balances.average_debit_balance),
                  },
                  {
                    label: "Avg Credit Balance",
                    value: fmt(data.balances.average_credit_balance),
                  },
                ]}
              />
            </div>
          )}

          {/* Summary */}
          {activeSection === "summary" && (
            <div className="rounded-lg border bg-card p-5">
              <SectionLabel>Transaction Summary</SectionLabel>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  {
                    label: "No. of Debits",
                    value: data.summary.total_no_of_debits,
                    color: "bg-red-50 border-red-100",
                    text: "text-red-700",
                  },
                  {
                    label: "No. of Credits",
                    value: data.summary.total_no_of_credits,
                    color: "bg-green-50 border-green-100",
                    text: "text-green-700",
                  },
                  {
                    label: "Total Debits",
                    value: fmt(data.summary.total_debit_amount),
                    color: "bg-red-50 border-red-100",
                    text: "text-red-700",
                  },
                  {
                    label: "Total Credits",
                    value: fmt(data.summary.total_credit_amount),
                    color: "bg-green-50 border-green-100",
                    text: "text-green-700",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`rounded-lg border p-3 ${item.color}`}
                  >
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      {item.label}
                    </p>
                    <p
                      className={`tabular-nums text-sm font-bold ${item.text}`}
                    >
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transactions */}
          {activeSection === "transactions" &&
            (() => {
              const sorted = [...(data.transactions || [])].sort((a, b) => {
                const diff =
                  new Date(a.date).getTime() - new Date(b.date).getTime();
                return diff !== 0 ? diff : a.txn_serial_no - b.txn_serial_no;
              });

              const totalPages = Math.max(
                1,
                Math.ceil(sorted.length / TXN_PAGE_SIZE),
              );
              const safePage = Math.min(txnPage, totalPages);
              const pageSlice = sorted.slice(
                (safePage - 1) * TXN_PAGE_SIZE,
                safePage * TXN_PAGE_SIZE,
              );

              return (
                <div className="rounded-lg border bg-card overflow-hidden">
                  {sorted.length === 0 ? (
                    <div className="p-8">
                      <EmptyState label="No transaction records found." />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between border-b px-5 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                          Transaction Rows
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                            {sorted.length} rows
                          </span>
                          <button
                            onClick={() =>
                              downloadDebitsByMonth(
                                data.transactions,
                                customerId,
                                data.custAccInfo.account_name,
                                data.custAccInfo.bank_name,
                              )
                            }
                            className="flex items-center gap-1.5 rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-700 active:bg-green-800"
                          >
                            <svg
                              className="h-3.5 w-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                              />
                            </svg>
                            Export Debits
                          </button>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b bg-muted/50">
                              {[
                                "#",
                                "Date & Time",
                                "Description",
                                "Category",
                                "Bank Ref",
                                "Debit",
                                "Credit",
                                "Balance",
                              ].map((h) => (
                                <th
                                  key={h}
                                  className={`px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground
                                    ${["Debit", "Credit", "Balance"].includes(h) ? "text-right" : "text-left"}`}
                                >
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {pageSlice.map((tx) => {
                              const dtObj = new Date(tx.date);
                              const datePart = dtObj.toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              );
                              const timePart = dtObj.toLocaleTimeString(
                                "en-GB",
                                { hour: "2-digit", minute: "2-digit" },
                              );

                              return (
                                <tr
                                  key={tx.id}
                                  className="transition-colors hover:bg-accent/40"
                                >
                                  <td className="px-4 py-2.5 text-muted-foreground">
                                    {tx.txn_serial_no}
                                  </td>
                                  <td className="whitespace-nowrap px-4 py-2.5">
                                    <span className="block text-foreground">
                                      {datePart}
                                    </span>
                                    <span className="block text-[10px] text-muted-foreground">
                                      {timePart}
                                    </span>
                                  </td>
                                  <td className="max-w-[220px] truncate px-4 py-2.5 text-foreground">
                                    {tx.description}
                                  </td>
                                  <td className="max-w-[140px] truncate px-4 py-2.5 text-foreground">
                                    {tx.category || "—"}
                                  </td>
                                  <td className="px-4 py-2.5 font-mono text-muted-foreground">
                                    {tx.bank_reference_no || "—"}
                                  </td>
                                  <td
                                    className={`px-4 py-2.5 text-right tabular-nums ${
                                      Number(tx.debit_amount) > 0
                                        ? "font-medium text-red-600"
                                        : "text-muted-foreground"
                                    }`}
                                  >
                                    {Number(tx.debit_amount) > 0
                                      ? fmt(tx.debit_amount)
                                      : "—"}
                                  </td>
                                  <td
                                    className={`px-4 py-2.5 text-right tabular-nums ${
                                      Number(tx.credit_amount) > 0
                                        ? "font-medium text-green-600"
                                        : "text-muted-foreground"
                                    }`}
                                  >
                                    {Number(tx.credit_amount) > 0
                                      ? fmt(tx.credit_amount)
                                      : "—"}
                                  </td>
                                  <td className="px-4 py-2.5 text-right tabular-nums font-medium text-foreground">
                                    {fmt(tx.running_balance)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination footer */}
                      <div className="flex items-center justify-between border-t bg-muted/30 px-5 py-3">
                        <p className="text-xs text-muted-foreground">
                          Showing{" "}
                          <span className="font-medium text-foreground">
                            {(safePage - 1) * TXN_PAGE_SIZE + 1}–
                            {Math.min(safePage * TXN_PAGE_SIZE, sorted.length)}
                          </span>{" "}
                          of{" "}
                          <span className="font-medium text-foreground">
                            {sorted.length}
                          </span>{" "}
                          transactions
                        </p>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              setTxnPage((p) => Math.max(1, p - 1))
                            }
                            disabled={safePage === 1}
                            className="flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <svg
                              className="h-3 w-3"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.75 19.5L8.25 12l7.5-7.5"
                              />
                            </svg>
                            Prev
                          </button>

                          <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                              .filter(
                                (p) =>
                                  p === 1 ||
                                  p === totalPages ||
                                  Math.abs(p - safePage) <= 1,
                              )
                              .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                                if (idx > 0 && p - (arr[idx - 1] as number) > 1)
                                  acc.push("…");
                                acc.push(p);
                                return acc;
                              }, [])
                              .map((item, idx) =>
                                item === "…" ? (
                                  <span
                                    key={`ellipsis-${idx}`}
                                    className="px-1 text-xs text-muted-foreground"
                                  >
                                    …
                                  </span>
                                ) : (
                                  <button
                                    key={item}
                                    onClick={() => setTxnPage(item as number)}
                                    className={`min-w-[28px] rounded-md px-2 py-1.5 text-xs font-medium transition-colors
                                      ${
                                        safePage === item
                                          ? "bg-blue-600 text-white shadow-sm"
                                          : "border border-border text-muted-foreground hover:bg-accent hover:text-foreground"
                                      }`}
                                  >
                                    {item}
                                  </button>
                                ),
                              )}
                          </div>

                          <button
                            onClick={() =>
                              setTxnPage((p) => Math.min(totalPages, p + 1))
                            }
                            disabled={safePage === totalPages}
                            className="flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Next
                            <svg
                              className="h-3 w-3"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M8.25 4.5l7.5 7.5-7.5 7.5"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })()}
        </>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

function CustomerStatementRecords() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customerIds, setCustomerIds] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);

  const loadCustomerIds = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/bs-cust-acc-info`);
      const json = await res.json();
      const data: CustAccInfoRaw[] = json.data || [];

      // Deduplicate by customerid
      const seen = new Set<string>();
      const ids: string[] = [];
      for (const row of data) {
        if (!seen.has(row.customerid)) {
          seen.add(row.customerid);
          ids.push(row.customerid);
        }
      }
      setCustomerIds(ids);
      setFetched(true);
    } catch {
      setError("Failed to load customer IDs. Check your API connection.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadCustomerIds();
  }, [loadCustomerIds]);

  // ── Detail view ──
  if (selectedId !== null) {
    return (
      <CustomerDetail
        customerId={selectedId}
        onBack={() => setSelectedId(null)}
      />
    );
  }

  // ── List view ──
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Customer Statement Records
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Select a customer ID to view full statement details
          </p>
        </div>
        <button
          onClick={loadCustomerIds}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
        >
          <svg
            className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
            />
          </svg>
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="rounded-lg border bg-card p-10 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
            <svg
              className="h-5 w-5 animate-spin text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
          </div>
          <p className="text-sm text-muted-foreground">Loading customer IDs…</p>
        </div>
      )}

      {/* Empty */}
      {fetched && !loading && customerIds.length === 0 && (
        <div className="rounded-lg border bg-card">
          <EmptyState label="No customer IDs found." />
        </div>
      )}

      {/* Customer ID list */}
      {!loading && customerIds.length > 0 && (
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="border-b bg-muted/50 px-5 py-3">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {customerIds.length} distinct customer ID
              {customerIds.length !== 1 ? "s" : ""} found
            </span>
          </div>
          <div className="divide-y divide-border">
            {customerIds.map((id) => (
              <button
                key={id}
                onClick={() => setSelectedId(id)}
                className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-accent/40 group"
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                      />
                    </svg>
                  </div>

                  {/* Info */}
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {id}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Click to view full statement
                    </p>
                  </div>
                </div>

                <svg
                  className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                  />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerStatementRecords;
