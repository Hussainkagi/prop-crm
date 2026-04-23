"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";

const CLAUDE_KEY = process.env.NEXT_PUBLIC_CLAUDE_KEY;
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AECBFullData {
  // Personal Details
  aecbPersonalDetailsModel: {
    Customer_ID: string;
    CB_Subject_Id: string;
    Title: string;
    Last_Name: string;
    First_Name: string;
    Full_Name: string;
    Gender: string;
    Self_Provided: string;
    Date_of_Birth: string;
    Resident: string;
    Nationality: string;
    Credit_Score: number;
    Rating: string;
  };

  // Contact Details (array)
  aecbContactDetailsModel: Array<{
    Contact_Details: string;
    Contact_Type: string;
    Contact: number;
    Provider: string;
    Active: string;
  }>;

  // Address Details (array)
  aecbAddressDetailsModel: Array<{
    Address_Type: string;
    Address: string;
    Emirate: string;
    P_O_Box: number;
    Plot_No: number;
    Provider: string;
    Active: string;
  }>;

  // Per-Ident Details (array)
  aecbPerIdentDetailsModel: Array<{
    Table_Sequence_ID: number;
    Type: string;
    Number: number;
    Expiry_Date: string;
    Provider: string;
  }>;

  // Employment Details (array)
  aecbEmploymentDetailsModel: Array<{
    Table_Sequence_ID: number;
    Employment: string;
    Employer_Name: string;
    Gross_Annual_Income: number;
    Provider: string;
    Active: string;
    Date_Of_Last_Update: string;
  }>;

  // Salary Credits (array)
  aecbSalaryCreditsModel: Array<{
    Account_Type: string;
    Phase: string;
    IBAN: string;
    Provider_Description: string;
    Start_Date: string;
    Closed_Date: string;
    Date_Of_Last_Update: string;
  }>;

  // Salary History (array)
  aecbSalaryHistoryModel: Array<{
    Year: string;
    Month: string;
    Salary_Amount: number;
  }>;

  // Total Credit Summary (array)
  aecbTotalCreditSummaryModel: Array<{
    Table_Sequence_ID: number;
    total_exposure: number;
    credit_util_on_CC_pct: number;
    oldest_active_cont_SD: string;
    newest_contract_SD: string;
    total_outstanding: number;
    total_overdue: number;
    no_of_default_contracts: number;
    total_outstanding_telecom_utility: number;
  }>;

  // OV Credit Facilities (array)
  aecbOVCreditFacilitiesModel: Array<{
    Table_Sequence_ID: number;
    Credit_Facility_type: string;
    no_of_active_contracts: number;
    account_holder_type: string;
    total_payment_amount: number;
    total_OS_balance_amount: number;
    total_overdue_amount: number;
  }>;

  // Return Cheque (array)
  aecbReturnChequeModel: Array<{
    Table_Sequence_ID: number;
    IBAN: string;
    Cheque_Number: number;
    Amount: number;
    Reason: string;
    Return_Date: string;
    Severity: string;
    Cheque_Status: string;
    Settlement_Date: string;
    Provider: string;
  }>;

  // Company Links (array)
  aecbCompanyLinksModel: Array<{
    Table_Sequence_ID: number;
    link_type: string;
    subject: string;
    shareholder_percentage: string;
    provider: string;
  }>;

  // Credit Telco App (array)
  aecbCreditTelcoAppModel: Array<{
    Table_Sequence_ID: number;
    Application_Type: string;
    Application_in_180_days: number;
    total_no_reporting: number;
  }>;

  // Credit Facilities (array)
  aecbCreditFacilitiesModel: Array<{
    Table_Sequence_ID: number;
    type_of_contract: string;
    phase: string;
    role: string;
    start_date: string;
    date_last_updated: string;
    dp_contract_no: string;
  }>;

  // Credit Facility Details (array)
  aecbCreditFacilitiesDetailsModel: Array<{
    Table_Sequence_ID: number;
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

  // Credit Facility History (array)
  aecbCreditFacilitiesHistoryModel: Array<{
    Table_Sequence_ID: number;
    year: number;
    month: number;
    total_amount: number;
    payment_amount: number;
    outstanding_balance: number;
    status: string;
  }>;

  // Credit Card Facilities (array)
  aecbCreditCardFacilitiesModel: Array<{
    Table_Sequence_ID: number;
    type_of_contract: string;
    phase: string;
    role: string;
    start_date: string;
    date_last_updated: string;
    dp_contract_no: string;
  }>;

  // Credit Card Facility Details (array)
  aecbCreditCardFacilitiesDetailsModel: Array<{
    Table_Sequence_ID: number;
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

  // Credit Card Facility History (array)
  aecbCreditCardFacilitiesHistoryModel: Array<{
    Table_Sequence_ID: number;
    year: number;
    month: number;
    utilization_rate_pct: number;
    outstanding_balance: number;
    status: string;
  }>;

  // Telecom Facilities (array)
  aecbTelecomFacilitiesModel: Array<{
    Table_Sequence_ID: number;
    type_of_contract: string;
    phase: string;
    role: string;
    start_date: string;
    date_last_updated: string;
    dp_contract_no: string;
  }>;

  // Telecom Facility Details (array)
  aecbTelecomFacilitiesDetailsModel: Array<{
    Table_Sequence_ID: number;
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

  // Telecom Facility History (array)
  aecbTelecomFacilitiesHistoryModel: Array<{
    Table_Sequence_ID: number;
    year: number;
    month: number;
    billed: number;
    outstanding_balance: number;
    overdue: number;
    status: string;
  }>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

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

const safeNum = (v: unknown, fallback = 0): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const today = () => new Date().toISOString().slice(0, 10);
const farFuture = "2099-12-31";

// ─── System Prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert credit bureau report analyzer for UAE AECB (Al Etihad Credit Bureau) reports.
Given a full AECB credit report PDF (which may be 25+ pages), extract EVERY piece of data and return ONLY a valid JSON object matching EXACTLY this structure. No markdown, no explanation, no code fences.

Return this exact JSON shape:

{
  "aecbPersonalDetailsModel": {
    "Customer_ID": "string (use CB Subject ID or generate as CUST-XXXXX)",
    "CB_Subject_Id": "string",
    "Title": "string (Mr/Mrs/Ms/Dr or empty)",
    "Last_Name": "string",
    "First_Name": "string",
    "Full_Name": "string",
    "Gender": "string (M/F)",
    "Self_Provided": "string (Y/N)",
    "Date_of_Birth": "YYYY-MM-DD",
    "Resident": "string (Y/N)",
    "Nationality": "string (2-letter ISO country code e.g. AE, IN, PK)",
    "Credit_Score": number,
    "Rating": "string (Excellent/Good/Fair/Poor/Very Poor)"
  },
  "aecbContactDetailsModel": [
    {
      "Contact_Details": "string (phone number or email)",
      "Contact_Type": "string (Mobile/Email/Office/Home)",
      "Contact": number (numeric digits only from phone, 0 if email),
      "Provider": "string (Etisalat/Du/Unknown)",
      "Active": "string (Y/N)"
    }
  ],
  "aecbAddressDetailsModel": [
    {
      "Address_Type": "string (Residential/Work/Mailing)",
      "Address": "string",
      "Emirate": "string (Dubai/Abu Dhabi/Sharjah/etc)",
      "P_O_Box": number,
      "Plot_No": number,
      "Provider": "string",
      "Active": "string (Y/N)"
    }
  ],
  "aecbPerIdentDetailsModel": [
    {
      "Table_Sequence_ID": number (1-based index),
      "Type": "string (Emirates ID/Passport/Visa)",
      "Number": number (numeric part only),
      "Expiry_Date": "YYYY-MM-DD",
      "Provider": "string"
    }
  ],
  "aecbEmploymentDetailsModel": [
    {
      "Table_Sequence_ID": number (1-based),
      "Employment": "string (Employed/Self-Employed/Unemployed)",
      "Employer_Name": "string",
      "Gross_Annual_Income": number,
      "Provider": "string",
      "Active": "string (Y/N)",
      "Date_Of_Last_Update": "YYYY-MM-DD"
    }
  ],
  "aecbSalaryCreditsModel": [
    {
      "Account_Type": "string (Current/Savings)",
      "Phase": "string (Open/Closed)",
      "IBAN": "string",
      "Provider_Description": "string (bank name)",
      "Start_Date": "YYYY-MM-DD",
      "Closed_Date": "YYYY-MM-DD",
      "Date_Of_Last_Update": "YYYY-MM-DD"
    }
  ],
  "aecbSalaryHistoryModel": [
    {
      "Year": "string (YYYY)",
      "Month": "string (01-12 or month name)",
      "Salary_Amount": number
    }
  ],
  "aecbTotalCreditSummaryModel": [
    {
      "Table_Sequence_ID": number,
      "total_exposure": number,
      "credit_util_on_CC_pct": number (0-100),
      "oldest_active_cont_SD": "YYYY-MM-DD",
      "newest_contract_SD": "YYYY-MM-DD",
      "total_outstanding": number,
      "total_overdue": number,
      "no_of_default_contracts": number,
      "total_outstanding_telecom_utility": number
    }
  ],
  "aecbOVCreditFacilitiesModel": [
    {
      "Table_Sequence_ID": number (1-based),
      "Credit_Facility_type": "string (Personal Loan/Mortgage/Auto Loan/Credit Card/Overdraft/etc)",
      "no_of_active_contracts": number,
      "account_holder_type": "string (Primary/Joint/Guarantor)",
      "total_payment_amount": number,
      "total_OS_balance_amount": number,
      "total_overdue_amount": number
    }
  ],
  "aecbReturnChequeModel": [
    {
      "Table_Sequence_ID": number (1-based),
      "IBAN": "string",
      "Cheque_Number": number,
      "Amount": number,
      "Reason": "string",
      "Return_Date": "YYYY-MM-DD",
      "Severity": "string (Low/Medium/High)",
      "Cheque_Status": "string (Returned/Settled/Pending)",
      "Settlement_Date": "YYYY-MM-DD",
      "Provider": "string"
    }
  ],
  "aecbCompanyLinksModel": [
    {
      "Table_Sequence_ID": number (1-based),
      "link_type": "string (Director/Shareholder/Owner)",
      "subject": "string (company name)",
      "shareholder_percentage": "string (e.g. 25%)",
      "provider": "string"
    }
  ],
  "aecbCreditTelcoAppModel": [
    {
      "Table_Sequence_ID": number (1-based),
      "Application_Type": "string (Credit/Telecom)",
      "Application_in_180_days": number,
      "total_no_reporting": number
    }
  ],
  "aecbCreditFacilitiesModel": [
    {
      "Table_Sequence_ID": number (1-based sequential for each facility),
      "type_of_contract": "string (Personal Loan/Home Loan/Auto Loan/Business Loan/etc)",
      "phase": "string (Open/Closed/Written-Off/Default)",
      "role": "string (Primary/Co-borrower/Guarantor)",
      "start_date": "YYYY-MM-DD",
      "date_last_updated": "YYYY-MM-DD",
      "dp_contract_no": "string"
    }
  ],
  "aecbCreditFacilitiesDetailsModel": [
    {
      "Table_Sequence_ID": number (matching parent facility),
      "provider": "string (bank/institution name)",
      "outstanding_balance": number,
      "total_amount": number,
      "total_no_of_instalments": number,
      "no_of_remaining_instalments": number,
      "payments_frequency": "string (Monthly/Weekly/Quarterly)",
      "payment_amount": number,
      "start_date": "YYYY-MM-DD",
      "closed_date": "YYYY-MM-DD",
      "islamic_contract_flag": "string (Y/N)",
      "secured_contract_flag": "string (Y/N)",
      "funded_contract_flag": "string (Y/N)",
      "overdue_amount": number,
      "worst_status": "string (Current/1-29 Days/30-59 Days/60-89 Days/90+ Days/Write-Off)",
      "worst_status_date": "YYYY-MM-DD",
      "security": "string (None/Property/Vehicle/Cash/Other)"
    }
  ],
  "aecbCreditFacilitiesHistoryModel": [
    {
      "Table_Sequence_ID": number (matching parent facility),
      "year": number,
      "month": number (1-12),
      "total_amount": number,
      "payment_amount": number,
      "outstanding_balance": number,
      "status": "string (Current/Late/Default/etc)"
    }
  ],
  "aecbCreditCardFacilitiesModel": [
    {
      "Table_Sequence_ID": number (1-based, separate sequence from credit facilities),
      "type_of_contract": "string (Credit Card/Charge Card)",
      "phase": "string (Open/Closed)",
      "role": "string (Primary/Supplementary)",
      "start_date": "YYYY-MM-DD",
      "date_last_updated": "YYYY-MM-DD",
      "dp_contract_no": "string"
    }
  ],
  "aecbCreditCardFacilitiesDetailsModel": [
    {
      "Table_Sequence_ID": number (matching parent card),
      "provider": "string",
      "balance": number,
      "credit_limit": number,
      "amount_spent_till_date": number,
      "overdue_amount": number,
      "no_of_days_of_payment_delay": number,
      "start_date": "YYYY-MM-DD",
      "closed_date": "YYYY-MM-DD",
      "card_used_flag": "string (Y/N)",
      "islamic_contract_flag": "string (Y/N)",
      "secured_contract_flag": "string (Y/N)",
      "funded_contract_flag": "string (Y/N)",
      "payment_due_date": "string (YYYY-MM-DD or day of month)",
      "statement_due_amount": number,
      "actual_payment_amount": number,
      "worst_status": "string",
      "worst_status_date": "YYYY-MM-DD",
      "security": "string"
    }
  ],
  "aecbCreditCardFacilitiesHistoryModel": [
    {
      "Table_Sequence_ID": number (matching parent card),
      "year": number,
      "month": number (1-12),
      "utilization_rate_pct": number (0-100),
      "outstanding_balance": number,
      "status": "string"
    }
  ],
  "aecbTelecomFacilitiesModel": [
    {
      "Table_Sequence_ID": number (1-based),
      "type_of_contract": "string (Postpaid/Prepaid/Broadband/etc)",
      "phase": "string (Open/Closed)",
      "role": "string (Primary/Secondary)",
      "start_date": "YYYY-MM-DD",
      "date_last_updated": "YYYY-MM-DD",
      "dp_contract_no": "string"
    }
  ],
  "aecbTelecomFacilitiesDetailsModel": [
    {
      "Table_Sequence_ID": number (matching parent telecom),
      "provider": "string (Etisalat/Du/Virgin Mobile/etc)",
      "communication_type": "string (Mobile/Fixed Line/Broadband/etc)",
      "no_of_mobile_services": number,
      "no_of_fixed_line_services": number,
      "no_of_other_services": number,
      "start_date": "YYYY-MM-DD",
      "closed_date": "YYYY-MM-DD",
      "holder_is_not_liable_flag": "string (Y/N)",
      "funded_contract_flag": "string (Y/N)",
      "worst_status": "string",
      "worst_status_date": "YYYY-MM-DD"
    }
  ],
  "aecbTelecomFacilitiesHistoryModel": [
    {
      "Table_Sequence_ID": number (matching parent telecom),
      "year": number,
      "month": number (1-12),
      "billed": number,
      "outstanding_balance": number,
      "overdue": number,
      "status": "string"
    }
  ]
}

CRITICAL RULES:
- Extract EVERY record from EVERY page. Do not skip any facility, card, loan, or history row.
- For missing/unavailable fields use sensible defaults: 0 for numbers, "N" for flags, "Unknown" for providers, today's date or "2099-12-31" for future dates.
- All dates must be YYYY-MM-DD format.
- All numeric fields must be numbers (not strings).
- Table_Sequence_ID must be sequential integers starting at 1 within each table grouping.
- Rating must be: Excellent (750-850), Good (700-749), Fair (650-699), Poor (600-649), Very Poor (300-599).
- For Gender: infer from title/name if not explicitly stated.
- Return ONLY the JSON object. No text before or after.`;

// ─── Table metadata for preview ──────────────────────────────────────────────

const TABLE_META: Array<{
  key: keyof AECBFullData;
  label: string;
  icon: string;
  color: string;
}> = [
  {
    key: "aecbPersonalDetailsModel",
    label: "Personal Details",
    icon: "👤",
    color: "blue",
  },
  {
    key: "aecbContactDetailsModel",
    label: "Contact Details",
    icon: "📞",
    color: "purple",
  },
  {
    key: "aecbAddressDetailsModel",
    label: "Address Details",
    icon: "🏠",
    color: "green",
  },
  {
    key: "aecbPerIdentDetailsModel",
    label: "ID Documents",
    icon: "🪪",
    color: "indigo",
  },
  {
    key: "aecbEmploymentDetailsModel",
    label: "Employment Details",
    icon: "💼",
    color: "amber",
  },
  {
    key: "aecbSalaryCreditsModel",
    label: "Salary Credits",
    icon: "💰",
    color: "emerald",
  },
  {
    key: "aecbSalaryHistoryModel",
    label: "Salary History",
    icon: "📈",
    color: "teal",
  },
  {
    key: "aecbTotalCreditSummaryModel",
    label: "Total Credit Summary",
    icon: "📊",
    color: "blue",
  },
  {
    key: "aecbOVCreditFacilitiesModel",
    label: "OV Credit Facilities",
    icon: "🏦",
    color: "violet",
  },
  {
    key: "aecbReturnChequeModel",
    label: "Return Cheques",
    icon: "🪙",
    color: "red",
  },
  {
    key: "aecbCompanyLinksModel",
    label: "Company Links",
    icon: "🏢",
    color: "slate",
  },
  {
    key: "aecbCreditTelcoAppModel",
    label: "Credit Telco App",
    icon: "📱",
    color: "cyan",
  },
  {
    key: "aecbCreditFacilitiesModel",
    label: "Credit Facilities",
    icon: "🏛️",
    color: "orange",
  },
  {
    key: "aecbCreditFacilitiesDetailsModel",
    label: "Credit Facility Details",
    icon: "📋",
    color: "orange",
  },
  {
    key: "aecbCreditFacilitiesHistoryModel",
    label: "Credit Facility History",
    icon: "📅",
    color: "amber",
  },
  {
    key: "aecbCreditCardFacilitiesModel",
    label: "Credit Card Facilities",
    icon: "💳",
    color: "rose",
  },
  {
    key: "aecbCreditCardFacilitiesDetailsModel",
    label: "Credit Card Details",
    icon: "🗂️",
    color: "rose",
  },
  {
    key: "aecbCreditCardFacilitiesHistoryModel",
    label: "Credit Card History",
    icon: "📅",
    color: "pink",
  },
  {
    key: "aecbTelecomFacilitiesModel",
    label: "Telecom Facilities",
    icon: "📡",
    color: "sky",
  },
  {
    key: "aecbTelecomFacilitiesDetailsModel",
    label: "Telecom Details",
    icon: "📶",
    color: "sky",
  },
  {
    key: "aecbTelecomFacilitiesHistoryModel",
    label: "Telecom History",
    icon: "📅",
    color: "blue",
  },
];

const COLOR_MAP: Record<string, string> = {
  blue: "bg-blue-100 text-blue-700 border-blue-200",
  purple: "bg-purple-100 text-purple-700 border-purple-200",
  green: "bg-green-100 text-green-700 border-green-200",
  indigo: "bg-indigo-100 text-indigo-700 border-indigo-200",
  amber: "bg-amber-100 text-amber-700 border-amber-200",
  emerald: "bg-emerald-100 text-emerald-700 border-emerald-200",
  teal: "bg-teal-100 text-teal-700 border-teal-200",
  violet: "bg-violet-100 text-violet-700 border-violet-200",
  red: "bg-red-100 text-red-700 border-red-200",
  slate: "bg-slate-100 text-slate-700 border-slate-200",
  cyan: "bg-cyan-100 text-cyan-700 border-cyan-200",
  orange: "bg-orange-100 text-orange-700 border-orange-200",
  rose: "bg-rose-100 text-rose-700 border-rose-200",
  pink: "bg-pink-100 text-pink-700 border-pink-200",
  sky: "bg-sky-100 text-sky-700 border-sky-200",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function CreditScore() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState("");
  const [data, setData] = useState<AECBFullData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [expandedTable, setExpandedTable] = useState<string | null>(
    "aecbPersonalDetailsModel",
  );

  const [submitting, setSubmitting] = useState(false);
  const [submitStage, setSubmitStage] = useState("");
  const [submitDone, setSubmitDone] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [returnedTxnNo, setReturnedTxnNo] = useState<number | null>(null);

  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Analyze PDF ──────────────────────────────────────────────────────────

  const analyzeFile = async (f: File) => {
    setLoading(true);
    setError(null);
    setData(null);
    setSubmitDone(false);
    setSubmitError(null);
    setReturnedTxnNo(null);
    setLoadingStage("Converting PDF to base64…");

    try {
      const base64 = await fileToBase64(f);

      setLoadingStage("full extraction (25+ pages)…");

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
                  text: `Analyze this AECB credit report PDF completely. 
IMPORTANT: This is a 25+ page document. You MUST read EVERY page and extract EVERY record:
- All credit facilities (loans, mortgages, auto loans) with their full history
- All credit card facilities with their full history  
- All telecom facilities with their full history
- All salary history entries
- All return cheques
- All identity documents
- Everything in the overview/summary tables

Return the complete JSON as instructed. Do not truncate or stop early.`,
                },
              ],
            },
          ],
        }),
      });

      setLoadingStage("Parsing extracted data…");
      const result = await response.json();
      if (result.error)
        throw new Error(result.error.message || "Claude API error");

      const text: string =
        result.content?.find((c: { type: string }) => c.type === "text")
          ?.text ?? "";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in Claude response");

      const parsed: AECBFullData = JSON.parse(jsonMatch[0]);
      setData(parsed);
    } catch (err) {
      setError(
        err instanceof Error
          ? `Extraction failed: ${err.message}`
          : "Failed to analyze the credit report. Please try again.",
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

  // ── Submit ───────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!data) return;
    setSubmitting(true);
    setSubmitError(null);
    setSubmitDone(false);
    setReturnedTxnNo(null);
    setSubmitStage("Preparing payload…");

    try {
      await new Promise((r) => setTimeout(r, 600));
      setSubmitStage("Uploading to all 21 AECB tables…");

      const res = await fetch(`${BASE_URL}/upload-aecb-data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      setSubmitStage("Verifying response…");
      await new Promise((r) => setTimeout(r, 800));

      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(json.message || "Upload failed");

      // Ensure at least 2s of visible loader
      await new Promise((r) => setTimeout(r, 700));

      setReturnedTxnNo(json.transaction_no ?? null);
      setSubmitDone(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Failed to submit. Please try again.",
      );
    }
    setSubmitting(false);
    setSubmitStage("");
  };

  const copyJSON = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  // ── Helpers for preview ──────────────────────────────────────────────────

  const getRecordCount = (key: keyof AECBFullData): number => {
    if (!data) return 0;
    const val = data[key];
    if (Array.isArray(val)) return val.length;
    return val ? 1 : 0;
  };

  const getTotalRecords = (): number => {
    if (!data) return 0;
    return TABLE_META.reduce((sum, t) => sum + getRecordCount(t.key), 0);
  };

  const scoreArc = (score: number) => {
    const pct = Math.min(Math.max(score, 300), 850);
    const normalized = (pct - 300) / 550;
    const total = Math.PI * 50;
    return { total, offset: total * (1 - normalized) };
  };

  const personal = data?.aecbPersonalDetailsModel;

  // ── Render ───────────────────────────────────────────────────────────────

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
              Drop your AECB credit report PDF here
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              or click to browse · supports 25+ page reports
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
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <svg
              className="h-6 w-6 animate-spin text-blue-500"
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
            <p className="text-sm font-semibold text-foreground">
              Extracting full AECB report…
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{loadingStage}</p>
            <p className="mt-2 text-[11px] text-muted-foreground">
              25+ page reports may take 30–60 seconds
            </p>
          </div>
          <div className="mx-auto max-w-xs space-y-1.5">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full animate-pulse rounded-full bg-blue-400"
                style={{ width: "65%" }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground">
              Extracting all 21 table groups…
            </p>
          </div>
        </div>
      )}

      {/* ── Results ── */}
      {data && !loading && (
        <div className="space-y-4">
          {/* ── Summary header ── */}
          <div className="rounded-lg border bg-card p-4 flex flex-wrap items-center gap-4 justify-between">
            <div className="flex items-center gap-4">
              {personal && (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-lg font-bold">
                    {personal.First_Name?.[0] ?? "?"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {personal.Full_Name ||
                        `${personal.First_Name} ${personal.Last_Name}`}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      CB Subject: {personal.CB_Subject_Id || "—"}
                    </p>
                  </div>
                </div>
              )}
              {personal && (
                <div className="flex items-center gap-3">
                  <svg
                    width={80}
                    height={46}
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
                      stroke={ratingHex(personal.Rating)}
                      strokeWidth={10}
                      strokeLinecap="round"
                      strokeDasharray={`${scoreArc(personal.Credit_Score).total} ${scoreArc(personal.Credit_Score).total}`}
                      strokeDashoffset={scoreArc(personal.Credit_Score).offset}
                    />
                    <text
                      x="60"
                      y="60"
                      textAnchor="middle"
                      fill={ratingHex(personal.Rating)}
                      fontSize="16"
                      fontWeight="700"
                    >
                      {personal.Credit_Score}
                    </text>
                  </svg>
                  <div>
                    <p
                      className={`text-base font-bold ${ratingTextColor(personal.Rating)}`}
                    >
                      {personal.Rating}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Credit Score
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-[11px] font-medium text-green-700">
                ✓ {getTotalRecords()} total records across 21 tables
              </span>
              <button
                onClick={copyJSON}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${copied ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground hover:text-foreground"}`}
              >
                {copied ? "✓ Copied" : "Copy JSON"}
              </button>
            </div>
          </div>

          {/* ── Table tiles ── */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {TABLE_META.map((t) => {
              const count = getRecordCount(t.key);
              const isExpanded = expandedTable === t.key;
              const colorCls = COLOR_MAP[t.color] ?? COLOR_MAP.blue;
              const val = data[t.key];
              const isArray = Array.isArray(val);

              return (
                <div
                  key={t.key}
                  className="rounded-lg border bg-card overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedTable(isExpanded ? null : t.key)}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-accent/30 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base">{t.icon}</span>
                      <span className="text-[11px] font-medium text-foreground truncate">
                        {t.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-1">
                      <span
                        className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold border ${colorCls}`}
                      >
                        {count}
                      </span>
                      <svg
                        className={`h-3 w-3 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t bg-muted/20 max-h-64 overflow-auto">
                      {count === 0 ? (
                        <p className="px-3 py-2 text-[11px] text-muted-foreground italic">
                          No records extracted
                        </p>
                      ) : isArray ? (
                        (val as Record<string, unknown>[]).map((row, i) => (
                          <div
                            key={i}
                            className="border-b last:border-0 px-3 py-2 space-y-0.5"
                          >
                            {Object.entries(row).map(([k, v]) => (
                              <div key={k} className="flex gap-2 text-[10px]">
                                <span className="text-muted-foreground shrink-0 w-32 truncate">
                                  {k}:
                                </span>
                                <span className="text-foreground font-medium truncate">
                                  {String(v ?? "—")}
                                </span>
                              </div>
                            ))}
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 space-y-0.5">
                          {Object.entries(val as Record<string, unknown>).map(
                            ([k, v]) => (
                              <div key={k} className="flex gap-2 text-[10px]">
                                <span className="text-muted-foreground shrink-0 w-36 truncate">
                                  {k}:
                                </span>
                                <span className="text-foreground font-medium truncate">
                                  {String(v ?? "—")}
                                </span>
                              </div>
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Submit Panel ── */}
          <div className="rounded-lg border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Submit to Database
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  POST /api/upload-aecb-data · {getTotalRecords()} records
                  across 21 tables
                </p>
              </div>
              <button
                onClick={handleSubmit}
                disabled={submitting || submitDone}
                className="rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40 min-w-[100px]"
              >
                {submitting
                  ? "Uploading…"
                  : submitDone
                    ? "✓ Submitted"
                    : "Submit All"}
              </button>
            </div>

            {/* Submitting loader */}
            {submitting && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-4 space-y-3">
                <div className="flex items-center gap-3">
                  <svg
                    className="h-5 w-5 animate-spin text-blue-500 shrink-0"
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
                  <div>
                    <p className="text-xs font-semibold text-blue-800">
                      Uploading to AECB tables…
                    </p>
                    <p className="text-[11px] text-blue-600 mt-0.5">
                      {submitStage}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {["Personal & Contact", "Facilities", "History & Telco"].map(
                    (label, i) => (
                      <div
                        key={label}
                        className="rounded bg-blue-100 px-2 py-1.5 text-center"
                      >
                        <div className="flex justify-center mb-1">
                          <svg
                            className={`h-3.5 w-3.5 ${i === 0 ? "text-green-500" : "animate-spin text-blue-400"}`}
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            {i === 0 ? (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                                stroke="currentColor"
                              />
                            ) : (
                              <>
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
                              </>
                            )}
                          </svg>
                        </div>
                        <p className="text-[10px] text-blue-700 font-medium">
                          {label}
                        </p>
                      </div>
                    ),
                  )}
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-blue-200">
                  <div
                    className="h-full animate-pulse rounded-full bg-blue-500"
                    style={{ width: "70%" }}
                  />
                </div>
              </div>
            )}

            {/* Endpoint status */}
            {!submitting && (
              <div
                className={`rounded-lg border px-4 py-3 flex items-center justify-between transition-colors
                ${submitDone ? "border-green-200 bg-green-50" : submitError ? "border-red-200 bg-red-50" : "border-border bg-muted/30"}`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`text-base ${submitDone ? "text-green-600" : submitError ? "text-red-500" : "text-muted-foreground"}`}
                  >
                    {submitDone ? "✓" : submitError ? "✗" : "○"}
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      POST /api/upload-aecb-data
                    </p>
                    <p className="text-[10px] font-mono text-muted-foreground">
                      {BASE_URL}/api/upload-aecb-data
                    </p>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full
                  ${submitDone ? "bg-green-100 text-green-700" : submitError ? "bg-red-100 text-red-600" : "bg-muted text-muted-foreground"}`}
                >
                  {submitDone ? "201 Created" : submitError ? "error" : "idle"}
                </span>
              </div>
            )}

            {submitError && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-xs text-destructive">
                {submitError}
              </div>
            )}

            {submitDone && (
              <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-xs text-green-700">
                <span className="text-base mt-0.5">✓</span>
                <div>
                  <p className="font-semibold">
                    All 21 AECB tables populated successfully
                  </p>
                  {returnedTxnNo && (
                    <p className="mt-0.5 text-green-600">
                      Transaction #{returnedTxnNo} · {getTotalRecords()} records
                      saved
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
