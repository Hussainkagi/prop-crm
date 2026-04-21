"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";

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

interface SubmitStatus {
  custAccInfo: "idle" | "loading" | "success" | "error";
  balances: "idle" | "loading" | "success" | "error";
  summary: "idle" | "loading" | "success" | "error";
  transactions: "idle" | "loading" | "success" | "error";
}

interface SubmitProgress {
  current: number;
  total: number;
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

const ratingTextColor = (r: string) =>
  ({
    Excellent: "text-green-600",
    Good: "text-lime-600",
    Fair: "text-amber-500",
    Poor: "text-orange-500",
    "Very Poor": "text-red-500",
  })[r] ?? "text-muted-foreground";

const ratingHex = (r: string) =>
  ({
    Excellent: "#16a34a",
    Good: "#65a30d",
    Fair: "#f59e0b",
    Poor: "#f97316",
    "Very Poor": "#ef4444",
  })[r] ?? "#94a3b8";

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

const statusIcon = (s: SubmitStatus[keyof SubmitStatus]) => {
  if (s === "loading")
    return (
      <svg
        className="h-3.5 w-3.5 animate-spin text-blue-500"
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
    );
  if (s === "success") return <span className="text-green-600 text-sm">✓</span>;
  if (s === "error") return <span className="text-red-500 text-sm">✗</span>;
  return <span className="text-muted-foreground text-sm">○</span>;
};

// ─── Prompts ──────────────────────────────────────────────────────────────────

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
- You MUST extract EVERY SINGLE transaction row from ALL pages of the PDF — do not skip, truncate, or summarize any.
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
  const [transactionNumber] = useState(
    () => Math.floor(Math.random() * 90000) + 10000,
  );
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>({
    custAccInfo: "idle",
    balances: "idle",
    summary: "idle",
    transactions: "idle",
  });
  const [submitProgress, setSubmitProgress] = useState<SubmitProgress>({
    current: 0,
    total: 0,
  });
  const [submitDone, setSubmitDone] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Extract data from PDF via Claude API ──
  const analyzeFile = async (f: File) => {
    setLoading(true);
    setLoadingStage("Reading PDF…");
    setError(null);
    setData(null);
    setSubmitDone(false);
    setSubmitProgress({ current: 0, total: 0 });
    setSubmitStatus({
      custAccInfo: "idle",
      balances: "idle",
      summary: "idle",
      transactions: "idle",
    });

    try {
      setLoadingStage("Converting file to base64…");
      const base64 = await fileToBase64(f);

      setLoadingStage("— extracting all transactions…");
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
          // ── KEY FIX: increased from 8000 to 16000 so large statements fit ──
          max_tokens: 16000,
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
                  // ── KEY FIX: explicit instruction to read ALL pages ──
                  text: "Analyze this bank statement and return the JSON as instructed. IMPORTANT: This PDF has multiple pages. You MUST read every page and extract EVERY transaction row. The transactions array must be complete — its length must equal debitCount + creditCount as shown in the statement header. Do not stop early or skip any rows.",
                },
              ],
            },
          ],
        }),
      });

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error.message || "Claude API error");
      }

      setLoadingStage("Parsing extracted data…");

      const text: string =
        result.content?.find((c: { type: string }) => c.type === "text")
          ?.text ?? "";

      // ── KEY FIX: robust JSON extraction (strip any accidental fences) ──
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in Claude response");
      const clean = jsonMatch[0];
      const parsed: StatementData = JSON.parse(clean);

      // ── Warn (but don't block) if count still mismatches ──
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

  // ── Submit to all 4 APIs ──
  const handleSubmit = async () => {
    if (!data) return;
    setSubmitError(null);
    setSubmitDone(false);
    setSubmitProgress({ current: 0, total: 0 });

    const today = new Date().toISOString().slice(0, 10);

    // ── Step 1: Customer Account Info ──
    setSubmitStatus((s) => ({ ...s, custAccInfo: "loading" }));
    try {
      const res = await fetch(`${API_BASE_URL}/bs-cust-acc-info`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Transaction_number: transactionNumber,
          CustomerID: `CUST-${transactionNumber}`,
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
        }),
      });
      if (!res.ok) throw new Error();
      setSubmitStatus((s) => ({ ...s, custAccInfo: "success" }));
    } catch {
      setSubmitStatus((s) => ({ ...s, custAccInfo: "error" }));
      setSubmitError("Failed to save Customer Account Info.");
      return;
    }

    // ── Step 2: Balances ──
    setSubmitStatus((s) => ({ ...s, balances: "loading" }));
    try {
      const res = await fetch(`${API_BASE_URL}/bs-balances`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Transaction_number: transactionNumber,
          start_date: data.period.from,
          end_date: data.period.to,
          opening_balance: data.openingBalance,
          closing_available_balance: data.closingBalance,
          ledger_balance: data.ledgerBalance ?? data.closingBalance,
          unclear_balance: data.unclearBalance ?? 0,
          average_balance: data.averageBalance,
          average_debit_balance: data.averageDebitBalance ?? 0,
          average_credit_balance: data.averageCreditBalance ?? 0,
        }),
      });
      if (!res.ok) throw new Error();
      setSubmitStatus((s) => ({ ...s, balances: "success" }));
    } catch {
      setSubmitStatus((s) => ({ ...s, balances: "error" }));
      setSubmitError("Failed to save Balances.");
      return;
    }

    // ── Step 3: Summary ──
    setSubmitStatus((s) => ({ ...s, summary: "loading" }));
    try {
      const res = await fetch(`${API_BASE_URL}/bs-summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Transaction_number: transactionNumber,
          total_no_of_debits: data.debitCount,
          total_no_of_credits: data.creditCount,
          total_debit_amount: data.totalDebits,
          total_credit_amount: data.totalCredits,
          debit_credit_filter: 0,
          amount_range: 0,
          min: 0,
          max: 0,
        }),
      });
      if (!res.ok) throw new Error();
      setSubmitStatus((s) => ({ ...s, summary: "success" }));
    } catch {
      setSubmitStatus((s) => ({ ...s, summary: "error" }));
      setSubmitError("Failed to save Summary.");
      return;
    }

    // ── Step 4: Transactions (batched with progress + delay) ──
    setSubmitStatus((s) => ({ ...s, transactions: "loading" }));
    try {
      // ── Validation: total count must match debitCount + creditCount ──
      const expectedCount = (data.debitCount ?? 0) + (data.creditCount ?? 0);
      const actualCount = data.transactions?.length ?? 0;
      if (expectedCount > 0 && actualCount !== expectedCount) {
        setSubmitStatus((s) => ({ ...s, transactions: "error" }));
        setSubmitError(
          `Transaction count mismatch: statement header says ${expectedCount} (${data.debitCount} debits + ${data.creditCount} credits) but extracted ${actualCount} transactions. Please re-analyze the PDF before submitting.`,
        );
        return;
      }

      const BATCH_SIZE = 10;
      const MAX_RETRIES = 3;
      const RETRY_DELAY_MS = 600;
      // ── KEY FIX: delay between batches to avoid hammering the backend ──
      const INTER_BATCH_DELAY_MS = 300;

      const total = data.transactions.length;
      setSubmitProgress({ current: 0, total });

      const submitTx = async (
        tx: Transaction,
        index: number,
      ): Promise<void> => {
        const body = JSON.stringify({
          Transaction_number: transactionNumber,
          Txn_serial_no: index + 1,
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
        });

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
          const res = await fetch(`${API_BASE_URL}/bs-transactions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body,
          });
          if (res.ok) return;
          if (attempt < MAX_RETRIES) {
            await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * attempt));
          } else {
            throw new Error(
              `Txn #${index + 1} failed after ${MAX_RETRIES} attempts`,
            );
          }
        }
      };

      // ── Process in batches, update progress, pause between batches ──
      for (let i = 0; i < data.transactions.length; i += BATCH_SIZE) {
        const batch = data.transactions.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map((tx, j) => submitTx(tx, i + j)));

        // Update progress counter after each batch completes
        setSubmitProgress({ current: Math.min(i + BATCH_SIZE, total), total });

        // Pause between batches (skip delay after last batch)
        if (i + BATCH_SIZE < data.transactions.length) {
          await new Promise((r) => setTimeout(r, INTER_BATCH_DELAY_MS));
        }
      }

      setSubmitStatus((s) => ({ ...s, transactions: "success" }));
      setSubmitDone(true);
    } catch (err) {
      setSubmitStatus((s) => ({ ...s, transactions: "error" }));
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Failed to save one or more transactions.",
      );
    }
  };

  const allSuccess =
    submitStatus.custAccInfo === "success" &&
    submitStatus.balances === "success" &&
    submitStatus.summary === "success" &&
    submitStatus.transactions === "success";

  const isSubmitting = Object.values(submitStatus).some((s) => s === "loading");

  const scoreArc = (score: number) => {
    const total = Math.PI * 50;
    return {
      total,
      offset: total * (1 - Math.min(Math.max(score, 0), 100) / 100),
    };
  };

  // ── Extracted transaction count vs expected ──
  const extractedCount = data?.transactions?.length ?? 0;
  const expectedCount = data
    ? (data.debitCount ?? 0) + (data.creditCount ?? 0)
    : 0;
  const countMismatch = expectedCount > 0 && extractedCount !== expectedCount;

  // ─── Render ───────────────────────────────────────────────────────────────

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
              Large statements with many transactions may take 15–30 seconds
            </p>
          </div>
          {/* Animated progress bar */}
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
          {/* Transaction Number Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Transaction #
              </span>
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                {transactionNumber}
              </span>
            </div>
            {/* ── Transaction count indicator ── */}
            <div className="flex items-center gap-2">
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
          </div>

          {/* ── Count mismatch warning ── */}
          {countMismatch && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
              <strong>Transaction count mismatch:</strong> The statement header
              shows {expectedCount} transactions ({data.debitCount} debits +{" "}
              {data.creditCount} credits) but only {extractedCount} were
              extracted. Try re-uploading the file for a complete extraction
              before submitting.
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
              {/* Account Info */}
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

              {/* Balances */}
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

              {/* Summary */}
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
              {/* Score Card */}
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

              {/* Cash Flow Signals */}
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
                  Saves data across all 4 BS_ tables sequentially
                </p>
              </div>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || allSuccess || countMismatch}
                className="rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                title={
                  countMismatch
                    ? "Fix transaction count mismatch before submitting"
                    : ""
                }
              >
                {isSubmitting
                  ? "Submitting…"
                  : allSuccess
                    ? "✓ Submitted"
                    : "Submit All"}
              </button>
            </div>

            {/* Status Grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(
                [
                  {
                    key: "custAccInfo",
                    label: "Cust Acc Info",
                    endpoint: "/bs-cust-acc-info",
                  },
                  {
                    key: "balances",
                    label: "Balances",
                    endpoint: "/bs-balances",
                  },
                  { key: "summary", label: "Summary", endpoint: "/bs-summary" },
                  {
                    key: "transactions",
                    label: `Transactions (${data.transactions?.length ?? 0})`,
                    endpoint: "/bs-transactions",
                  },
                ] as {
                  key: keyof SubmitStatus;
                  label: string;
                  endpoint: string;
                }[]
              ).map(({ key, label, endpoint }) => (
                <div
                  key={key}
                  className={`rounded-lg border px-3 py-2.5 transition-colors
                    ${
                      submitStatus[key] === "success"
                        ? "border-green-200 bg-green-50"
                        : submitStatus[key] === "error"
                          ? "border-red-200 bg-red-50"
                          : submitStatus[key] === "loading"
                            ? "border-blue-200 bg-blue-50"
                            : "border-border bg-muted/30"
                    }`}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      {label}
                    </span>
                    {statusIcon(submitStatus[key])}
                  </div>
                  <p className="truncate font-mono text-[10px] text-muted-foreground">
                    {endpoint}
                  </p>
                </div>
              ))}
            </div>

            {/* ── Transaction upload progress bar ── */}
            {submitStatus.transactions === "loading" &&
              submitProgress.total > 0 && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>Uploading transactions…</span>
                    <span>
                      {submitProgress.current} / {submitProgress.total}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all duration-300"
                      style={{
                        width: `${(submitProgress.current / submitProgress.total) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Sending in batches of 10 with 300 ms pause between batches
                  </p>
                </div>
              )}

            {/* Submit error */}
            {submitError && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-xs text-destructive">
                {submitError}
              </div>
            )}

            {/* Success banner */}
            {submitDone && (
              <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-xs text-green-700">
                <span className="text-base">✓</span>
                <div>
                  <p className="font-semibold">
                    All data submitted successfully
                  </p>
                  <p className="mt-0.5 text-green-600">
                    Transaction #{transactionNumber} —{" "}
                    {data.transactions?.length} transaction rows saved
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
