"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";

const CLAUDE_KEY = process.env.NEXT_PUBLIC_CLAUDE_KEY;

interface Transaction {
  date: string;
  description: string;
  debit: number | null;
  credit: number | null;
  balance: number;
  category: string;
}

interface LoanAssessment {
  score: number;
  rating: "Excellent" | "Good" | "Fair" | "Poor" | "Very Poor";
  averageMonthlyCredit: number;
  averageMonthlyDebit: number;
  salaryInflows: number;
  loanRepayments: number;
  utilityPayments: number;
  irregularItems: string[];
  positiveSignals: string[];
  riskFlags: string[];
  recommendation: string;
  maxRecommendedEMI: number;
}

interface StatementData {
  accountHolder: string;
  accountNumber: string;
  bank: string;
  period: { from: string; to: string };
  currency: string;
  openingBalance: number;
  closingBalance: number;
  averageBalance: number;
  totalCredits: number;
  totalDebits: number;
  creditCount: number;
  debitCount: number;
  transactions: Transaction[];
  loanAssessment: LoanAssessment;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const SYSTEM_PROMPT = `You are a financial analyst AI specialized in bank statement analysis for loan assessment purposes. 
When given a bank statement PDF, extract and return ONLY a valid JSON object (no markdown, no explanation) with this exact structure:

{
  "accountHolder": "string",
  "accountNumber": "string",
  "bank": "string",
  "period": { "from": "string", "to": "string" },
  "currency": "string",
  "openingBalance": number,
  "closingBalance": number,
  "averageBalance": number,
  "totalCredits": number,
  "totalDebits": number,
  "creditCount": number,
  "debitCount": number,
  "transactions": [
    {
      "date": "string",
      "description": "string",
      "debit": number or null,
      "credit": number or null,
      "balance": number,
      "category": "string"
    }
  ],
  "loanAssessment": {
    "score": number (0-100),
    "rating": "Excellent|Good|Fair|Poor|Very Poor",
    "averageMonthlyCredit": number,
    "averageMonthlyDebit": number,
    "salaryInflows": number,
    "loanRepayments": number,
    "utilityPayments": number,
    "irregularItems": ["string"],
    "positiveSignals": ["string"],
    "riskFlags": ["string"],
    "recommendation": "string",
    "maxRecommendedEMI": number
  }
}

Categorize transactions as: Salary, Transfer In, Transfer Out, Utility, Loan Repayment, Cash Deposit, Bank Charge, Other.
For loan assessment: analyze cash flow stability, regular income, existing debt burden, spending patterns, and balance trends.`;

const ratingTextColor = (r: string) => {
  const map: Record<string, string> = {
    Excellent: "text-green-600",
    Good: "text-lime-600",
    Fair: "text-amber-500",
    Poor: "text-orange-500",
    "Very Poor": "text-red-500",
  };
  return map[r] ?? "text-muted-foreground";
};

const ratingHex = (r: string) => {
  const map: Record<string, string> = {
    Excellent: "#16a34a",
    Good: "#65a30d",
    Fair: "#f59e0b",
    Poor: "#f97316",
    "Very Poor": "#ef4444",
  };
  return map[r] ?? "#94a3b8";
};

const categoryBadge = (cat: string) => {
  const map: Record<string, string> = {
    Salary: "bg-green-100 text-green-700",
    "Transfer In": "bg-blue-100 text-blue-700",
    "Transfer Out": "bg-purple-100 text-purple-700",
    Utility: "bg-yellow-100 text-yellow-700",
    "Loan Repayment": "bg-red-100 text-red-600",
    "Cash Deposit": "bg-emerald-100 text-emerald-700",
    "Bank Charge": "bg-gray-100 text-gray-600",
    Other: "bg-slate-100 text-slate-600",
  };
  return map[cat] ?? "bg-muted text-muted-foreground";
};

export function BankStatement() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<StatementData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const analyzeFile = async (f: File) => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const base64 = await fileToBase64(f);
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": CLAUDE_KEY ?? "",
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          system: SYSTEM_PROMPT,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "document",
                  source: {
                    type: "base64",
                    media_type: "application/pdf",
                    data: base64,
                  },
                },
                {
                  type: "text",
                  text: "Analyze this bank statement and return the JSON as instructed.",
                },
              ],
            },
          ],
        }),
      });
      const result = await response.json();
      const text: string =
        result.content?.find((c: { type: string }) => c.type === "text")
          ?.text ?? "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed: StatementData = JSON.parse(clean);
      setData(parsed);
    } catch {
      setError("Failed to analyze the statement. Please try again.");
    }
    setLoading(false);
  };

  const handleFile = (f: File | null | undefined) => {
    if (!f || f.type !== "application/pdf") {
      setError("Please upload a valid PDF file.");
      return;
    }
    setFile(f);
    analyzeFile(f);
  };

  const fmt = (n: number) =>
    n?.toLocaleString("en-US", { minimumFractionDigits: 2 });

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Failed to copy JSON to clipboard");
    }
  };

  const scoreArc = (score: number) => {
    const pct = Math.min(Math.max(score, 0), 100) / 100;
    const total = Math.PI * 50;
    return { total, offset: total * (1 - pct) };
  };

  const signalMax = data?.loanAssessment?.averageMonthlyCredit || 1;

  return (
    <div className="space-y-5">
      {/* ── Upload Zone ── */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e: DragEvent<HTMLDivElement>) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e: DragEvent<HTMLDivElement>) => {
          e.preventDefault();
          setDragOver(false);
          handleFile(e.dataTransfer.files[0]);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-10 transition-colors
          ${dragOver ? "border-orange-400 bg-orange-50" : "border-border hover:border-orange-300 hover:bg-accent/40"}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            handleFile(e.target.files?.[0])
          }
        />

        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-500">
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
            />
          </svg>
        </div>

        {file ? (
          <div className="text-center">
            <p className="text-sm font-medium text-orange-600">{file.name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {(file.size / 1024).toFixed(1)} KB
            </p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              Drop your bank statement PDF here
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              or click to browse
            </p>
          </div>
        )}
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="rounded-lg border bg-card p-8 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
            <svg
              className="h-5 w-5 animate-spin text-orange-500"
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
          <p className="text-sm text-muted-foreground">Analyzing statement…</p>
        </div>
      )}

      {/* ── Results ── */}
      {data && (
        <div className="space-y-4">
          {/* Header with Copy Button */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">
              Statement Analysis
            </h3>
            <button
              onClick={copyToClipboard}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                copied
                  ? "bg-green-100 text-green-700"
                  : "bg-orange-100 text-orange-700 hover:bg-orange-200"
              }`}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              {copied ? "Copied!" : "Copy JSON"}
            </button>
          </div>

          {/* Account Info */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { label: "Account Holder", value: data.accountHolder },
              { label: "Account No.", value: data.accountNumber },
              {
                label: "Period",
                value: `${data.period?.from} – ${data.period?.to}`,
              },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border bg-card p-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {item.label}
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {item.value || "—"}
                </p>
              </div>
            ))}
          </div>

          {/* Balance Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              {
                label: "Opening Balance",
                value: data.openingBalance,
                cls: "text-foreground",
              },
              {
                label: "Closing Balance",
                value: data.closingBalance,
                cls: "text-orange-500",
              },
              {
                label: "Average Balance",
                value: data.averageBalance,
                cls: "text-green-600",
              },
              {
                label: "Total Credits",
                value: data.totalCredits,
                cls: "text-blue-600",
              },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border bg-card p-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {item.label}
                </p>
                <p
                  className={`mt-1 text-base font-bold tabular-nums ${item.cls}`}
                >
                  {data.currency} {fmt(item.value)}
                </p>
              </div>
            ))}
          </div>

          {/* Loan Assessment */}
          {data.loanAssessment && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Score Card */}
              <div className="rounded-lg border bg-card p-5 space-y-4">
                <h4 className="text-sm font-semibold text-foreground">
                  Loan Eligibility Report
                </h4>

                <div className="flex items-center gap-5">
                  <svg
                    width={100}
                    height={58}
                    viewBox="0 0 120 70"
                    className="shrink-0"
                  >
                    <path
                      d="M10,65 A50,50 0 0,1 1  10,65"
                      fill="none"
                      stroke="hsl(var(--muted))"
                      strokeWidth={10}
                      strokeLinecap="round"
                    />
                    <path
                      d="M10,65 A50,50 0 0,1 110,65"
                      fill="none"
                      stroke={ratingHex(data.loanAssessment.rating)}
                      strokeWidth={10}
                      strokeLinecap="round"
                      strokeDasharray={`${scoreArc(data.loanAssessment.score).total} ${scoreArc(data.loanAssessment.score).total}`}
                      strokeDashoffset={
                        scoreArc(data.loanAssessment.score).offset
                      }
                    />
                    <text
                      x="60"
                      y="60"
                      textAnchor="middle"
                      fill={ratingHex(data.loanAssessment.rating)}
                      fontSize="18"
                      fontWeight="700"
                    >
                      {data.loanAssessment.score}
                    </text>
                  </svg>
                  <div className="space-y-1">
                    <p
                      className={`text-xl font-bold ${ratingTextColor(data.loanAssessment.rating)}`}
                    >
                      {data.loanAssessment.rating}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Score out of 100
                    </p>
                    <div className="pt-1">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        Max Recommended EMI
                      </p>
                      <p className="text-sm font-bold text-green-600 tabular-nums">
                        {data.currency}{" "}
                        {(
                          data.loanAssessment.maxRecommendedEMI || 0
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recommendation */}
                <div className="rounded-md bg-muted px-3 py-2.5">
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {data.loanAssessment.recommendation}
                  </p>
                </div>

                {/* Signal Tags */}
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {(data.loanAssessment.positiveSignals || []).map((s, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-[11px] font-medium text-green-700"
                      >
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(data.loanAssessment.riskFlags || []).map((r, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-medium text-red-600"
                      >
                        ⚠ {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Signal Bars */}
              <div className="rounded-lg border bg-card p-5 space-y-4">
                <h4 className="text-sm font-semibold text-foreground">
                  Cash Flow Signals
                </h4>
                <div className="space-y-3.5">
                  {(
                    [
                      {
                        label: "Avg Monthly Credit",
                        value: data.loanAssessment.averageMonthlyCredit,
                        bar: "bg-green-500",
                      },
                      {
                        label: "Avg Monthly Debit",
                        value: data.loanAssessment.averageMonthlyDebit,
                        bar: "bg-orange-400",
                      },
                      {
                        label: "Salary Inflows",
                        value: data.loanAssessment.salaryInflows,
                        bar: "bg-blue-500",
                      },
                      {
                        label: "Loan Repayments",
                        value: data.loanAssessment.loanRepayments,
                        bar: "bg-amber-400",
                      },
                      {
                        label: "Utility Payments",
                        value: data.loanAssessment.utilityPayments,
                        bar: "bg-slate-400",
                      },
                    ] as { label: string; value: number; bar: string }[]
                  ).map((item) => (
                    <div key={item.label}>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {item.label}
                        </span>
                        <span className="text-xs font-semibold tabular-nums text-foreground">
                          {data.currency} {(item.value || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${item.bar}`}
                          style={{
                            width: `${Math.min(100, ((item.value || 0) / signalMax) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Debit / Credit counts */}
                <div className="mt-2 flex gap-4 border-t pt-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Total Debits
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-red-500 tabular-nums">
                      {data.currency} {fmt(data.totalDebits)}
                      <span className="ml-1.5 text-[10px] font-normal text-muted-foreground">
                        ({data.debitCount} txns)
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Total Credits
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-green-600 tabular-nums">
                      {data.currency} {fmt(data.totalCredits)}
                      <span className="ml-1.5 text-[10px] font-normal text-muted-foreground">
                        ({data.creditCount} txns)
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Transactions Table */}
          <div className="rounded-lg border bg-card overflow-hidden">
            <div className="flex items-center justify-between border-b px-5 py-3">
              <h4 className="text-sm font-semibold text-foreground">
                Transactions
              </h4>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {data.transactions?.length ?? 0} entries
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    {[
                      "Date",
                      "Description",
                      "Category",
                      "Debit",
                      "Credit",
                      "Balance",
                    ].map((h) => (
                      <th
                        key={h}
                        className={`px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground
                          ${h === "Date" || h === "Description" || h === "Category" ? "text-left" : "text-right"}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(data.transactions || []).map((tx, i) => (
                    <tr
                      key={i}
                      className="transition-colors hover:bg-accent/40"
                    >
                      <td className="whitespace-nowrap px-4 py-2.5 text-xs text-muted-foreground">
                        {tx.date}
                      </td>
                      <td className="max-w-[200px] px-4 py-2.5 text-xs text-foreground">
                        {tx.description}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${categoryBadge(tx.category)}`}
                        >
                          {tx.category}
                        </span>
                      </td>
                      <td
                        className={`px-4 py-2.5 text-right text-xs font-medium tabular-nums ${tx.debit ? "text-red-500" : "text-muted-foreground/30"}`}
                      >
                        {tx.debit ? fmt(tx.debit) : "—"}
                      </td>
                      <td
                        className={`px-4 py-2.5 text-right text-xs font-medium tabular-nums ${tx.credit ? "text-green-600" : "text-muted-foreground/30"}`}
                      >
                        {tx.credit ? fmt(tx.credit) : "—"}
                      </td>
                      <td
                        className={`px-4 py-2.5 text-right text-xs font-semibold tabular-nums ${tx.balance < 0 ? "text-red-500" : "text-foreground"}`}
                      >
                        {fmt(tx.balance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
