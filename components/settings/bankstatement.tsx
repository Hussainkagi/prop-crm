"use client";

import { useState, useRef, useEffect, DragEvent, ChangeEvent } from "react";

const CLAUDE_KEY = process.env.NEXT_PUBLIC_CLAUDE_KEY;
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Transaction {
  date: string;
  description: string;
  debit: number | null;
  credit: number | null;
  balance: number;
  category: string;
  bank_reference_no?: string;
  customer_reference_no?: string;
  value_date?: string;
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
  iban: string;
  address: string;
  poBox: string;
  building: string;
  area: string;
  city: string;
  postalCode: string;
  period: { from: string; to: string };
  currency: string;
  openingBalance: number;
  closingBalance: number;
  averageBalance: number;
  ledgerBalance: number;
  unclearBalance: number;
  averageDebitBalance: number;
  averageCreditBalance: number;
  totalCredits: number;
  totalDebits: number;
  creditCount: number;
  debitCount: number;
  transactions: Transaction[];
  loanAssessment: LoanAssessment;
}

interface ExistingRecord {
  id: number;
  transaction_number: number;
  customerid: string;
  bank_name: string;
  account_no: string;
  account_name: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const fmt = (n: number) =>
  (n ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 });

const ratingHex = (r: string) =>
  ({
    Excellent: "#16a34a",
    Good: "#65a30d",
    Fair: "#f59e0b",
    Poor: "#f97316",
    "Very Poor": "#ef4444",
  })[r] ?? "#94a3b8";

const ratingTextColor = (r: string) =>
  ({
    Excellent: "text-green-600",
    Good: "text-lime-600",
    Fair: "text-amber-500",
    Poor: "text-orange-500",
    "Very Poor": "text-red-500",
  })[r] ?? "text-muted-foreground";

const categoryBadge = (cat: string) =>
  ({
    Salary: "bg-green-100 text-green-700",
    "Transfer In": "bg-blue-100 text-blue-700",
    "Transfer Out": "bg-purple-100 text-purple-700",
    Utility: "bg-yellow-100 text-yellow-700",
    "Loan Repayment": "bg-red-100 text-red-700",
    "Cash Deposit": "bg-teal-100 text-teal-700",
    "Bank Charge": "bg-gray-100 text-gray-700",
    Other: "bg-gray-100 text-gray-500",
  })[cat] ?? "bg-gray-100 text-gray-500";

// ─── System Prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a financial analyst AI specialized in bank statement analysis for loan assessment purposes.
When given a bank statement PDF, extract and return ONLY a valid JSON object (no markdown, no explanation, no code fences) with this exact structure:

