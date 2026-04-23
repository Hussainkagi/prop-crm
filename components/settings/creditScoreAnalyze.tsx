"use client";

import { useState, useEffect } from "react";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PersonalDetails {
  id: number;
  transaction_number: number;
  customer_id: string;
  cb_subject_id: string;
  title: string;
  last_name: string;
  first_name: string;
  full_name: string;
  gender: string;
  self_provided: string;
  date_of_birth: string;
  resident: string;
  nationality: string;
  credit_score: number;
  rating: string;
  created_date: string;
  created_at: string;
}

interface AECBTransaction {
  aecbPersonalDetails: PersonalDetails[];
  aecbAddressDetails: Array<{
    id: number;
    transaction_number: number;
    address_type: string;
    address: string;
    emirate: string;
    p_o_box: number;
    plot_no: number;
    provider: string;
    active: string;
    created_at: string;
  }>;
  aecbContactDetails: Array<{
    id: number;
    transaction_number: number;
    contact_details: string;
    contact_type: string;
    contact: number;
    provider: string;
    active: string;
    created_at: string;
  }>;
  aecbPerIdentDetails: Array<{
    id: number;
    transaction_number: number;
    table_sequence_id: number;
    type: string;
    number: number;
    expiry_date: string;
    provider: string;
  }>;
  aecbEmploymentDetails: Array<{
    id: number;
    transaction_number: number;
    table_sequence_id: number;
    employment: string;
    employer_name: string;
    gross_annual_income: number;
    provider: string;
    active: string;
    date_of_last_update: string;
  }>;
  aecbSalaryCredits?: Array<{
    id: number;
    transaction_number: number;
    account_type: string;
    phase: string;
    iban: string;
    provider_description: string;
    start_date: string;
    closed_date: string;
    date_of_last_update: string;
  }>;
  aecbSalaryHistory: Array<{
    id: number;
    transaction_number: number;
    year: string;
    month: string;
    salary_amount: number;
  }>;
  aecbTotalCreditSummary: Array<{
    id: number;
    transaction_number: number;
    table_sequence_id: number;
    total_exposure: number;
    credit_util_on_cc_pct: number;
    oldest_active_cont_sd: string;
    newest_contract_sd: string;
    total_outstanding: number;
    total_overdue: number;
    no_of_default_contracts: number;
    total_outstanding_telecom_utility: number;
  }>;
  aecbOVCreditFacilities: Array<{
    id: number;
    transaction_number: number;
    table_sequence_id: number;
    credit_facility_type: string;
    no_of_active_contracts: number;
    account_holder_type: string;
    total_payment_amount: number;
    total_os_balance_amount: number;
    total_overdue_amount: number;
  }>;
  aecbReturnCheque: Array<{
    id: number;
    transaction_number: number;
    table_sequence_id: number;
    iban: string;
    cheque_number: number;
    amount: number;
    reason: string;
    return_date: string;
    severity: string;
    cheque_status: string;
    settlement_date: string;
    provider: string;
  }>;
  aecbCompanyLinks: Array<{
    id: number;
    transaction_number: number;
    table_sequence_id: number;
    link_type: string;
    subject: string;
    shareholder_percentage: string;
    provider: string;
  }>;
  aecbCreditTelcoApp: Array<{
    id: number;
    transaction_number: number;
    table_sequence_id: number;
    application_type: string;
    application_in_180_days: number;
    total_no_reporting: number;
  }>;
  aecbCreditFacilities: Array<{
    id: number;
    transaction_number: number;
    table_sequence_id: number;
    type_of_contract: string;
    phase: string;
    role: string;
    start_date: string;
    date_last_updated: string;
    dp_contract_no: string;
  }>;
  aecbCreditFacilitiesDetails: Array<{
    id: number;
    transaction_number: number;
    table_sequence_id: number;
    provider: string;
    outstanding_balance: number;
    total_amount: number;
    total_no_of_instalments: number;
    no_of_remaining_instalments: number;
    payments_frequency: string;
    payment_amount: number;
    start_date: string;
    closed_date: string;
    islamic_contract_flag: string;
    secured_contract_flag: string;
    funded_contract_flag: string;
    overdue_amount: number;
    worst_status: string;
    worst_status_date: string;
    security: string;
  }>;
  aecbCreditFacilitiesHistory: Array<{
    id: number;
    transaction_number: number;
    table_sequence_id: number;
    year: number;
    month: number;
    total_amount: number;
    payment_amount: number;
    outstanding_balance: number;
    status: string;
  }>;
  aecbCreditCardFacilities: Array<{
    id: number;
    transaction_number: number;
    table_sequence_id: number;
    type_of_contract: string;
    phase: string;
    role: string;
    start_date: string;
    date_last_updated: string;
    dp_contract_no: string;
  }>;
  aecbCreditCardFacilitiesDetails: Array<{
    id: number;
    transaction_number: number;
    table_sequence_id: number;
    provider: string;
    balance: number;
    credit_limit: number;
    amount_spent_till_date: number;
    overdue_amount: number;
    no_of_days_of_payment_delay: number;
    start_date: string;
    closed_date: string;
    card_used_flag: string;
    islamic_contract_flag: string;
    secured_contract_flag: string;
    funded_contract_flag: string;
    payment_due_date: string;
    statement_due_amount: number;
    actual_payment_amount: number;
    worst_status: string;
    worst_status_date: string;
    security: string;
  }>;
  aecbCreditCardFacilitiesHistory: Array<{
    id: number;
    transaction_number: number;
    table_sequence_id: number;
    year: number;
    month: number;
    utilization_rate_pct: number;
    outstanding_balance: number;
    status: string;
  }>;
  aecbTelecomFacilities: Array<{
    id: number;
    transaction_number: number;
    table_sequence_id: number;
    type_of_contract: string;
    phase: string;
    role: string;
    start_date: string;
    date_last_updated: string;
    dp_contract_no: string;
  }>;
  aecbTelecomFacilitiesDetails: Array<{
    id: number;
    transaction_number: number;
    table_sequence_id: number;
    provider: string;
    communication_type: string;
    no_of_mobile_services: number;
    no_of_fixed_line_services: number;
    no_of_other_services: number;
    start_date: string;
    closed_date: string;
    holder_is_not_liable_flag: string;
    funded_contract_flag: string;
    worst_status: string;
    worst_status_date: string;
  }>;
  aecbTelecomFacilitiesHistory: Array<{
    id: number;
    transaction_number: number;
    table_sequence_id: number;
    year: number;
    month: number;
    billed: number;
    outstanding_balance: number;
    overdue: number;
    status: string;
  }>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n: number | undefined | null) =>
  (n ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

const fmtDate = (d: string | undefined | null) => {
  if (!d) return "—";
  try {
    const date = new Date(d);
    if (date.getFullYear() > 2090) return "—";
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return d;
  }
};

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Score rating → Tailwind-compatible color tokens
const SCORE_CONFIG = {
  Excellent: {
    colorClass: "text-emerald-600",
    bgClass: "bg-emerald-50 border-emerald-200",
    dotClass: "bg-emerald-500",
    range: "750–850",
  },
  Good: {
    colorClass: "text-lime-600",
    bgClass: "bg-lime-50 border-lime-200",
    dotClass: "bg-lime-500",
    range: "700–749",
  },
  Fair: {
    colorClass: "text-amber-600",
    bgClass: "bg-amber-50 border-amber-200",
    dotClass: "bg-amber-500",
    range: "650–699",
  },
  Poor: {
    colorClass: "text-orange-600",
    bgClass: "bg-orange-50 border-orange-200",
    dotClass: "bg-orange-500",
    range: "600–649",
  },
  "Very Poor": {
    colorClass: "text-red-600",
    bgClass: "bg-red-50 border-red-200",
    dotClass: "bg-red-500",
    range: "300–599",
  },
};

// Raw hex for SVG arc (can't use Tailwind inside SVG attributes)
const SCORE_HEX: Record<string, string> = {
  Excellent: "#10b981",
  Good: "#84cc16",
  Fair: "#f59e0b",
  Poor: "#f97316",
  "Very Poor": "#ef4444",
};

const getScoreConf = (rating: string) =>
  SCORE_CONFIG[rating as keyof typeof SCORE_CONFIG] ?? {
    colorClass: "text-muted-foreground",
    bgClass: "bg-muted border-border",
    dotClass: "bg-muted-foreground",
    range: "—",
  };

const getScoreHex = (rating: string) => SCORE_HEX[rating] ?? "#94a3b8";

const scoreArc = (score: number) => {
  const pct = (Math.min(Math.max(score, 300), 850) - 300) / 550;
  const r = 52;
  const circ = Math.PI * r;
  return { circ, offset: circ * (1 - pct) };
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({
  title,
  count,
  icon,
}: {
  title: string;
  count?: number;
  icon: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-base">{icon}</span>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </p>
      {count !== undefined && (
        <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
          {count} record{count !== 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
}

function DataRow({
  label,
  value,
  mono = false,
  accent,
}: {
  label: string;
  value: string | number | React.ReactNode;
  mono?: boolean;
  accent?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5 border-b border-border last:border-0">
      <span className="text-[11px] text-muted-foreground shrink-0">
        {label}
      </span>
      <span
        className={`text-[12px] font-medium text-right ${mono ? "font-mono" : ""} ${accent ?? "text-foreground"}`}
      >
        {value}
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Open: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Closed: "bg-muted text-muted-foreground border-border",
    "Active Payments": "bg-emerald-100 text-emerald-700 border-emerald-200",
    Current: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Suspended: "bg-orange-100 text-orange-700 border-orange-200",
    Default: "bg-red-100 text-red-700 border-red-200",
    Y: "bg-emerald-100 text-emerald-700 border-emerald-200",
    N: "bg-muted text-muted-foreground border-border",
  };
  const cls = map[status] ?? "bg-muted text-muted-foreground border-border";
  return (
    <span
      className={`inline-flex items-center border rounded-sm px-1.5 py-0.5 text-[10px] font-semibold tracking-wide ${cls}`}
    >
      {status}
    </span>
  );
}

function PhaseTag({ phase }: { phase: string }) {
  const open = phase?.toLowerCase() === "open";
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase ${open ? "text-emerald-600" : "text-muted-foreground"}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${open ? "bg-emerald-500" : "bg-muted-foreground"}`}
      />
      {phase}
    </span>
  );
}

function MiniBarChart({
  data,
  colorClass,
}: {
  data: number[];
  colorClass: string;
}) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-0.5 h-8">
      {data.map((v, i) => (
        <div
          key={i}
          className={`flex-1 rounded-sm min-w-0 transition-all ${colorClass}`}
          style={{
            height: `${Math.max(2, (v / max) * 32)}px`,
            opacity: 0.5 + (i / data.length) * 0.5,
          }}
        />
      ))}
    </div>
  );
}

function SalarySpark({
  history,
}: {
  history: Array<{ year: string; month: string; salary_amount: number }>;
}) {
  const sorted = [...history].sort(
    (a, b) =>
      Number(a.year) * 12 +
      Number(a.month) -
      (Number(b.year) * 12 + Number(b.month)),
  );
  const amounts = sorted.map((h) => h.salary_amount);
  const max = Math.max(...amounts, 1);
  return (
    <div className="space-y-2">
      <div className="flex items-end gap-0.5 h-10">
        {amounts.map((v, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm min-w-0 bg-emerald-500"
            style={{
              height: `${Math.max(3, (v / max) * 40)}px`,
              opacity: 0.4 + (i / amounts.length) * 0.6,
            }}
            title={`${MONTHS[Number(sorted[i].month) - 1]} ${sorted[i].year}: ${fmt(v)}`}
          />
        ))}
      </div>
      <div className="flex justify-between text-[9px] text-muted-foreground">
        <span>
          {sorted[0]
            ? `${MONTHS[Number(sorted[0].month) - 1]} ${sorted[0].year}`
            : ""}
        </span>
        <span>
          {sorted[sorted.length - 1]
            ? `${MONTHS[Number(sorted[sorted.length - 1].month) - 1]} ${sorted[sorted.length - 1].year}`
            : ""}
        </span>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CreditScoreAnalyzer() {
  const [transactions, setTransactions] = useState<PersonalDetails[]>([]);
  const [txLoading, setTxLoading] = useState(true);
  const [selectedTxn, setSelectedTxn] = useState<number | null>(null);
  const [report, setReport] = useState<AECBTransaction | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetch_ = async () => {
      setTxLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/aecb/personal-details`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data))
          setTransactions(json.data);
      } catch {
        /* silently fail */
      }
      setTxLoading(false);
    };
    fetch_();
  }, []);

  const loadReport = async (txn: number) => {
    setReportLoading(true);
    setReport(null);
    setActiveTab("overview");
    try {
      const res = await fetch(`${BASE_URL}/aecb-data/transaction/${txn}`);
      const json = await res.json();
      const data = json.results ?? json.data ?? json;
      setReport(data);
    } catch {
      /* fail */
    }
    setReportLoading(false);
  };

  const handleSelect = (txn: number) => {
    setSelectedTxn(txn);
    loadReport(txn);
  };

  const personal = report?.aecbPersonalDetails?.[0];
  const summary = report?.aecbTotalCreditSummary?.[0];
  const scoreConf = personal ? getScoreConf(personal.rating) : null;
  const scoreHex = personal ? getScoreHex(personal.rating) : "#94a3b8";
  const arc = personal ? scoreArc(personal.credit_score) : null;

  const TABS = [
    { id: "overview", label: "Overview" },
    { id: "facilities", label: "Credit Facilities" },
    { id: "cards", label: "Credit Cards" },
    { id: "telecom", label: "Telecom" },
    { id: "employment", label: "Employment" },
    { id: "identity", label: "Identity" },
    { id: "alerts", label: "Alerts" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <style>{`
        .report-scroll::-webkit-scrollbar { width: 4px; height: 4px; }
        .report-scroll::-webkit-scrollbar-track { background: transparent; }
        .report-scroll::-webkit-scrollbar-thumb { background: hsl(var(--border)); border-radius: 2px; }
        .fade-in { animation: fadeIn 0.25s ease forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* ── Top bar ── */}
      <div className="sticky top-0 z-20 border-b border-border bg-background px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md flex items-center justify-center bg-blue-600">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              AECB Credit Bureau
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Report Analyzer
            </p>
          </div>
        </div>

        {/* Transaction selector */}
        <div className="flex items-center gap-3">
          {txLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <svg
                className="w-3.5 h-3.5 animate-spin"
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
              Loading…
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Subject
              </span>
              <select
                value={selectedTxn ?? ""}
                onChange={(e) =>
                  e.target.value && handleSelect(Number(e.target.value))
                }
                className="rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:ring-2 focus:ring-blue-500 min-w-[260px]"
              >
                <option value="">— Select transaction number —</option>
                {transactions.map((t) => (
                  <option
                    key={t.transaction_number}
                    value={t.transaction_number}
                  >
                    #{t.transaction_number} · {t.full_name} · Score{" "}
                    {t.credit_score} ({t.rating})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ── Empty state ── */}
      {!selectedTxn && (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-muted border border-border">
            <svg
              className="w-8 h-8 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="text-sm font-semibold text-muted-foreground">
            Select a transaction to view the credit report
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {transactions.length} subject{transactions.length !== 1 ? "s" : ""}{" "}
            available
          </p>
        </div>
      )}

      {/* ── Loading ── */}
      {reportLoading && (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
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
          <p className="text-xs text-muted-foreground">
            Loading credit report…
          </p>
        </div>
      )}

      {/* ── Report ── */}
      {report && personal && !reportLoading && (
        <div className="fade-in px-5 py-5 space-y-5">
          {/* ── Hero row ── */}
          <div className="grid grid-cols-12 gap-4">
            {/* Subject card */}
            <div className="col-span-12 md:col-span-5 rounded-lg border border-border bg-card p-5">
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold border ${scoreConf?.bgClass} ${scoreConf?.colorClass}`}
                >
                  {personal.first_name?.[0]}
                  {personal.last_name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-foreground leading-tight">
                    {personal.full_name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {personal.title && (
                      <span className="mr-2">{personal.title}</span>
                    )}
                    DOB: {fmtDate(personal.date_of_birth)} ·{" "}
                    {personal.nationality} ·{" "}
                    {personal.gender === "F" ? "Female" : "Male"}
                  </p>
                  <p className="text-[10px] font-mono text-muted-foreground mt-1">
                    CB Subject: {personal.cb_subject_id} · Txn: #
                    {personal.transaction_number}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                {report.aecbAddressDetails?.[0] && (
                  <div className="rounded-md border border-border bg-muted/40 p-2.5">
                    <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                      Address
                    </p>
                    <p className="text-xs text-foreground">
                      {report.aecbAddressDetails[0].emirate}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      PO Box {report.aecbAddressDetails[0].p_o_box}
                    </p>
                  </div>
                )}
                {report.aecbContactDetails?.[0] && (
                  <div className="rounded-md border border-border bg-muted/40 p-2.5">
                    <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                      Contact
                    </p>
                    <p className="text-xs text-foreground break-all">
                      {report.aecbContactDetails[0].contact_details}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {report.aecbContactDetails[0].contact_type}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Score gauge */}
            <div className="col-span-12 md:col-span-3 rounded-lg border border-border bg-card p-5 flex flex-col items-center justify-center">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                Credit Score
              </p>
              {arc && (
                <svg width={140} height={85} viewBox="0 0 140 90">
                  {/* Track */}
                  <path
                    d="M15,80 A55,55 0 0,1 125,80"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth={10}
                    strokeLinecap="round"
                  />
                  {/* Score arc */}
                  <path
                    d="M15,80 A55,55 0 0,1 125,80"
                    fill="none"
                    stroke={scoreHex}
                    strokeWidth={10}
                    strokeLinecap="round"
                    strokeDasharray={`${arc.circ} ${arc.circ}`}
                    strokeDashoffset={arc.offset}
                    style={{ transition: "stroke-dashoffset 1s ease" }}
                  />
                  <text
                    x="70"
                    y="72"
                    textAnchor="middle"
                    fill={scoreHex}
                    fontSize="26"
                    fontWeight="700"
                    fontFamily="monospace"
                  >
                    {personal.credit_score}
                  </text>
                </svg>
              )}
              <div className="text-center mt-1">
                <p className={`text-base font-bold ${scoreConf?.colorClass}`}>
                  {personal.rating}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Range {scoreConf?.range}
                </p>
              </div>
            </div>

            {/* Quick stats */}
            <div className="col-span-12 md:col-span-4 rounded-lg border border-border bg-card p-5 space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Exposure Summary
              </p>
              {summary && (
                <>
                  <div>
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-[10px] text-muted-foreground">
                        Total Exposure
                      </span>
                      <span className="text-sm font-bold text-foreground tabular-nums">
                        AED {fmt(summary.total_exposure)}
                      </span>
                    </div>
                    <div className="h-1 rounded-full bg-muted">
                      <div
                        className="h-1 rounded-full bg-blue-500"
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-[10px] text-muted-foreground">
                        Total Outstanding
                      </span>
                      <span className="text-sm font-bold text-amber-600 tabular-nums">
                        AED {fmt(summary.total_outstanding)}
                      </span>
                    </div>
                    <div className="h-1 rounded-full bg-muted">
                      <div
                        className="h-1 rounded-full bg-amber-400"
                        style={{
                          width: `${summary.total_exposure ? Math.min(100, (summary.total_outstanding / summary.total_exposure) * 100) : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-[10px] text-muted-foreground">
                        Total Overdue
                      </span>
                      <span
                        className={`text-sm font-bold tabular-nums ${summary.total_overdue > 0 ? "text-red-600" : "text-emerald-600"}`}
                      >
                        AED {fmt(summary.total_overdue)}
                      </span>
                    </div>
                    <div className="h-1 rounded-full bg-muted">
                      <div
                        className="h-1 rounded-full bg-red-400"
                        style={{
                          width: `${summary.total_outstanding ? Math.min(100, (summary.total_overdue / summary.total_outstanding) * 100) : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="rounded-md border border-border bg-muted/40 p-2 text-center">
                      <p className="text-base font-bold text-blue-600 tabular-nums">
                        {summary.credit_util_on_cc_pct}%
                      </p>
                      <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground mt-1">
                        CC Utilization
                      </p>
                    </div>
                    <div className="rounded-md border border-border bg-muted/40 p-2 text-center">
                      <p
                        className={`text-base font-bold tabular-nums ${summary.no_of_default_contracts > 0 ? "text-red-600" : "text-emerald-600"}`}
                      >
                        {summary.no_of_default_contracts}
                      </p>
                      <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground mt-1">
                        Defaults
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-center">
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
                        Oldest Contract
                      </p>
                      <p className="text-xs text-foreground mt-0.5">
                        {fmtDate(summary.oldest_active_cont_sd)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
                        Newest Contract
                      </p>
                      <p className="text-xs text-foreground mt-0.5">
                        {fmtDate(summary.newest_contract_sd)}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── OV Facilities row ── */}
          {report.aecbOVCreditFacilities?.length > 0 && (
            <div
              className="grid gap-3"
              style={{
                gridTemplateColumns: `repeat(${report.aecbOVCreditFacilities.length}, 1fr)`,
              }}
            >
              {report.aecbOVCreditFacilities.map((fac, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-border bg-card p-4"
                >
                  <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                    {fac.credit_facility_type}
                  </p>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xl font-bold text-foreground tabular-nums">
                        {fac.no_of_active_contracts}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        active contracts
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-amber-600 tabular-nums">
                        {fmt(fac.total_os_balance_amount)}
                      </p>
                      <p className="text-[9px] text-muted-foreground">
                        outstanding
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[9px] text-muted-foreground">
                      holder type
                    </span>
                    <span className="text-[10px] text-foreground">
                      {fac.account_holder_type}
                    </span>
                  </div>
                  {fac.total_overdue_amount > 0 && (
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-[9px] text-red-600 font-semibold">
                        Overdue
                      </span>
                      <span className="text-[10px] text-red-600 font-semibold tabular-nums">
                        {fmt(fac.total_overdue_amount)}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── Tabs ── */}
          <div className="flex gap-1 rounded-lg border border-border bg-muted/30 p-1 overflow-x-auto report-scroll">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors
                  ${
                    activeTab === tab.id
                      ? "bg-background text-foreground shadow-sm border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {tab.label}
                {tab.id === "alerts" && report.aecbReturnCheque?.length > 0 && (
                  <span className="rounded-full bg-red-500 text-white px-1.5 py-0.5 text-[9px] font-semibold">
                    {report.aecbReturnCheque.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── Tab: Overview ── */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-12 gap-4 fade-in">
              {report.aecbSalaryHistory?.length > 0 && (
                <div className="col-span-12 md:col-span-6 rounded-lg border border-border bg-card p-5">
                  <SectionHeader
                    title="Salary History"
                    count={report.aecbSalaryHistory.length}
                    icon="💰"
                  />
                  <SalarySpark history={report.aecbSalaryHistory} />
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {[...report.aecbSalaryHistory]
                      .slice(-3)
                      .reverse()
                      .map((h, i) => (
                        <div
                          key={i}
                          className="rounded-md border border-border bg-muted/40 p-2 text-center"
                        >
                          <p className="text-xs font-bold text-emerald-600 tabular-nums">
                            {fmt(h.salary_amount)}
                          </p>
                          <p className="text-[9px] text-muted-foreground mt-1">
                            {MONTHS[Number(h.month) - 1]} {h.year}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {report.aecbEmploymentDetails?.length > 0 && (
                <div className="col-span-12 md:col-span-6 rounded-lg border border-border bg-card p-5">
                  <SectionHeader
                    title="Employment"
                    count={report.aecbEmploymentDetails.length}
                    icon="💼"
                  />
                  <div className="space-y-3">
                    {report.aecbEmploymentDetails.map((emp, i) => (
                      <div
                        key={i}
                        className="rounded-md border border-border bg-muted/40 p-3"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <p className="text-xs font-semibold text-foreground">
                              {emp.employer_name}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {emp.employment}
                            </p>
                          </div>
                          <StatusBadge status={emp.active} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground">
                            Annual Income
                          </span>
                          <span className="text-xs font-bold text-emerald-600 tabular-nums">
                            AED {fmt(emp.gross_annual_income)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] text-muted-foreground">
                            Provider · Updated
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {emp.provider} · {fmtDate(emp.date_of_last_update)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {report.aecbCreditTelcoApp?.length > 0 && (
                <div className="col-span-12 md:col-span-6 rounded-lg border border-border bg-card p-5">
                  <SectionHeader
                    title="Applications (180 days)"
                    count={report.aecbCreditTelcoApp.length}
                    icon="📋"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    {report.aecbCreditTelcoApp.map((app, i) => (
                      <div
                        key={i}
                        className="rounded-md border border-border bg-muted/40 p-3 text-center"
                      >
                        <p
                          className={`text-2xl font-bold tabular-nums ${app.application_in_180_days > 0 ? "text-amber-600" : "text-emerald-600"}`}
                        >
                          {app.application_in_180_days}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {app.application_type} applications
                        </p>
                        <p className="text-[9px] text-muted-foreground">
                          {app.total_no_reporting} total reporting
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {report.aecbCompanyLinks?.length > 0 && (
                <div className="col-span-12 md:col-span-6 rounded-lg border border-border bg-card p-5">
                  <SectionHeader
                    title="Company Links"
                    count={report.aecbCompanyLinks.length}
                    icon="🏢"
                  />
                  <div className="space-y-2">
                    {report.aecbCompanyLinks.map((cl, i) => (
                      <div
                        key={i}
                        className="rounded-md border border-border bg-muted/40 p-3 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs font-semibold text-foreground">
                            {cl.subject}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {cl.link_type} · {cl.provider}
                          </p>
                        </div>
                        <span className="text-sm font-bold text-blue-600 tabular-nums">
                          {cl.shareholder_percentage}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Tab: Credit Facilities ── */}
          {activeTab === "facilities" && (
            <div className="space-y-4 fade-in">
              {report.aecbCreditFacilities?.length > 0 ? (
                report.aecbCreditFacilities.map((fac) => {
                  const det = report.aecbCreditFacilitiesDetails?.find(
                    (d) => d.table_sequence_id === fac.table_sequence_id,
                  );
                  const hist =
                    report.aecbCreditFacilitiesHistory?.filter(
                      (h) => h.table_sequence_id === fac.table_sequence_id,
                    ) ?? [];
                  const histSorted = [...hist].sort(
                    (a, b) => a.year * 12 + a.month - (b.year * 12 + b.month),
                  );
                  const balances = histSorted.map((h) => h.outstanding_balance);

                  return (
                    <div
                      key={fac.id}
                      className="rounded-lg border border-border bg-card p-5"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base bg-blue-50 border border-blue-100">
                            {fac.type_of_contract === "Mortgage"
                              ? "🏠"
                              : fac.type_of_contract === "Personal Loan"
                                ? "💳"
                                : "🏦"}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {fac.type_of_contract}
                            </p>
                            <p className="text-[10px] font-mono text-muted-foreground">
                              {fac.dp_contract_no}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <PhaseTag phase={fac.phase} />
                          <span className="text-[10px] text-muted-foreground">
                            {fac.role}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        {det &&
                          [
                            {
                              label: "Total Amount",
                              value: `AED ${fmt(det.total_amount)}`,
                              colorClass: "text-foreground",
                            },
                            {
                              label: "Outstanding",
                              value: `AED ${fmt(det.outstanding_balance)}`,
                              colorClass: "text-amber-600",
                            },
                            {
                              label: "Monthly Payment",
                              value: `AED ${fmt(det.payment_amount)}`,
                              colorClass: "text-blue-600",
                            },
                            {
                              label: "Overdue",
                              value: `AED ${fmt(det.overdue_amount)}`,
                              colorClass:
                                det.overdue_amount > 0
                                  ? "text-red-600"
                                  : "text-emerald-600",
                            },
                          ].map((item, i) => (
                            <div
                              key={i}
                              className="rounded-md border border-border bg-muted/40 p-3"
                            >
                              <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
                                {item.label}
                              </p>
                              <p
                                className={`text-sm font-bold tabular-nums mt-1 ${item.colorClass}`}
                              >
                                {item.value}
                              </p>
                            </div>
                          ))}
                      </div>

                      {det && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                          <DataRow
                            label="Instalments"
                            value={`${det.no_of_remaining_instalments} / ${det.total_no_of_instalments} remaining`}
                            mono
                          />
                          <DataRow
                            label="Frequency"
                            value={det.payments_frequency}
                          />
                          <DataRow label="Security" value={det.security} />
                          <DataRow
                            label="Start Date"
                            value={fmtDate(det.start_date)}
                          />
                          <DataRow
                            label="Close Date"
                            value={fmtDate(det.closed_date)}
                          />
                          <DataRow
                            label="Worst Status"
                            value={det.worst_status}
                            accent={
                              det.worst_status === "Current"
                                ? "text-emerald-600"
                                : "text-orange-600"
                            }
                          />
                          <DataRow
                            label="Islamic"
                            value={
                              <StatusBadge status={det.islamic_contract_flag} />
                            }
                          />
                          <DataRow
                            label="Secured"
                            value={
                              <StatusBadge status={det.secured_contract_flag} />
                            }
                          />
                          <DataRow label="Provider" value={det.provider} />
                        </div>
                      )}

                      {balances.length > 0 && (
                        <div>
                          <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                            Balance Trend · {hist.length} months
                          </p>
                          <MiniBarChart
                            data={balances}
                            colorClass="bg-blue-400"
                          />
                          <div className="flex justify-between mt-1">
                            <span className="text-[9px] text-muted-foreground">
                              {MONTHS[(histSorted[0]?.month ?? 1) - 1]}{" "}
                              {histSorted[0]?.year}
                            </span>
                            <span className="text-[9px] text-muted-foreground">
                              {
                                MONTHS[
                                  (histSorted[histSorted.length - 1]?.month ??
                                    1) - 1
                                ]
                              }{" "}
                              {histSorted[histSorted.length - 1]?.year}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-muted-foreground text-sm text-center py-10">
                  No credit facilities found
                </p>
              )}
            </div>
          )}

          {/* ── Tab: Credit Cards ── */}
          {activeTab === "cards" && (
            <div className="space-y-4 fade-in">
              {report.aecbCreditCardFacilities?.length > 0 ? (
                report.aecbCreditCardFacilities.map((card) => {
                  const det = report.aecbCreditCardFacilitiesDetails?.find(
                    (d) => d.table_sequence_id === card.table_sequence_id,
                  );
                  const hist =
                    report.aecbCreditCardFacilitiesHistory?.filter(
                      (h) => h.table_sequence_id === card.table_sequence_id,
                    ) ?? [];
                  const histSorted = [...hist].sort(
                    (a, b) => a.year * 12 + a.month - (b.year * 12 + b.month),
                  );
                  const utilizations = histSorted.map(
                    (h) => h.utilization_rate_pct,
                  );
                  const avgUtil = utilizations.length
                    ? Math.round(
                        utilizations.reduce((a, b) => a + b, 0) /
                          utilizations.length,
                      )
                    : 0;

                  return (
                    <div
                      key={card.id}
                      className="rounded-lg border border-border bg-card p-5"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base bg-violet-50 border border-violet-100">
                            💳
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {det?.provider ?? card.type_of_contract}
                            </p>
                            <p className="text-[10px] font-mono text-muted-foreground">
                              {card.dp_contract_no}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <PhaseTag phase={card.phase} />
                          <span className="text-[10px] text-muted-foreground">
                            {card.role}
                          </span>
                        </div>
                      </div>

                      {det && (
                        <>
                          <div className="mb-3">
                            <div className="flex justify-between items-baseline mb-1.5">
                              <span className="text-[10px] text-muted-foreground">
                                Balance vs. Limit
                              </span>
                              <span className="text-xs text-foreground tabular-nums">
                                AED {fmt(det.balance)} / {fmt(det.credit_limit)}
                              </span>
                            </div>
                            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${det.credit_limit && det.balance / det.credit_limit > 0.7 ? "bg-orange-400" : "bg-blue-500"}`}
                                style={{
                                  width: `${det.credit_limit ? Math.min(100, (det.balance / det.credit_limit) * 100) : 0}%`,
                                }}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 mb-4">
                            {[
                              {
                                label: "Avg Utilization",
                                value: `${avgUtil}%`,
                                colorClass:
                                  avgUtil > 70
                                    ? "text-orange-600"
                                    : avgUtil > 40
                                      ? "text-amber-600"
                                      : "text-emerald-600",
                              },
                              {
                                label: "Statement Due",
                                value: `AED ${fmt(det.statement_due_amount)}`,
                                colorClass: "text-foreground",
                              },
                              {
                                label: "Overdue",
                                value: `AED ${fmt(det.overdue_amount)}`,
                                colorClass:
                                  det.overdue_amount > 0
                                    ? "text-red-600"
                                    : "text-emerald-600",
                              },
                            ].map((item, i) => (
                              <div
                                key={i}
                                className="rounded-md border border-border bg-muted/40 p-2.5 text-center"
                              >
                                <p
                                  className={`text-sm font-bold tabular-nums ${item.colorClass}`}
                                >
                                  {item.value}
                                </p>
                                <p className="text-[9px] text-muted-foreground mt-1">
                                  {item.label}
                                </p>
                              </div>
                            ))}
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <DataRow
                              label="Start Date"
                              value={fmtDate(det.start_date)}
                            />
                            <DataRow
                              label="Close Date"
                              value={fmtDate(det.closed_date)}
                            />
                            <DataRow
                              label="Payment Due"
                              value={det.payment_due_date}
                            />
                            <DataRow
                              label="Actual Payment"
                              value={`AED ${fmt(det.actual_payment_amount)}`}
                              mono
                            />
                            <DataRow
                              label="Days Delay"
                              value={det.no_of_days_of_payment_delay}
                              accent={
                                det.no_of_days_of_payment_delay > 0
                                  ? "text-orange-600"
                                  : "text-emerald-600"
                              }
                            />
                            <DataRow
                              label="Worst Status"
                              value={det.worst_status}
                              accent={
                                det.worst_status === "Current"
                                  ? "text-emerald-600"
                                  : "text-orange-600"
                              }
                            />
                            <DataRow
                              label="Card Used"
                              value={
                                <StatusBadge status={det.card_used_flag} />
                              }
                            />
                            <DataRow label="Security" value={det.security} />
                          </div>
                        </>
                      )}

                      {utilizations.length > 0 && (
                        <div className="mt-4">
                          <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                            Utilization Trend · {hist.length} months
                          </p>
                          <MiniBarChart
                            data={utilizations}
                            colorClass={
                              avgUtil > 70 ? "bg-orange-400" : "bg-violet-400"
                            }
                          />
                          <div className="flex justify-between mt-1">
                            <span className="text-[9px] text-muted-foreground">
                              {MONTHS[(histSorted[0]?.month ?? 1) - 1]}{" "}
                              {histSorted[0]?.year}
                            </span>
                            <span className="text-[9px] text-muted-foreground">
                              {
                                MONTHS[
                                  (histSorted[histSorted.length - 1]?.month ??
                                    1) - 1
                                ]
                              }{" "}
                              {histSorted[histSorted.length - 1]?.year}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-muted-foreground text-sm text-center py-10">
                  No credit card facilities found
                </p>
              )}
            </div>
          )}

          {/* ── Tab: Telecom ── */}
          {activeTab === "telecom" && (
            <div className="space-y-4 fade-in">
              {report.aecbTelecomFacilities?.length > 0 ? (
                report.aecbTelecomFacilities.map((tel) => {
                  const det = report.aecbTelecomFacilitiesDetails?.find(
                    (d) => d.table_sequence_id === tel.table_sequence_id,
                  );
                  const hist =
                    report.aecbTelecomFacilitiesHistory?.filter(
                      (h) => h.table_sequence_id === tel.table_sequence_id,
                    ) ?? [];
                  const histSorted = [...hist].sort(
                    (a, b) => a.year * 12 + a.month - (b.year * 12 + b.month),
                  );

                  return (
                    <div
                      key={tel.id}
                      className="rounded-lg border border-border bg-card p-5"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base bg-sky-50 border border-sky-100">
                            📱
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {tel.type_of_contract}
                            </p>
                            <p className="text-[10px] font-mono text-muted-foreground">
                              {tel.dp_contract_no}
                            </p>
                          </div>
                        </div>
                        <PhaseTag phase={tel.phase} />
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <DataRow
                          label="Start Date"
                          value={fmtDate(tel.start_date)}
                        />
                        <DataRow
                          label="Last Updated"
                          value={fmtDate(tel.date_last_updated)}
                        />
                        <DataRow label="Role" value={tel.role} />
                        {det && (
                          <DataRow label="Provider" value={det.provider} />
                        )}
                      </div>

                      {histSorted.length > 0 && (
                        <div>
                          <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                            Billing History · {hist.length} months
                          </p>
                          <div className="overflow-x-auto report-scroll rounded-lg border border-border">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="border-b border-border bg-muted/50">
                                  {[
                                    "Period",
                                    "Billed",
                                    "Outstanding",
                                    "Overdue",
                                    "Status",
                                  ].map((h) => (
                                    <th
                                      key={h}
                                      className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
                                    >
                                      {h}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border">
                                {[...histSorted]
                                  .reverse()
                                  .slice(0, 24)
                                  .map((row, i) => (
                                    <tr
                                      key={i}
                                      className="hover:bg-accent/40 transition-colors"
                                    >
                                      <td className="px-4 py-2.5 font-mono text-muted-foreground">
                                        {MONTHS[row.month - 1]} {row.year}
                                      </td>
                                      <td className="px-4 py-2.5 text-foreground tabular-nums">
                                        {fmt(row.billed)}
                                      </td>
                                      <td className="px-4 py-2.5 text-amber-600 tabular-nums">
                                        {fmt(row.outstanding_balance)}
                                      </td>
                                      <td
                                        className={`px-4 py-2.5 tabular-nums ${row.overdue > 0 ? "text-red-600" : "text-emerald-600"}`}
                                      >
                                        {fmt(row.overdue)}
                                      </td>
                                      <td className="px-4 py-2.5">
                                        <StatusBadge status={row.status} />
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-muted-foreground text-sm text-center py-10">
                  No telecom facilities found
                </p>
              )}
            </div>
          )}

          {/* ── Tab: Employment ── */}
          {activeTab === "employment" && (
            <div className="fade-in">
              <div className="rounded-lg border border-border bg-card p-5">
                <SectionHeader
                  title="Employment History"
                  count={report.aecbEmploymentDetails?.length}
                  icon="💼"
                />
                <div className="space-y-3">
                  {(report.aecbEmploymentDetails ?? []).map((emp, i) => (
                    <div
                      key={i}
                      className="rounded-md border border-border bg-muted/40 p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {emp.employer_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {emp.employment} · {emp.provider}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <StatusBadge status={emp.active} />
                          <span className="text-[9px] text-muted-foreground">
                            Updated {fmtDate(emp.date_of_last_update)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-md bg-emerald-50 border border-emerald-100">
                        <span className="text-[10px] text-muted-foreground">
                          Gross Annual Income
                        </span>
                        <span className="text-sm font-bold text-emerald-600 tabular-nums">
                          AED {fmt(emp.gross_annual_income)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {report.aecbSalaryHistory?.length > 0 && (
                  <div className="mt-5">
                    <SectionHeader
                      title="Salary Credits History"
                      count={report.aecbSalaryHistory.length}
                      icon="📅"
                    />
                    <div
                      className="grid gap-1"
                      style={{
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(80px, 1fr))",
                      }}
                    >
                      {[...report.aecbSalaryHistory]
                        .sort(
                          (a, b) =>
                            Number(b.year) * 12 +
                            Number(b.month) -
                            (Number(a.year) * 12 + Number(a.month)),
                        )
                        .map((h, i) => (
                          <div
                            key={i}
                            className="rounded-md border border-border bg-muted/40 p-2 text-center"
                          >
                            <p className="text-xs font-bold text-emerald-600 tabular-nums">
                              {fmt(h.salary_amount)}
                            </p>
                            <p className="text-[9px] text-muted-foreground mt-1">
                              {MONTHS[Number(h.month) - 1]} {h.year}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Tab: Identity ── */}
          {activeTab === "identity" && (
            <div className="fade-in">
              <div className="rounded-lg border border-border bg-card p-5 space-y-6">
                <div>
                  <SectionHeader
                    title="Identity Documents"
                    count={report.aecbPerIdentDetails?.length}
                    icon="🪪"
                  />
                  {(report.aecbPerIdentDetails ?? []).length === 0 ? (
                    <p className="text-muted-foreground text-xs">
                      No identity documents on file
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {report.aecbPerIdentDetails.map((doc, i) => (
                        <div
                          key={i}
                          className="rounded-md border border-border bg-muted/40 p-3 flex items-center justify-between"
                        >
                          <div>
                            <p className="text-xs font-semibold text-foreground">
                              {doc.type}
                            </p>
                            <p className="text-[10px] font-mono text-muted-foreground">
                              {doc.number}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-muted-foreground">
                              Expires {fmtDate(doc.expiry_date)}
                            </p>
                            <p className="text-[9px] text-muted-foreground">
                              {doc.provider}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <SectionHeader
                    title="Contact Details"
                    count={report.aecbContactDetails?.length}
                    icon="📞"
                  />
                  <div className="space-y-2">
                    {(report.aecbContactDetails ?? []).map((c, i) => (
                      <div
                        key={i}
                        className="rounded-md border border-border bg-muted/40 p-3 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs font-semibold text-foreground">
                            {c.contact_details}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {c.contact_type} · {c.provider}
                          </p>
                        </div>
                        <StatusBadge status={c.active} />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <SectionHeader
                    title="Addresses"
                    count={report.aecbAddressDetails?.length}
                    icon="🏠"
                  />
                  <div className="space-y-2">
                    {(report.aecbAddressDetails ?? []).map((a, i) => (
                      <div
                        key={i}
                        className="rounded-md border border-border bg-muted/40 p-3"
                      >
                        <div className="flex items-start justify-between mb-1">
                          <p className="text-xs font-semibold text-foreground">
                            {a.address_type}
                          </p>
                          <StatusBadge status={a.active} />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {a.address}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {a.emirate} · PO Box {a.p_o_box} · Plot {a.plot_no} ·{" "}
                          {a.provider}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Tab: Alerts ── */}
          {activeTab === "alerts" && (
            <div className="fade-in space-y-4">
              {/* Return Cheques */}
              <div className="rounded-lg border border-border bg-card p-5">
                <SectionHeader
                  title="Return Cheques"
                  count={report.aecbReturnCheque?.length}
                  icon="⚠️"
                />
                {(report.aecbReturnCheque ?? []).length === 0 ? (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                    <span className="text-emerald-600 text-base">✓</span>
                    <p className="text-xs font-medium text-emerald-700">
                      No returned cheques on record
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {report.aecbReturnCheque.map((chq, i) => {
                      const sevClass =
                        {
                          Low: "text-amber-700 bg-amber-50 border-amber-200",
                          Medium:
                            "text-orange-700 bg-orange-50 border-orange-200",
                          High: "text-red-700 bg-red-50 border-red-200",
                        }[chq.severity] ??
                        "text-muted-foreground bg-muted border-border";
                      return (
                        <div
                          key={i}
                          className="p-4 rounded-lg bg-red-50 border border-red-200"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-semibold text-foreground">
                                  Cheque #{chq.cheque_number}
                                </span>
                                <span
                                  className={`text-[10px] font-bold border rounded px-1.5 py-0.5 ${sevClass}`}
                                >
                                  {chq.severity}
                                </span>
                                <StatusBadge status={chq.cheque_status} />
                              </div>
                              <p className="text-[10px] font-mono text-muted-foreground">
                                {chq.iban}
                              </p>
                            </div>
                            <p className="text-base font-bold text-red-600 tabular-nums">
                              AED {fmt(chq.amount)}
                            </p>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <DataRow
                              label="Reason"
                              value={chq.reason}
                              accent="text-orange-600"
                            />
                            <DataRow
                              label="Return Date"
                              value={fmtDate(chq.return_date)}
                            />
                            <DataRow
                              label="Settlement"
                              value={fmtDate(chq.settlement_date)}
                            />
                          </div>
                          <div className="mt-2">
                            <DataRow label="Provider" value={chq.provider} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Risk summary */}
              {summary && (
                <div className="rounded-lg border border-border bg-card p-5">
                  <SectionHeader title="Risk Indicators" icon="🔍" />
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {
                        label: "Default Contracts",
                        value: summary.no_of_default_contracts,
                        ok: summary.no_of_default_contracts === 0,
                        note:
                          summary.no_of_default_contracts === 0
                            ? "Clean record"
                            : "Requires attention",
                      },
                      {
                        label: "Total Overdue",
                        value: `AED ${fmt(summary.total_overdue)}`,
                        ok: summary.total_overdue === 0,
                        note:
                          summary.total_overdue === 0
                            ? "No overdue"
                            : "Overdue balance present",
                      },
                      {
                        label: "Telecom Outstanding",
                        value: `AED ${fmt(summary.total_outstanding_telecom_utility)}`,
                        ok: summary.total_outstanding_telecom_utility < 500,
                        note:
                          summary.total_outstanding_telecom_utility < 500
                            ? "Low exposure"
                            : "Monitor",
                      },
                      {
                        label: "Return Cheques",
                        value: report.aecbReturnCheque?.length ?? 0,
                        ok: (report.aecbReturnCheque?.length ?? 0) === 0,
                        note:
                          (report.aecbReturnCheque?.length ?? 0) === 0
                            ? "None on record"
                            : "Cheques returned",
                      },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className={`rounded-md border p-3 ${item.ok ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
                            {item.label}
                          </span>
                          <span
                            className={`text-[9px] font-bold ${item.ok ? "text-emerald-600" : "text-red-600"}`}
                          >
                            {item.ok ? "✓ OK" : "⚠ FLAG"}
                          </span>
                        </div>
                        <p
                          className={`text-base font-bold tabular-nums ${item.ok ? "text-foreground" : "text-orange-600"}`}
                        >
                          {String(item.value)}
                        </p>
                        <p
                          className={`text-[10px] mt-0.5 ${item.ok ? "text-muted-foreground" : "text-orange-600"}`}
                        >
                          {item.note}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-border pt-4 mt-2 flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground">
              Transaction #{personal.transaction_number} · Generated{" "}
              {new Date().toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
            <p className="text-[10px] text-muted-foreground">
              AECB Credit Report Analyzer
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreditScoreAnalyzer;
