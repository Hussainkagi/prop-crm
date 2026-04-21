"use client";

import { useState, useEffect, useCallback } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";

// ─── Types ───────────────────────────────────────────────────────────────────

interface CustAccInfo {
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

interface Balance {
  id: number;
  transaction_number: number;
  start_date: string;
  end_date: string;
  opening_balance: string;
  closing_available_balance: string;
  ledger_balance: string;
  unclear_balance: string;
  average_balance: string;
  average_debit_balance: string;
  average_credit_balance: string;
  created_at: string;
}

interface Summary {
  id: number;
  transaction_number: number;
  total_no_of_debits: number;
  total_no_of_credits: number;
  total_debit_amount: string;
  total_credit_amount: string;
  debit_credit_filter: string;
  amount_range: string;
  min: string;
  max: string;
  created_at: string;
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
}

interface GroupedRecord {
  transaction_number: number;
  account_name: string;
  bank_name: string;
  account_no: string;
  created_at: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

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
  txnNumber: number,
) => {
  // Dynamically load SheetJS
  const script = document.createElement("script");
  script.src =
    "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
  script.onload = () => {
    const XLSX = (window as any).XLSX;

    // Group debit transactions by month
    const monthMap: Record<
      string,
      { transactions: Transaction[]; total: number }
    > = {};

    transactions
      .filter((tx) => Number(tx.debit_amount) > 0)
      .forEach((tx) => {
        const d = new Date(tx.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const label = d.toLocaleDateString("en-GB", {
          month: "long",
          year: "numeric",
        });
        if (!monthMap[key]) monthMap[key] = { transactions: [], total: 0 };
        monthMap[key].transactions.push(tx);
        monthMap[key].total += Number(tx.debit_amount);
      });

    const wb = XLSX.utils.book_new();

    // One sheet per month
    Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([key, { transactions: txns, total }]) => {
        const d = new Date(key + "-01");
        const sheetName = d.toLocaleDateString("en-GB", {
          month: "short",
          year: "numeric",
        });

        const rows = [
          [
            "#",
            "Date",
            "Bank Ref",
            "Customer Ref",
            "Description",
            "Debit Amount",
            "Running Balance",
          ],
          ...txns.map((tx) => [
            tx.txn_serial_no,
            fmtDate(tx.date),
            tx.bank_reference_no || "",
            tx.customer_reference_no || "",
            tx.description,
            Number(tx.debit_amount),
            Number(tx.running_balance),
          ]),
          [],
          ["", "", "", "", "Monthly Total Debits:", total, ""],
        ];

        const ws = XLSX.utils.aoa_to_sheet(rows);
        ws["!cols"] = [
          { wch: 5 },
          { wch: 14 },
          { wch: 14 },
          { wch: 16 },
          { wch: 40 },
          { wch: 16 },
          { wch: 16 },
        ];
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      });

    // Summary sheet
    const summaryRows = [
      ["Month", "No. of Debit Transactions", "Total Debit Amount"],
      ...Object.entries(monthMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, { transactions: txns, total }]) => {
          const d = new Date(key + "-01");
          return [
            d.toLocaleDateString("en-GB", { month: "long", year: "numeric" }),
            txns.length,
            total,
          ];
        }),
    ];
    const summaryWs = XLSX.utils.aoa_to_sheet(summaryRows);
    summaryWs["!cols"] = [{ wch: 20 }, { wch: 26 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

    XLSX.writeFile(wb, `debit-transactions-txn${txnNumber}.xlsx`);
  };
  document.head.appendChild(script);
};

// ─── Sub-components ───────────────────────────────────────────────────────────

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

// ─── Detail View ─────────────────────────────────────────────────────────────

function RecordDetail({
  txnNumber,
  onBack,
}: {
  txnNumber: number;
  onBack: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accInfo, setAccInfo] = useState<CustAccInfo[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeSection, setActiveSection] = useState<
    "account" | "balances" | "summary" | "transactions"
  >("account");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [accRes, balRes, sumRes, txnRes] = await Promise.all([
          fetch(`${API_BASE_URL}/bs-cust-acc-info`),
          fetch(`${API_BASE_URL}/bs-balances`),
          fetch(`${API_BASE_URL}/bs-summary`),
          fetch(`${API_BASE_URL}/bs-transactions`),
        ]);
        const [accData, balData, sumData, txnData] = await Promise.all([
          accRes.json(),
          balRes.json(),
          sumRes.json(),
          txnRes.json(),
        ]);
        setAccInfo(
          (accData.data || []).filter(
            (r: CustAccInfo) => r.transaction_number === txnNumber,
          ),
        );
        setBalances(
          (balData.data || []).filter(
            (r: Balance) => r.transaction_number === txnNumber,
          ),
        );
        setSummaries(
          (sumData.data || []).filter(
            (r: Summary) => r.transaction_number === txnNumber,
          ),
        );
        setTransactions(
          (txnData.data || []).filter(
            (r: Transaction) => r.transaction_number === txnNumber,
          ),
        );
      } catch {
        setError("Failed to load record details.");
      }
      setLoading(false);
    };
    load();
  }, [txnNumber]);

  const tabs = [
    { key: "account", label: "Account Info", count: accInfo.length },
    { key: "balances", label: "Balances", count: balances.length },
    { key: "summary", label: "Summary", count: summaries.length },
    {
      key: "transactions",
      label: "Transactions",
      count: transactions.length,
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
            Transaction #{txnNumber}
          </h3>
          {accInfo[0] && (
            <p className="text-xs text-muted-foreground">
              {accInfo[0].account_name} · {accInfo[0].bank_name}
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
            {tab.count > 0 && (
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

      {!loading && !error && (
        <>
          {/* Account Info */}
          {activeSection === "account" && (
            <div className="space-y-3">
              {accInfo.length === 0 ? (
                <EmptyState label="No account info records found." />
              ) : (
                accInfo.map((acc, i) => (
                  <div key={acc.id} className="rounded-lg border bg-card p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <SectionLabel>
                        Record {i + 1} · ID #{acc.id}
                      </SectionLabel>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                        {fmtDate(acc.created_at)}
                      </span>
                    </div>
                    <KVGrid
                      items={[
                        {
                          label: "Account Name",
                          value: acc.account_name,
                          highlight: true,
                        },
                        { label: "Bank", value: acc.bank_name },
                        { label: "Account No.", value: acc.account_no },
                        { label: "IBAN", value: acc.iban },
                        { label: "Customer ID", value: acc.customerid },
                        { label: "City", value: acc.city },
                        { label: "Area", value: acc.area },
                        { label: "Building", value: acc.building },
                        { label: "PO Box", value: acc.po_box },
                        { label: "Postal Code", value: acc.postal_code },
                        { label: "Created By", value: acc.created_by },
                        { label: "Address", value: acc.address },
                      ]}
                    />
                  </div>
                ))
              )}
            </div>
          )}

          {/* Balances */}
          {activeSection === "balances" && (
            <div className="space-y-3">
              {balances.length === 0 ? (
                <EmptyState label="No balance records found." />
              ) : (
                balances.map((bal, i) => (
                  <div key={bal.id} className="rounded-lg border bg-card p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <SectionLabel>
                        Record {i + 1} · ID #{bal.id}
                      </SectionLabel>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                        {fmtDate(bal.created_at)}
                      </span>
                    </div>
                    <KVGrid
                      items={[
                        {
                          label: "Period From",
                          value: fmtDate(bal.start_date),
                        },
                        { label: "Period To", value: fmtDate(bal.end_date) },
                        {
                          label: "Opening Balance",
                          value: fmt(bal.opening_balance),
                        },
                        {
                          label: "Closing Balance",
                          value: fmt(bal.closing_available_balance),
                          highlight: true,
                        },
                        {
                          label: "Ledger Balance",
                          value: fmt(bal.ledger_balance),
                        },
                        {
                          label: "Unclear Balance",
                          value: fmt(bal.unclear_balance),
                        },
                        {
                          label: "Average Balance",
                          value: fmt(bal.average_balance),
                        },
                        {
                          label: "Avg Debit Balance",
                          value: fmt(bal.average_debit_balance),
                        },
                        {
                          label: "Avg Credit Balance",
                          value: fmt(bal.average_credit_balance),
                        },
                      ]}
                    />
                  </div>
                ))
              )}
            </div>
          )}

          {/* Summary */}
          {activeSection === "summary" && (
            <div className="space-y-3">
              {summaries.length === 0 ? (
                <EmptyState label="No summary records found." />
              ) : (
                summaries.map((sum, i) => (
                  <div key={sum.id} className="rounded-lg border bg-card p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <SectionLabel>
                        Record {i + 1} · ID #{sum.id}
                      </SectionLabel>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                        {fmtDate(sum.created_at)}
                      </span>
                    </div>
                    <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {[
                        {
                          label: "No. of Debits",
                          value: sum.total_no_of_debits,
                          color: "bg-red-50 border-red-100",
                          text: "text-red-700",
                        },
                        {
                          label: "No. of Credits",
                          value: sum.total_no_of_credits,
                          color: "bg-green-50 border-green-100",
                          text: "text-green-700",
                        },
                        {
                          label: "Total Debits",
                          value: fmt(sum.total_debit_amount),
                          color: "bg-red-50 border-red-100",
                          text: "text-red-700",
                        },
                        {
                          label: "Total Credits",
                          value: fmt(sum.total_credit_amount),
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
                ))
              )}
            </div>
          )}

          {/* Transactions */}
          {activeSection === "transactions" && (
            <div className="rounded-lg border bg-card overflow-hidden">
              {transactions.length === 0 ? (
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
                        {transactions.length} rows
                      </span>
                      <button
                        onClick={() =>
                          downloadDebitsByMonth(transactions, txnNumber)
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
                            "Date",
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
                        {transactions.map((tx) => (
                          <tr
                            key={tx.id}
                            className="transition-colors hover:bg-accent/40"
                          >
                            <td className="px-4 py-2.5 text-muted-foreground">
                              {tx.txn_serial_no}
                            </td>
                            <td className="whitespace-nowrap px-4 py-2.5 text-muted-foreground">
                              {fmtDate(tx.date)}
                            </td>
                            <td className="max-w-[220px] truncate px-4 py-2.5 text-foreground">
                              {tx.description}
                            </td>
                            <td className="max-w-[220px] truncate px-4 py-2.5 text-foreground">
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
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}
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

// ─── Main List Component ──────────────────────────────────────────────────────

export function BankStatementRecords() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [records, setRecords] = useState<GroupedRecord[]>([]);
  const [selectedTxn, setSelectedTxn] = useState<number | null>(null);
  const [fetched, setFetched] = useState(false);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/bs-cust-acc-info`);
      const json = await res.json();
      const data: CustAccInfo[] = json.data || [];

      // Deduplicate by transaction_number — keep first occurrence
      const seen = new Set<number>();
      const grouped: GroupedRecord[] = [];
      for (const row of data) {
        if (!seen.has(row.transaction_number)) {
          seen.add(row.transaction_number);
          grouped.push({
            transaction_number: row.transaction_number,
            account_name: row.account_name,
            bank_name: row.bank_name,
            account_no: row.account_no,
            created_at: row.created_at,
          });
        }
      }
      setRecords(grouped);
      setFetched(true);
    } catch {
      setError("Failed to load records. Check your API connection.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  // ── Detail view ──
  if (selectedTxn !== null) {
    return (
      <RecordDetail
        txnNumber={selectedTxn}
        onBack={() => setSelectedTxn(null)}
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
            Bank Statement Records
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Select a transaction to view full details across all modules
          </p>
        </div>
        <button
          onClick={loadRecords}
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
          <p className="text-sm text-muted-foreground">Loading records…</p>
        </div>
      )}

      {/* Empty state */}
      {fetched && !loading && records.length === 0 && (
        <div className="rounded-lg border bg-card">
          <EmptyState label="No bank statement records found." />
        </div>
      )}

      {/* Records list */}
      {!loading && records.length > 0 && (
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="border-b bg-muted/50 px-5 py-3">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {records.length} record{records.length !== 1 ? "s" : ""} found
            </span>
          </div>
          <div className="divide-y divide-border">
            {records.map((rec) => (
              <button
                key={rec.transaction_number}
                onClick={() => setSelectedTxn(rec.transaction_number)}
                className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-accent/40 group"
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
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
                        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                      />
                    </svg>
                  </div>

                  {/* Info */}
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {rec.account_name}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                        #{rec.transaction_number}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {rec.bank_name}
                      </span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {rec.account_no}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-muted-foreground">
                    {fmtDate(rec.created_at)}
                  </span>
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
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
