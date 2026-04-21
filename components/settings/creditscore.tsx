"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";

const CLAUDE_KEY = process.env.NEXT_PUBLIC_CLAUDE_KEY;
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

interface CreditAccount {
  accountType: string;
  accountHolder: string;
  accountNumber: string;
  openDate: string;
  status: string;
  creditLimit?: number;
  currentBalance: number;
  paymentStatus: string;
  lastPaymentDate?: string;
}

interface CreditScore {
  score: number;
  rating: "Excellent" | "Good" | "Fair" | "Poor" | "Very Poor";
  scoreRange: string;
}

interface CreditReportData {
  consumerName: string;
  dateOfBirth?: string;
  address: string;
  reportDate: string;
  reportNumber?: string;
  creditScore: CreditScore;
  accounts: CreditAccount[];
  totalDebt: number;
  totalCreditLimit: number;
  creditUtilization: number;
  paymentHistory: Array<{ date: string; status: string; account: string }>;
  publicRecords: Array<{ type: string; date: string; details: string }>;
  inquiries: Array<{ date: string; creditor: string; type: string }>;
  delinquencies: Array<{
    account: string;
    status: string;
    daysLate: number;
    amount: number;
  }>;
  bankruptcies?: Array<{ type: string; date: string; details: string }>;
  chargeOffs?: Array<{ creditor: string; date: string; amount: number }>;
  collections?: Array<{
    creditor: string;
    date: string;
    amount: number;
    status: string;
  }>;
  latePayments?: Array<{ creditor: string; date: string; daysLate: number }>;
  recommendations: string[];
  summaryNotes?: string;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const SYSTEM_PROMPT = `You are a comprehensive credit report analyzer AI. When given a credit report PDF (potentially 17+ pages), extract and return ONLY a valid JSON object (no markdown, no explanation) with ALL available information in this exact structure:

{
  "consumerName": "string",
  "dateOfBirth": "string (YYYY-MM-DD) or null",
  "address": "string",
  "reportDate": "string (YYYY-MM-DD)",
  "reportNumber": "string or null",
  "creditScore": {
    "score": number (300-850),
    "rating": "Excellent|Good|Fair|Poor|Very Poor",
    "scoreRange": "string"
  },
  "accounts": [
    {
      "accountType": "string (Credit Card, Mortgage, Auto Loan, etc.)",
      "accountHolder": "string",
      "accountNumber": "string",
      "openDate": "string (YYYY-MM-DD)",
      "status": "Active|Closed|Delinquent",
      "creditLimit": number or null,
      "currentBalance": number,
      "paymentStatus": "Current|30 days late|60 days late|90+ days late",
      "lastPaymentDate": "string (YYYY-MM-DD) or null"
    }
  ],
  "totalDebt": number,
  "totalCreditLimit": number,
  "creditUtilization": number (0-100),
  "paymentHistory": [
    {
      "date": "string (YYYY-MM-DD)",
      "status": "string",
      "account": "string"
    }
  ],
  "publicRecords": [
    {
      "type": "string (Judgment, Lien, Bankruptcy, etc.)",
      "date": "string (YYYY-MM-DD)",
      "details": "string"
    }
  ],
  "inquiries": [
    {
      "date": "string (YYYY-MM-DD)",
      "creditor": "string",
      "type": "Hard|Soft"
    }
  ],
  "delinquencies": [
    {
      "account": "string",
      "status": "string",
      "daysLate": number,
      "amount": number
    }
  ],
  "bankruptcies": [
    {
      "type": "Chapter 7|Chapter 13|etc",
      "date": "string (YYYY-MM-DD)",
      "details": "string"
    }
  ],
  "chargeOffs": [
    {
      "creditor": "string",
      "date": "string (YYYY-MM-DD)",
      "amount": number
    }
  ],
  "collections": [
    {
      "creditor": "string",
      "date": "string (YYYY-MM-DD)",
      "amount": number,
      "status": "string"
    }
  ],
  "latePayments": [
    {
      "creditor": "string",
      "date": "string (YYYY-MM-DD)",
      "daysLate": number
    }
  ],
  "recommendations": ["string"],
  "summaryNotes": "string or null"
}`;

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

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    Active: "bg-green-100 text-green-700",
    Closed: "bg-gray-100 text-gray-700",
    Delinquent: "bg-red-100 text-red-700",
    Current: "bg-green-100 text-green-700",
    "30 days late": "bg-yellow-100 text-yellow-700",
    "60 days late": "bg-orange-100 text-orange-700",
    "90+ days late": "bg-red-100 text-red-700",
  };
  return map[status] ?? "bg-muted text-muted-foreground";
};