{
  "accountHolder": "string",
  "accountNumber": "string",
  "bank": "string",
  "iban": "string",
  "address": "string",
  "poBox": "string",
  "building": "string",
  "area": "string",
  "city": "string",
  "postalCode": "string",
  "period": { "from": "YYYY-MM-DD", "to": "YYYY-MM-DD" },
  "currency": "string",
  "openingBalance": number,
  "closingBalance": number,
  "averageBalance": number,
  "ledgerBalance": number,
  "unclearBalance": number,
  "averageDebitBalance": number,
  "averageCreditBalance": number,
  "totalCredits": number,
  "totalDebits": number,
  "creditCount": number,
  "debitCount": number,
  "transactions": [
    {
      "date": "YYYY-MM-DD",
      "value_date": "YYYY-MM-DD",
      "bank_reference_no": "string or empty",
      "customer_reference_no": "string or empty",
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

CRITICAL TRANSACTION EXTRACTION RULES:
- You MUST extract EVERY SINGLE transaction row from ALL pages of the PDF.
- The transactions array length MUST equal debitCount + creditCount exactly.
- Process every page completely before returning the JSON.
- Each row in the statement table = one object in the transactions array.

Categorize transactions as: Salary, Transfer In, Transfer Out, Utility, Loan Repayment, Cash Deposit, Bank Charge, Other.
For dates use YYYY-MM-DD format. Extract bank_reference_no and customer_reference_no from the statement columns.
For loan assessment: analyze cash flow stability, regular income, existing debt burden, spending patterns, and balance trends.`;

// ─── Component ───────────────────────────────────────────────────────────────

export function BankStatement() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<string>("");
  const [data, setData] = useState<StatementData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "preview" | "transactions" | "assessment"
  >("preview");

  // ── Existing transaction records ──
  const [existingRecords, setExistingRecords] = useState<ExistingRecord[]>([]);
  const [existingLoading, setExistingLoading] = useState(false);
  const [selectedTransactionNo, setSelectedTransactionNo] = useState<
    number | null
  >(null);

  // ── Submit state ──
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitDone, setSubmitDone] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [returnedTransactionNo, setReturnedTransactionNo] = useState<
    number | null
  >(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // ── Fetch all existing transaction numbers on mount ──
  useEffect(() => {
    const fetchExisting = async () => {
      setExistingLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/bs-cust-acc-info`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setExistingRecords(json.data);
        }
      } catch {
        // silently fail — dropdown will just be empty
      }
      setExistingLoading(false);
    };
    fetchExisting();
  }, []);

  // ── Analyze PDF ──
  const analyzeFile = async (f: File) => {
    setLoading(true);
    setLoadingStage("Reading PDF…");
    setError(null);
    setData(null);
    setSubmitDone(false);
    setReturnedTransactionNo(null);
    setSubmitError(null);

    try {
      setLoadingStage("Converting file…");
      const base64 = await fileToBase64(f);

      setLoadingStage("Extracting all transactions…");
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
          max_tokens: 64000,
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
                  text: "Analyze this bank statement and return the JSON as instructed. IMPORTANT: This PDF has multiple pages. You MUST read every page and extract EVERY transaction row. The transactions array must be complete — its length must equal debitCount + creditCount. Do not stop early or skip any rows.",
                },
              ],
            },
          ],
        }),
      });

      const result = await response.json();
      if (result.error)
        throw new Error(result.error.message || "Claude API error");

      setLoadingStage("Parsing data…");
      const text: string =
        result.content?.find((c: { type: string }) => c.type === "text")
          ?.text ?? "";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in Claude response");
      const parsed: StatementData = JSON.parse(jsonMatch[0]);

      const expected = (parsed.debitCount ?? 0) + (parsed.creditCount ?? 0);
      const actual = parsed.transactions?.length ?? 0;
      if (expected > 0 && actual !== expected) {
        console.warn(
          `Transaction count mismatch: expected ${expected}, got ${actual}`,
        );
      }

      setData(parsed);
    } catch (err) {
      setError(
        err instanceof Error
          ? `Failed to analyze: ${err.message}`
          : "Failed to analyze the statement. Please try again.",
      );
    }
    setLoading(false);
    setLoadingStage("");
  };

  const handleFile = (f: File | null | undefined) => {
    if (!f || f.type !== "application/pdf") {
      setError("Please upload a valid PDF file.");
      return;
    }
    setFile(f);
    analyzeFile(f);
  };

  // ── Single unified submit to /upload-bank-statement ──
  const handleSubmit = async () => {
    if (!data) return;
    setSubmitError(null);
    setSubmitDone(false);
    setSubmitLoading(true);
    setReturnedTransactionNo(null);

    try {
      const today = new Date().toISOString().slice(0, 10);

      const payload: Record<string, unknown> = {
        // Only include transaction_no if user selected one; omit to let backend auto-generate
        ...(selectedTransactionNo
          ? { transaction_no: selectedTransactionNo }
          : {}),

        // BS_Cust_Acc_info
        CustomerID: selectedTransactionNo
          ? `CUST-${selectedTransactionNo}`
          : `CUST-NEW`,
        bank_name: data.bank,
        account_no: data.accountNumber,
        iban: data.iban,
        account_name: data.accountHolder,
        address: data.address,
        po_box: parseInt(data.poBox) || 0,
        building: data.building,
        area: data.area,
        city: data.city,
        postal_code: parseInt(data.postalCode) || 0,
        Created_Date: today,
        Created_by: "system",

        // BS_Balances
        start_date: data.period.from,
        end_date: data.period.to,
        opening_balance: data.openingBalance,
        closing_available_balance: data.closingBalance,
        ledger_balance: data.ledgerBalance ?? data.closingBalance,
        unclear_balance: data.unclearBalance ?? 0,
        average_balance: data.averageBalance,
        average_debit_balance: data.averageDebitBalance ?? 0,
        average_credit_balance: data.averageCreditBalance ?? 0,

        // BS_Summary
        total_no_of_debits: data.debitCount,
        total_no_of_credits: data.creditCount,
        total_debit_amount: data.totalDebits,
        total_credit_amount: data.totalCredits,
        debit_credit_filter: 0,
        amount_range: 0,
        min: 0,
        max: 0,

        // BS_transactions array
        transactions: data.transactions.map((tx, i) => ({
          Txn_serial_no: i + 1,
          date: tx.date,
          value_date: tx.value_date || tx.date,
          bank_reference_no:
            parseInt(tx.bank_reference_no?.replace(/\D/g, "") || "0") || 0,
          customer_reference_no:
            parseInt(tx.customer_reference_no?.replace(/\D/g, "") || "0") || 0,
          description: tx.description,
          debit_amount: tx.debit ?? 0,
          credit_amount: tx.credit ?? 0,
          running_balance: tx.balance,
          category: tx.category,
        })),
      };

      const res = await fetch(`${API_BASE_URL}/upload-bank-statement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(json.message || "Upload failed");

      setReturnedTransactionNo(json.transaction_no);
      setSubmitDone(true);

      // Refresh the dropdown list so the new record appears immediately
      const refreshed = await fetch(`${API_BASE_URL}/bs-cust-acc-info`);
      const refreshedJson = await refreshed.json();
      if (refreshedJson.success) setExistingRecords(refreshedJson.data);
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Failed to submit. Please try again.",
      );
    }
    setSubmitLoading(false);
  };

  const extractedCount = data?.transactions?.length ?? 0;
  const expectedCount = data
    ? (data.debitCount ?? 0) + (data.creditCount ?? 0)
    : 0;
  const countMismatch = expectedCount > 0 && extractedCount !== expectedCount;

  const scoreArc = (score: number) => {
    const total = Math.PI * 50;
    return {
      total,
      offset: total * (1 - Math.min(Math.max(score, 0), 100) / 100),
    };
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      {/* ── Transaction Selector ── */}

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
          ${dragOver ? "border-blue-400 bg-blue-50" : "border-border hover:border-blue-300 hover:bg-accent/40"}`}
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
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-500">
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
            <p className="text-sm font-medium text-blue-600">{file.name}</p>
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
        <div className="rounded-lg border bg-card p-8 text-center space-y-4">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
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
          <div>
            <p className="text-sm font-medium text-foreground">
              Extracting statement data…
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{loadingStage}</p>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Large statements may take 15–30 seconds
            </p>
          </div>
          <div className="mx-auto max-w-xs">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full animate-pulse rounded-full bg-blue-400"
                style={{ width: "60%" }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Results ── */}
      {data && (
        <div className="space-y-4">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Mode
              </span>
              {selectedTransactionNo ? (
                <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                  Updating #{selectedTransactionNo}
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                  Creating New
                </span>
              )}
            </div>
            {countMismatch ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-medium text-amber-700">
                ⚠ Extracted {extractedCount}/{expectedCount} txns
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-[11px] font-medium text-green-700">
                ✓ {extractedCount} transactions extracted
              </span>
            )}
          </div>

          {countMismatch && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
              <strong>Transaction count mismatch:</strong> Statement header
              shows {expectedCount} ({data.debitCount} debits +{" "}
              {data.creditCount} credits) but only {extractedCount} were
              extracted. Try re-uploading before submitting.
            </div>
          )}

          {/* ── Tabs ── */}
          <div className="flex gap-6 border-b border-border text-xs font-medium">
            {(["preview", "transactions", "assessment"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 capitalize transition-colors ${
                  activeTab === tab
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "preview"
                  ? "Account Preview"
                  : tab === "transactions"
                    ? `Transactions (${data.transactions?.length ?? 0})`
                    : "Loan Assessment"}
              </button>
            ))}
          </div>

          {/* ── Tab: Account Preview ── */}
          {activeTab === "preview" && (
            <div className="space-y-4">
              <div className="rounded-lg border bg-card p-5">
                <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  BS_Cust_Acc_info
                </p>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {[
                    { label: "Account Holder", value: data.accountHolder },
                    { label: "Bank", value: data.bank },
                    { label: "Account No.", value: data.accountNumber },
                    { label: "IBAN", value: data.iban },
                    { label: "City", value: data.city },
                    { label: "PO Box", value: data.poBox },
                    { label: "Building", value: data.building },
                    { label: "Area", value: data.area },
                    { label: "Address", value: data.address },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        {label}
                      </p>
                      <p className="truncate text-xs font-medium text-foreground">
                        {value || "—"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border bg-card p-5">
                <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  BS_Balances
                </p>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {[
                    {
                      label: "Period",
                      value: `${data.period?.from} → ${data.period?.to}`,
                    },
                    {
                      label: "Opening Balance",
                      value: `${data.currency} ${fmt(data.openingBalance)}`,
                    },
                    {
                      label: "Closing Balance",
                      value: `${data.currency} ${fmt(data.closingBalance)}`,
                      highlight: true,
                    },
                    {
                      label: "Average Balance",
                      value: `${data.currency} ${fmt(data.averageBalance)}`,
                    },
                    {
                      label: "Ledger Balance",
                      value: `${data.currency} ${fmt(data.ledgerBalance ?? data.closingBalance)}`,
                    },
                    {
                      label: "Unclear Balance",
                      value: `${data.currency} ${fmt(data.unclearBalance ?? 0)}`,
                    },
                    {
                      label: "Avg Debit Balance",
                      value: `${data.currency} ${fmt(data.averageDebitBalance ?? 0)}`,
                    },
                    {
                      label: "Avg Credit Balance",
                      value: `${data.currency} ${fmt(data.averageCreditBalance ?? 0)}`,
                    },
                  ].map(({ label, value, highlight }) => (
                    <div key={label}>
                      <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        {label}
                      </p>
                      <p
                        className={`tabular-nums text-xs font-semibold ${highlight ? "text-blue-600" : "text-foreground"}`}
                      >
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border bg-card p-5">
                <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  BS_Summary
                </p>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {[
                    { label: "No. of Debits", value: data.debitCount },
                    { label: "No. of Credits", value: data.creditCount },
                    {
                      label: "Total Debit Amt",
                      value: `${data.currency} ${fmt(data.totalDebits)}`,
                    },
                    {
                      label: "Total Credit Amt",
                      value: `${data.currency} ${fmt(data.totalCredits)}`,
                    },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        {label}
                      </p>
                      <p className="tabular-nums text-xs font-semibold text-foreground">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Tab: Transactions ── */}
          {activeTab === "transactions" && (
            <div className="rounded-lg border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      {[
                        "#",
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
                          ${["Debit", "Credit", "Balance"].includes(h) ? "text-right" : "text-left"}`}
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
                        <td className="px-4 py-2.5 text-muted-foreground">
                          {i + 1}
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">
                          {tx.date}
                        </td>
                        <td className="px-4 py-2.5 text-foreground max-w-[200px] truncate">
                          {tx.description}
                        </td>
                        <td className="px-4 py-2.5">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${categoryBadge(tx.category)}`}
                          >
                            {tx.category}
                          </span>
                        </td>
                        <td
                          className={`px-4 py-2.5 text-right tabular-nums ${tx.debit ? "text-red-600" : "text-muted-foreground"}`}
                        >
                          {tx.debit ? fmt(tx.debit) : "—"}
                        </td>
                        <td
                          className={`px-4 py-2.5 text-right tabular-nums ${tx.credit ? "text-green-600" : "text-muted-foreground"}`}
                        >
                          {tx.credit ? fmt(tx.credit) : "—"}
                        </td>
                        <td
                          className={`px-4 py-2.5 text-right tabular-nums font-medium ${tx.balance < 0 ? "text-red-600" : "text-foreground"}`}
                        >
                          {fmt(tx.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Tab: Loan Assessment ── */}
          {activeTab === "assessment" && data.loanAssessment && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg border bg-card p-5 space-y-4">
                <h4 className="text-sm font-semibold text-foreground">
                  Eligibility Score
                </h4>
                <div className="flex items-center gap-5">
                  <svg
                    width={100}
                    height={58}
                    viewBox="0 0 120 70"
                    className="shrink-0"
                  >
                    <path
                      d="M10,65 A50,50 0 0,1 110,65"
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
                      Max EMI:{" "}
                      <span className="font-semibold text-green-600">
                        {data.currency}{" "}
                        {(
                          data.loanAssessment.maxRecommendedEMI || 0
                        ).toLocaleString()}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="rounded-md bg-muted/50 px-3 py-2.5">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {data.loanAssessment.recommendation}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {(data.loanAssessment.positiveSignals || []).map((s, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-[11px] font-medium text-green-700"
                      >
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(data.loanAssessment.riskFlags || []).map((r, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-medium text-red-700"
                      >
                        ⚠ {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-5 space-y-3">
                <h4 className="text-sm font-semibold text-foreground">
                  Cash Flow Signals
                </h4>
                {[
                  {
                    label: "Avg Monthly Credit",
                    value: data.loanAssessment.averageMonthlyCredit,
                    color: "#16a34a",
                  },
                  {
                    label: "Avg Monthly Debit",
                    value: data.loanAssessment.averageMonthlyDebit,
                    color: "#f97316",
                  },
                  {
                    label: "Salary Inflows",
                    value: data.loanAssessment.salaryInflows,
                    color: "#3b82f6",
                  },
                  {
                    label: "Loan Repayments",
                    value: data.loanAssessment.loanRepayments,
                    color: "#f59e0b",
                  },
                  {
                    label: "Utility Payments",
                    value: data.loanAssessment.utilityPayments,
                    color: "#94a3b8",
                  },
                ].map((item) => {
                  const max = data.loanAssessment.averageMonthlyCredit || 1;
                  return (
                    <div key={item.label}>
                      <div className="mb-1 flex justify-between">
                        <span className="text-[11px] text-muted-foreground">
                          {item.label}
                        </span>
                        <span className="tabular-nums text-[11px] font-semibold text-foreground">
                          {data.currency} {(item.value || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${Math.min(100, ((item.value || 0) / max) * 100)}%`,
                            background: item.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Submit Panel ── */}
          <div className="rounded-lg border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Submit to Database
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {selectedTransactionNo
                    ? `Updating transaction #${selectedTransactionNo} — POST /upload-bank-statement`
                    : "Creating new record — POST /upload-bank-statement (ID auto-generated)"}
                </p>
              </div>
              <button
                onClick={handleSubmit}
                disabled={submitLoading || submitDone || countMismatch}
                className="rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                title={
                  countMismatch
                    ? "Fix transaction count mismatch before submitting"
                    : ""
                }
              >
                {submitLoading
                  ? "Submitting…"
                  : submitDone
                    ? "✓ Submitted"
                    : "Submit All"}
              </button>
            </div>

            {/* Single endpoint status card */}
            <div
              className={`rounded-lg border px-4 py-3 flex items-center justify-between transition-colors
              ${
                submitDone
                  ? "border-green-200 bg-green-50"
                  : submitError
                    ? "border-red-200 bg-red-50"
                    : submitLoading
                      ? "border-blue-200 bg-blue-50"
                      : "border-border bg-muted/30"
              }`}
            >
              <div className="flex items-center gap-3">
                {submitLoading ? (
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
                ) : submitDone ? (
                  <span className="text-green-600 text-base">✓</span>
                ) : submitError ? (
                  <span className="text-red-500 text-base">✗</span>
                ) : (
                  <span className="text-muted-foreground">○</span>
                )}
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    POST /upload-bank-statement
                  </p>
                  <p className="text-[10px] font-mono text-muted-foreground">
                    {API_BASE_URL}/upload-bank-statement
                  </p>
                </div>
              </div>
              <span
                className={`text-[10px] font-medium px-2 py-0.5 rounded-full
                ${
                  submitDone
                    ? "bg-green-100 text-green-700"
                    : submitLoading
                      ? "bg-blue-100 text-blue-700"
                      : submitError
                        ? "bg-red-100 text-red-600"
                        : "bg-muted text-muted-foreground"
                }`}
              >
                {submitDone
                  ? selectedTransactionNo
                    ? "200 Updated"
                    : "201 Created"
                  : submitLoading
                    ? "pending…"
                    : submitError
                      ? "error"
                      : "idle"}
              </span>
            </div>

            {/* Submit error */}
            {submitError && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-xs text-destructive">
                {submitError}
              </div>
            )}

            {/* Success banner */}
            {submitDone && returnedTransactionNo && (
              <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-xs text-green-700">
                <span className="text-base">✓</span>
                <div>
                  <p className="font-semibold">
                    {selectedTransactionNo
                      ? "Records updated successfully"
                      : "New records created successfully"}
                  </p>
                  <p className="mt-0.5 text-green-600">
                    Transaction #{returnedTransactionNo} —{" "}
                    {data?.transactions?.length} transaction rows saved
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
