/**
 * Shared report field definitions with category groupings.
 * Used across ReportSettings, AddInvestee, CompanyDetail, SubmitReport, and ReportDetailDialog.
 */

export interface ReportFieldDef {
  key: string;
  label: string;
  unit?: string; // e.g. "원", "%", "주", "명"
  step?: string; // for number input step
  /** If true, stored in metrics_data JSONB column instead of a dedicated column */
  isExtended?: boolean;
}

export interface ReportFieldCategory {
  key: string;
  label: string;
  fields: ReportFieldDef[];
}

export const REPORT_FIELD_CATEGORIES: ReportFieldCategory[] = [
  {
    key: "customer",
    label: "고객/사용자 지표",
    fields: [
      { key: "mau", label: "MAU", unit: "명" },
      { key: "dau", label: "DAU", unit: "명" },
      { key: "paid_customer_count", label: "유료 고객 수", unit: "명" },
      { key: "contract_count", label: "계약 수", unit: "건" },
      { key: "conversion_rate", label: "전환율", unit: "%", step: "0.01" },
      { key: "cac", label: "CAC", unit: "원" },
      { key: "arppu", label: "ARPPU", unit: "원" },
      { key: "average_contract_value", label: "평균 계약 단가", unit: "원" },
    ],
  },
  {
    key: "saas",
    label: "SaaS 지표",
    fields: [
      { key: "mrr", label: "MRR", unit: "원" },
      { key: "arr", label: "ARR", unit: "원" },
    ],
  },
  {
    key: "income_statement",
    label: "손익계산서",
    fields: [
      { key: "total_revenue", label: "총매출", unit: "원", isExtended: true },
      { key: "revenue_growth_rate", label: "매출 성장률", unit: "%", step: "0.01", isExtended: true },
      { key: "cost_of_revenue", label: "매출원가", unit: "원", isExtended: true },
      { key: "gross_profit", label: "매출총이익", unit: "원", isExtended: true },
      { key: "gross_margin", label: "매출총이익률", unit: "%", step: "0.01", isExtended: true },
      { key: "sga_expenses", label: "판관비", unit: "원", isExtended: true },
      { key: "operating_income", label: "영업이익", unit: "원", isExtended: true },
      { key: "operating_margin", label: "영업이익률", unit: "%", step: "0.01", isExtended: true },
      { key: "ebitda", label: "EBITDA", unit: "원", isExtended: true },
      { key: "ebitda_margin", label: "EBITDA 마진", unit: "%", step: "0.01", isExtended: true },
      { key: "net_income", label: "당기순이익", unit: "원", isExtended: true },
      { key: "net_margin", label: "순이익률", unit: "%", step: "0.01", isExtended: true },
      { key: "eps", label: "EPS", unit: "원", isExtended: true },
      { key: "diluted_eps", label: "희석 EPS", unit: "원", isExtended: true },
    ],
  },
  {
    key: "balance_sheet",
    label: "재무상태표",
    fields: [
      { key: "total_assets", label: "총자산", unit: "원", isExtended: true },
      { key: "current_assets", label: "유동자산", unit: "원", isExtended: true },
      { key: "non_current_assets", label: "비유동자산", unit: "원", isExtended: true },
      { key: "total_liabilities", label: "총부채", unit: "원", isExtended: true },
      { key: "current_liabilities", label: "유동부채", unit: "원", isExtended: true },
      { key: "long_term_debt", label: "장기부채", unit: "원", isExtended: true },
      { key: "total_equity", label: "총자본", unit: "원", isExtended: true },
      { key: "paid_in_capital", label: "자본금", unit: "원", isExtended: true },
      { key: "retained_earnings", label: "이익잉여금", unit: "원", isExtended: true },
      { key: "net_debt", label: "순차입금", unit: "원", isExtended: true },
      { key: "debt_ratio", label: "부채비율", unit: "%", step: "0.01", isExtended: true },
      { key: "current_ratio", label: "유동비율", unit: "%", step: "0.01", isExtended: true },
    ],
  },
  {
    key: "cash_flow",
    label: "현금흐름",
    fields: [
      { key: "operating_cash_flow", label: "영업활동 현금흐름", unit: "원", isExtended: true },
      { key: "investing_cash_flow", label: "투자활동 현금흐름", unit: "원", isExtended: true },
      { key: "financing_cash_flow", label: "재무활동 현금흐름", unit: "원", isExtended: true },
      { key: "free_cash_flow", label: "잉여현금흐름", unit: "원", isExtended: true },
    ],
  },
  {
    key: "stock",
    label: "주식/배당",
    fields: [
      { key: "total_shares_issued", label: "총발행주식수", unit: "주" },
      { key: "shares_outstanding", label: "유통주식수", unit: "주", isExtended: true },
      { key: "treasury_shares", label: "자사주 수량", unit: "주", isExtended: true },
      { key: "major_shareholder_ratio", label: "대주주 지분율", unit: "%", step: "0.01", isExtended: true },
      { key: "foreign_ownership_ratio", label: "외국인 지분율", unit: "%", step: "0.01", isExtended: true },
      { key: "market_cap", label: "시가총액", unit: "원", isExtended: true },
      { key: "latest_price_per_share", label: "최신 주당가격", unit: "원" },
      { key: "annual_high", label: "연간 최고가", unit: "원", isExtended: true },
      { key: "annual_low", label: "연간 최저가", unit: "원", isExtended: true },
      { key: "dividend_per_share", label: "주당 배당금", unit: "원", isExtended: true },
      { key: "payout_ratio", label: "배당성향", unit: "%", step: "0.01", isExtended: true },
      { key: "dividend_yield", label: "배당수익률", unit: "%", step: "0.01", isExtended: true },
    ],
  },
  {
    key: "other",
    label: "기타",
    fields: [
      { key: "remaining_gov_subsidy", label: "잔여 정부지원금", unit: "원" },
    ],
  },
];

/** Flat list of all optional field definitions */
export const ALL_OPTIONAL_FIELDS: ReportFieldDef[] = REPORT_FIELD_CATEGORIES.flatMap(c => c.fields);

/** All optional field keys */
export const ALL_FIELD_KEYS: string[] = ALL_OPTIONAL_FIELDS.map(f => f.key);

/** Lookup map: key → field definition */
export const FIELD_DEF_MAP: Record<string, ReportFieldDef> = Object.fromEntries(
  ALL_OPTIONAL_FIELDS.map(f => [f.key, f])
);

/** Lookup map: key → label */
export const FIELD_LABEL_MAP: Record<string, string> = Object.fromEntries(
  ALL_OPTIONAL_FIELDS.map(f => [f.key, f.label])
);

export const FREQUENCY_OPTIONS = [
  { key: "monthly", label: "월간" },
  { key: "quarterly", label: "분기" },
  { key: "semi_annual", label: "반기" },
  { key: "annual", label: "연간" },
] as const;

export type ReportFieldsConfig = Record<string, string[]>;