export function CreditScore() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [aecbSyncing, setAecbSyncing] = useState(false);
  const [data, setData] = useState<CreditReportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [transactionNumber, setTransactionNumber] = useState<string | null>(
    null,
  );
  const [preparedRequests, setPreparedRequests] = useState<
    Array<{ endpoint: string; body: Record<string, unknown> }>
  >([]);
  const [dragOver, setDragOver] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("crm_access_token") || "";
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const extractApiData = (payload: unknown): unknown[] => {
    if (!payload || typeof payload !== "object") return [];
    const obj = payload as { data?: unknown };
    if (Array.isArray(obj.data)) return obj.data;
    if (obj.data && typeof obj.data === "object") return [obj.data];
    return [];
  };

  const postAecbRecord = async (
    endpoint: string,
    body: Record<string, unknown>,
  ): Promise<{ ok: boolean; message?: string }> => {
    const res = await fetch(`${BASE_URL}/aecb/${endpoint}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res
        .json()
        .catch(() => ({ message: `Failed posting ${endpoint}` }));
      return {
        ok: false,
        message:
          (err as { message?: string }).message || `Failed posting ${endpoint}`,
      };
    }
    return { ok: true };
  };

  const getAecbByTransaction = async (endpoint: string, txn: string) => {
    const res = await fetch(
      `${BASE_URL}/aecb/${endpoint}/transaction/${encodeURIComponent(txn)}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      },
    );
    if (!res.ok) return [];
    const payload = await res.json().catch(() => ({}));
    return extractApiData(payload) as Record<string, unknown>[];
  };

  const splitName = (fullName: string) => {
    const parts = (fullName || "").trim().split(/\s+/);
    return {
      firstName: parts[0] || "",
      lastName: parts.slice(1).join(" ") || "",
    };
  };

  const toSafeNumber = (value: unknown, fallback = 0): number => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  };

  const INT32_MAX = 2147483647;

  const resolveTransactionNumber = (raw?: string): number => {
    const digits = (raw || "").replace(/\D/g, "");

    // Keep Transaction_Number strictly within PostgreSQL int4 range.
    if (digits.length > 0) {
      const maybe = Number.parseInt(digits.slice(-9), 10);
      if (Number.isFinite(maybe) && maybe > 0 && maybe <= INT32_MAX) {
        return maybe;
      }
    }

    // epoch seconds fits in int4 for current dates (~1.7b)
    const epochSeconds = Math.floor(Date.now() / 1000);
    return Math.min(Math.max(epochSeconds, 1), INT32_MAX);
  };

  const buildAecbRequests = (
    parsed: CreditReportData,
    txnNumber: number,
  ): Array<{ endpoint: string; body: Record<string, unknown> }> => {
    const { firstName, lastName } = splitName(parsed.consumerName);
    const primaryEmail =
      parsed.inquiries?.[0]?.creditor
        ?.toLowerCase()
        .replace(/\s+/g, "")
        .concat("@mail.com") || "customer@mail.com";

    const requests: Array<{ endpoint: string; body: Record<string, unknown> }> =
      [
        {
          endpoint: "personal-details",
          body: {
            Transaction_Number: txnNumber,
            First_Name: firstName,
            Last_Name: lastName,
            Date_of_Birth: parsed.dateOfBirth || "1990-01-01",
            Gender: "M",
            Nationality: "SA",
            Email: primaryEmail,
            Phone: "0500000000",
          },
        },
        {
          endpoint: "contact-details",
          body: {
            Transaction_Number: txnNumber,
            Mobile_Number: "0500000000",
            Alternate_Mobile: "0500000001",
            Email: primaryEmail,
            Office_Phone: "0110000000",
            Contact_Type: "Personal",
          },
        },
        {
          endpoint: "address-details",
          body: {
            Transaction_Number: txnNumber,
            Street_Address: parsed.address || "Unknown",
            City: parsed.address?.split(",")?.[0]?.trim() || "Unknown",
            Region: parsed.address?.split(",")?.[1]?.trim() || "Unknown",
            Postal_Code: "00000",
            Country: "SA",
            Address_Type: "Residential",
          },
        },
        {
          endpoint: "total-credit-summary",
          body: {
            Transaction_Number: txnNumber,
            Total_Credit_Limit: String(toSafeNumber(parsed.totalCreditLimit)),
            Total_Used: String(toSafeNumber(parsed.totalDebt)),
            Available_Credit: String(
              Math.max(
                0,
                toSafeNumber(parsed.totalCreditLimit) -
                  toSafeNumber(parsed.totalDebt),
              ),
            ),
            Payment_Status: parsed.creditScore.rating,
          },
        },
      ];

    const creditFacilities = parsed.accounts.filter(
      (a) => !a.accountType.toLowerCase().includes("card"),
    );
    for (const a of creditFacilities) {
      requests.push({
        endpoint: "credit-facilities",
        body: {
          Transaction_Number: txnNumber,
          Facility_Type: a.accountType,
          Bank_Name: a.accountHolder || "Unknown",
          Sanctioned_Amount: String(
            toSafeNumber(a.creditLimit ?? a.currentBalance),
          ),
          Outstanding_Amount: String(toSafeNumber(a.currentBalance)),
          Status: a.status,
        },
      });
    }

    const cardFacilities = parsed.accounts.filter((a) =>
      a.accountType.toLowerCase().includes("card"),
    );
    for (const a of cardFacilities) {
      requests.push({
        endpoint: "credit-card-facilities",
        body: {
          Transaction_Number: txnNumber,
          Card_Number: a.accountNumber || "XXXX-XXXX-XXXX-0000",
          Bank_Name: a.accountHolder || "Unknown",
          Credit_Limit: String(toSafeNumber(a.creditLimit)),
          Outstanding_Balance: String(toSafeNumber(a.currentBalance)),
          Card_Status: a.status,
        },
      });
    }

    for (const d of parsed.delinquencies || []) {
      requests.push({
        endpoint: "return-cheque",
        body: {
          Transaction_Number: txnNumber,
          Cheque_Number: d.account || "UNKNOWN",
          Amount: String(toSafeNumber(d.amount)),
          Bank_Name: "Unknown",
          Return_Reason: d.status || "Late",
          Return_Date: parsed.reportDate || "2026-01-01",
        },
      });
    }

    return requests;
  };

  const syncAecbAndHydrate = async (parsed: CreditReportData, txn: string) => {
    if (!BASE_URL) return parsed;
    setAecbSyncing(true);

    try {
      const failures: string[] = [];
      for (const req of preparedRequests) {
        const response = await postAecbRecord(req.endpoint, req.body);
        if (!response.ok) {
          failures.push(`${req.endpoint}: ${response.message || "failed"}`);
        }
      }

      if (failures.length > 0) {
        setUploadMessage(`Uploaded with ${failures.length} issues.`);
      } else {
        setUploadMessage("All AECB API payloads uploaded successfully.");
      }

      const [
        personalRows,
        addressRows,
        summaryRows,
        facilityRows,
        cardRows,
        rcRows,
      ] = await Promise.all([
        getAecbByTransaction("personal-details", txn),
        getAecbByTransaction("address-details", txn),
        getAecbByTransaction("total-credit-summary", txn),
        getAecbByTransaction("credit-facilities", txn),
        getAecbByTransaction("credit-card-facilities", txn),
        getAecbByTransaction("return-cheque", txn),
      ]);

      const personal = personalRows[0];
      const address = addressRows[0];
      const summary = summaryRows[0];

      const mergedAccounts: CreditAccount[] = [
        ...facilityRows.map((row) => ({
          accountType: String(row.Facility_Type || "Facility"),
          accountHolder: String(row.Bank_Name || "Unknown"),
          accountNumber: String(row.Facility_Number || row.id || "N/A"),
          openDate: parsed.reportDate,
          status: String(row.Status || "Active"),
          creditLimit: Number(row.Sanctioned_Amount || 0),
          currentBalance: Number(row.Outstanding_Amount || 0),
          paymentStatus: String(row.Status || "Current"),
        })),
        ...cardRows.map((row) => ({
          accountType: "Credit Card",
          accountHolder: String(row.Bank_Name || "Unknown"),
          accountNumber: String(row.Card_Number || "XXXX"),
          openDate: parsed.reportDate,
          status: String(row.Card_Status || "Active"),
          creditLimit: Number(row.Credit_Limit || 0),
          currentBalance: Number(row.Outstanding_Balance || 0),
          paymentStatus: String(row.Card_Status || "Current"),
        })),
      ];

      const mergedDelinquencies = rcRows.map((row) => ({
        account: String(row.Cheque_Number || "Unknown"),
        status: String(row.Return_Reason || "Late"),
        daysLate: 30,
        amount: Number(row.Amount || 0),
      }));

      return {
        ...parsed,
        consumerName:
          personal && (personal.First_Name || personal.Last_Name)
            ? `${String(personal.First_Name || "")} ${String(personal.Last_Name || "")}`.trim()
            : parsed.consumerName,
        address: address
          ? String(address.Street_Address || parsed.address)
          : parsed.address,
        totalCreditLimit: summary
          ? Number(summary.Total_Credit_Limit || parsed.totalCreditLimit || 0)
          : parsed.totalCreditLimit,
        totalDebt: summary
          ? Number(summary.Total_Used || parsed.totalDebt || 0)
          : parsed.totalDebt,
        accounts: mergedAccounts.length > 0 ? mergedAccounts : parsed.accounts,
        delinquencies:
          mergedDelinquencies.length > 0
            ? mergedDelinquencies
            : parsed.delinquencies,
      } as CreditReportData;
    } catch {
      // If sync/hydration fails, keep parsed Claude data visible
      setUploadMessage("AECB upload failed. Showing analyzed data only.");
      return parsed;
    } finally {
      setAecbSyncing(false);
    }
  };

  const analyzeFile = async (f: File) => {
    setLoading(true);
    setError(null);
    setUploadMessage(null);
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
                  text: "Analyze this credit report and return the JSON as instructed.",
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
      const parsed: CreditReportData = JSON.parse(clean);
      setData(parsed);

      const txnNumber = resolveTransactionNumber(parsed.reportNumber);
      const txnText = String(txnNumber);
      setTransactionNumber(txnText);
      setPreparedRequests(buildAecbRequests(parsed, txnNumber));
    } catch {
      setError("Failed to analyze the credit report. Please try again.");
    }
    setLoading(false);
  };

  const handleFile = (f: File | null | undefined) => {
    if (!f || f.type !== "application/pdf") {
      setError("Please upload a valid PDF file.");
      return;
    }
    setFile(f);
    setPreparedRequests([]);
    setTransactionNumber(null);
    analyzeFile(f);
  };

  const submitPreparedRequests = async () => {
    if (!data || !transactionNumber || preparedRequests.length === 0) {
      setError("No prepared payloads to upload.");
      return;
    }
    const merged = await syncAecbAndHydrate(data, transactionNumber);
    setData(merged);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Failed to copy JSON to clipboard");
    }
  };

  const fmt = (n: number) =>
    n?.toLocaleString("en-US", { minimumFractionDigits: 2 });

  const scoreArc = (score: number) => {
    const pct = Math.min(Math.max(score, 300), 850);
    const normalized = (pct - 300) / 550;
    const total = Math.PI * 50;
    return { total, offset: total * (1 - normalized) };
  };

  return (
    <div className="space-y-5">
      {/* Upload Zone */}
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
              Drop your credit report PDF here
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              or click to browse
            </p>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="rounded-lg border bg-card p-8 text-center">
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
          <p className="text-sm text-muted-foreground">
            Analyzing credit report…
          </p>
        </div>
      )}

      {aecbSyncing && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          Syncing extracted data to AECB API tables...
        </div>
      )}

      {uploadMessage && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          {uploadMessage}
        </div>
      )}

      {data && preparedRequests.length > 0 && (
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-semibold text-foreground">
                AECB API Payload Preview
              </h4>
              <p className="text-xs text-muted-foreground">
                Review the payloads below before submitting to all AECB APIs.
              </p>
            </div>
            <button
              type="button"
              onClick={submitPreparedRequests}
              disabled={aecbSyncing}
              className="rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {aecbSyncing
                ? "Uploading..."
                : `Upload ${preparedRequests.length} Payloads`}
            </button>
          </div>

          <div className="max-h-72 space-y-2 overflow-auto rounded-md border p-2">
            {preparedRequests.map((req, i) => (
              <details
                key={`${req.endpoint}-${i}`}
                className="rounded border p-2"
              >
                <summary className="cursor-pointer text-xs font-medium text-foreground">
                  {req.endpoint}
                </summary>
                <pre className="mt-2 overflow-auto rounded bg-muted p-2 text-[11px]">
                  {JSON.stringify(req.body, null, 2)}
                </pre>
              </details>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {data && (
        <div className="space-y-4">
          {/* Header with Copy Button */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Credit Report Analysis
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Report Date: {data.reportDate}
              </p>
              {transactionNumber && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Transaction: {transactionNumber}
                </p>
              )}
            </div>
            <button
              onClick={copyToClipboard}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                copied
                  ? "bg-green-100 text-green-700"
                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
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

          {/* Consumer Info */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border bg-card p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Consumer Name
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {data.consumerName}
              </p>
            </div>
            {data.dateOfBirth && (
              <div className="rounded-lg border bg-card p-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Date of Birth
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {data.dateOfBirth}
                </p>
              </div>
            )}
            <div className="rounded-lg border bg-card p-4 sm:col-span-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Address
              </p>
              <p className="mt-1 text-sm text-foreground">{data.address}</p>
            </div>
          </div>

          {/* Credit Score Card */}
          <div className="rounded-lg border bg-card p-5 space-y-4">
            <h4 className="text-sm font-semibold text-foreground">
              Credit Score
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
                  stroke={ratingHex(data.creditScore.rating)}
                  strokeWidth={10}
                  strokeLinecap="round"
                  strokeDasharray={`${scoreArc(data.creditScore.score).total} ${scoreArc(data.creditScore.score).total}`}
                  strokeDashoffset={scoreArc(data.creditScore.score).offset}
                />
                <text
                  x="60"
                  y="60"
                  textAnchor="middle"
                  fill={ratingHex(data.creditScore.rating)}
                  fontSize="18"
                  fontWeight="700"
                >
                  {data.creditScore.score}
                </text>
              </svg>
              <div className="space-y-1">
                <p
                  className={`text-xl font-bold ${ratingTextColor(data.creditScore.rating)}`}
                >
                  {data.creditScore.rating}
                </p>
                <p className="text-xs text-muted-foreground">
                  {data.creditScore.scoreRange}
                </p>
              </div>
            </div>
          </div>

          {/* Credit Metrics */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              {
                label: "Total Debt",
                value: data.totalDebt,
                format: "$",
              },
              {
                label: "Credit Limit",
                value: data.totalCreditLimit,
                format: "$",
              },
              {
                label: "Credit Utilization",
                value: data.creditUtilization,
                format: "%",
              },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border bg-card p-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {item.label}
                </p>
                <p className="mt-1 text-base font-bold text-foreground tabular-nums">
                  {item.format === "$" ? "$" : ""}
                  {fmt(item.value)}
                  {item.format === "%" ? "%" : ""}
                </p>
              </div>
            ))}
          </div>

          {/* Accounts */}
          {data.accounts && data.accounts.length > 0 && (
            <div className="rounded-lg border bg-card overflow-hidden">
              <div className="flex items-center justify-between border-b px-5 py-3">
                <h4 className="text-sm font-semibold text-foreground">
                  Credit Accounts
                </h4>
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  {data.accounts.length} accounts
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      {[
                        "Type",
                        "Account #",
                        "Status",
                        "Limit",
                        "Balance",
                        "Payment",
                      ].map((h) => (
                        <th
                          key={h}
                          className={`px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground
                            ${h === "Type" || h === "Account #" ? "text-left" : "text-right"}`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.accounts.map((account, i) => (
                      <tr
                        key={i}
                        className="transition-colors hover:bg-accent/40"
                      >
                        <td className="px-4 py-2.5 text-xs text-foreground">
                          {account.accountType}
                        </td>
                        <td className="px-4 py-2.5 text-xs text-muted-foreground font-mono">
                          {account.accountNumber}
                        </td>
                        <td className="px-4 py-2.5">
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${statusBadge(account.status)}`}
                          >
                            {account.status}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right text-xs font-medium tabular-nums text-foreground">
                          {account.creditLimit
                            ? `$${fmt(account.creditLimit)}`
                            : "—"}
                        </td>
                        <td className="px-4 py-2.5 text-right text-xs font-medium tabular-nums text-foreground">
                          ${fmt(account.currentBalance)}
                        </td>
                        <td className="px-4 py-2.5">
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${statusBadge(account.paymentStatus)}`}
                          >
                            {account.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {data.recommendations && data.recommendations.length > 0 && (
            <div className="rounded-lg border bg-card p-4">
              <h4 className="text-sm font-semibold text-foreground mb-3">
                Recommendations
              </h4>
              <ul className="space-y-2">
                {data.recommendations.map((rec, i) => (
                  <li
                    key={i}
                    className="flex gap-2 text-xs text-muted-foreground"
                  >
                    <span className="text-blue-500 mt-1">✓</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Delinquencies */}
          {data.delinquencies && data.delinquencies.length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <h4 className="text-sm font-semibold text-red-900 mb-3">
                Delinquencies ({data.delinquencies.length})
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b">
                      <th className="px-3 py-2 text-left font-medium">
                        Account
                      </th>
                      <th className="px-3 py-2 text-left font-medium">
                        Status
                      </th>
                      <th className="px-3 py-2 text-right font-medium">
                        Days Late
                      </th>
                      <th className="px-3 py-2 text-right font-medium">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.delinquencies.map((delin, i) => (
                      <tr key={i} className="border-b">
                        <td className="px-3 py-2">{delin.account}</td>
                        <td className="px-3 py-2">{delin.status}</td>
                        <td className="px-3 py-2 text-right">
                          {delin.daysLate}
                        </td>
                        <td className="px-3 py-2 text-right font-semibold">
                          ${fmt(delin.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Charge Offs */}
          {data.chargeOffs && data.chargeOffs.length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <h4 className="text-sm font-semibold text-red-900 mb-3">
                Charge Offs ({data.chargeOffs.length})
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b">
                      <th className="px-3 py-2 text-left font-medium">
                        Creditor
                      </th>
                      <th className="px-3 py-2 text-left font-medium">Date</th>
                      <th className="px-3 py-2 text-right font-medium">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.chargeOffs.map((chargeOff, i) => (
                      <tr key={i} className="border-b">
                        <td className="px-3 py-2">{chargeOff.creditor}</td>
                        <td className="px-3 py-2">{chargeOff.date}</td>
                        <td className="px-3 py-2 text-right font-semibold">
                          ${fmt(chargeOff.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Collections */}
          {data.collections && data.collections.length > 0 && (
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
              <h4 className="text-sm font-semibold text-orange-900 mb-3">
                Collections ({data.collections.length})
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b">
                      <th className="px-3 py-2 text-left font-medium">
                        Creditor
                      </th>
                      <th className="px-3 py-2 text-left font-medium">Date</th>
                      <th className="px-3 py-2 text-left font-medium">
                        Status
                      </th>
                      <th className="px-3 py-2 text-right font-medium">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.collections.map((collection, i) => (
                      <tr key={i} className="border-b">
                        <td className="px-3 py-2">{collection.creditor}</td>
                        <td className="px-3 py-2">{collection.date}</td>
                        <td className="px-3 py-2">{collection.status}</td>
                        <td className="px-3 py-2 text-right font-semibold">
                          ${fmt(collection.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Late Payments */}
          {data.latePayments && data.latePayments.length > 0 && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <h4 className="text-sm font-semibold text-yellow-900 mb-3">
                Late Payments ({data.latePayments.length})
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b">
                      <th className="px-3 py-2 text-left font-medium">
                        Creditor
                      </th>
                      <th className="px-3 py-2 text-left font-medium">Date</th>
                      <th className="px-3 py-2 text-right font-medium">
                        Days Late
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.latePayments.map((late, i) => (
                      <tr key={i} className="border-b">
                        <td className="px-3 py-2">{late.creditor}</td>
                        <td className="px-3 py-2">{late.date}</td>
                        <td className="px-3 py-2 text-right font-semibold">
                          {late.daysLate}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Bankruptcies */}
          {data.bankruptcies && data.bankruptcies.length > 0 && (
            <div className="rounded-lg border border-red-300 bg-red-100/50 p-4">
              <h4 className="text-sm font-semibold text-red-900 mb-3">
                Bankruptcies ({data.bankruptcies.length})
              </h4>
              <div className="space-y-3">
                {data.bankruptcies.map((bankruptcy, i) => (
                  <div key={i} className="border-l-4 border-red-500 pl-3">
                    <p className="font-semibold text-sm text-red-900">
                      {bankruptcy.type} • {bankruptcy.date}
                    </p>
                    <p className="text-xs text-red-700 mt-1">
                      {bankruptcy.details}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inquiries */}
          {data.inquiries && data.inquiries.length > 0 && (
            <div className="rounded-lg border bg-card p-4">
              <h4 className="text-sm font-semibold text-foreground mb-3">
                Credit Inquiries ({data.inquiries.length})
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-3 py-2 text-left font-medium">Date</th>
                      <th className="px-3 py-2 text-left font-medium">
                        Creditor
                      </th>
                      <th className="px-3 py-2 text-left font-medium">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.inquiries.map((inquiry, i) => (
                      <tr key={i} className="border-b">
                        <td className="px-3 py-2">{inquiry.date}</td>
                        <td className="px-3 py-2">{inquiry.creditor}</td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              inquiry.type === "Hard"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {inquiry.type}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Public Records */}
          {data.publicRecords && data.publicRecords.length > 0 && (
            <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
              <h4 className="text-sm font-semibold text-purple-900 mb-3">
                Public Records ({data.publicRecords.length})
              </h4>
              <div className="space-y-3">
                {data.publicRecords.map((record, i) => (
                  <div key={i} className="border-l-4 border-purple-500 pl-3">
                    <p className="font-semibold text-sm text-purple-900">
                      {record.type} • {record.date}
                    </p>
                    <p className="text-xs text-purple-700 mt-1">
                      {record.details}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment History */}
          {data.paymentHistory && data.paymentHistory.length > 0 && (
            <div className="rounded-lg border bg-card overflow-hidden">
              <div className="flex items-center justify-between border-b px-5 py-3">
                <h4 className="text-sm font-semibold text-foreground">
                  Payment History
                </h4>
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  {data.paymentHistory.length} entries
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-2.5 text-left font-medium">
                        Date
                      </th>
                      <th className="px-4 py-2.5 text-left font-medium">
                        Account
                      </th>
                      <th className="px-4 py-2.5 text-left font-medium">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.paymentHistory.slice(0, 50).map((payment, i) => (
                      <tr key={i} className="border-b">
                        <td className="px-4 py-2.5">{payment.date}</td>
                        <td className="px-4 py-2.5">{payment.account}</td>
                        <td className="px-4 py-2.5">
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${statusBadge(payment.status)}`}
                          >
                            {payment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {data.paymentHistory.length > 50 && (
                <div className="px-4 py-2 text-xs text-muted-foreground bg-muted/30 text-center">
                  Showing 50 of {data.paymentHistory.length} entries
                </div>
              )}
            </div>
          )}

          {/* Summary Notes */}
          {data.summaryNotes && (
            <div className="rounded-lg border bg-card p-4">
              <h4 className="text-sm font-semibold text-foreground mb-2">
                Summary
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {data.summaryNotes}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
