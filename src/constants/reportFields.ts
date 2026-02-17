export interface ReportFieldDef {
  key: string;
  label: string;
}

export interface ReportFieldCategory {
  category: string;
  fields: ReportFieldDef[];
}

export const REPORT_FIELD_CATEGORIES: ReportFieldCategory[] = [
  {
    category: "매출 · 수익",
    fields: [
      { key: "total_revenue", label: "총매출" },
      { key: "revenue_growth_rate", label: "매출 성장률" },
      { key: "cogs", label: "매출원가" },
      { key: "gross_profit", label: "매출총이익" },
      { key: "gross_margin", label: "매출총이익률" },
      { key: "mrr", label: "MRR" },
      { key: "arr", label: "ARR" },
      { key: "arppu", label: "ARPPU" },
    ],
  },
  {
    category: "비용 · 영업이익",
    fields: [
      { key: "sga", label: "판관비" },
      { key: "operating_income", label: "영업이익" },
      { key: "operating_margin", label: "영업이익률" },
      { key: "ebitda", label: "EBITDA" },
      { key: "ebitda_margin", label: "EBITDA 마진" },
      { key: "net_income", label: "당기순이익" },
      { key: "net_margin", label: "순이익률" },
      { key: "eps", label: "EPS" },
      { key: "diluted_eps", label: "희석 EPS" },
    ],
  },
  {
    category: "고객 · 성장",
    fields: [
      { key: "contract_count", label: "계약 수" },
      { key: "paid_customer_count", label: "유료 고객 수" },
      { key: "average_contract_value", label: "평균 계약 단가" },
      { key: "mau", label: "MAU" },
      { key: "dau", label: "DAU" },
      { key: "conversion_rate", label: "전환율" },
      { key: "cac", label: "CAC" },
    ],
  },
  {
    category: "자산 · 부채",
    fields: [
      { key: "total_assets", label: "총자산" },
      { key: "current_assets", label: "유동자산" },
      { key: "non_current_assets", label: "비유동자산" },
      { key: "total_liabilities", label: "총부채" },
      { key: "current_liabilities", label: "유동부채" },
      { key: "long_term_debt", label: "장기부채" },
      { key: "total_equity", label: "총자본" },
      { key: "paid_in_capital", label: "자본금" },
      { key: "retained_earnings", label: "이익잉여금" },
      { key: "net_debt", label: "순차입금" },
      { key: "debt_ratio", label: "부채비율" },
      { key: "current_ratio", label: "유동비율" },
      { key: "remaining_gov_subsidy", label: "잔여 정부지원금" },
    ],
  },
  {
    category: "현금흐름",
    fields: [
      { key: "operating_cash_flow", label: "영업활동 현금흐름" },
      { key: "investing_cash_flow", label: "투자활동 현금흐름" },
      { key: "financing_cash_flow", label: "재무활동 현금흐름" },
      { key: "free_cash_flow", label: "잉여현금흐름" },
      { key: "ending_cash", label: "기말 현금 보유액" },
    ],
  },
  {
    category: "주식 · 지분",
    fields: [
      { key: "total_shares_issued", label: "발행주식수" },
      { key: "floating_shares", label: "유통주식수" },
      { key: "treasury_shares", label: "자사주 수량" },
      { key: "major_shareholder_ratio", label: "대주주 지분율" },
      { key: "foreign_ownership_ratio", label: "외국인 지분율" },
    ],
  },
  {
    category: "시장 · 배당",
    fields: [
      { key: "market_cap", label: "시가총액" },
      { key: "latest_price_per_share", label: "기말 주가" },
      { key: "annual_high", label: "연간 최고가" },
      { key: "annual_low", label: "연간 최저가" },
      { key: "dividend_per_share", label: "주당 배당금" },
      { key: "payout_ratio", label: "배당성향" },
      { key: "dividend_yield", label: "배당수익률" },
    ],
  },
];

export const ALL_REPORT_FIELDS: ReportFieldDef[] = REPORT_FIELD_CATEGORIES.flatMap(c => c.fields);
export const ALL_FIELD_KEYS = ALL_REPORT_FIELDS.map(f => f.key);

export const FREQUENCY_OPTIONS = [
  { key: "monthly", label: "월간" },
  { key: "quarterly", label: "분기" },
  { key: "semi_annual", label: "반기" },
  { key: "annual", label: "연간" },
] as const;

export type ReportFieldsConfig = Record<string, string[]>;
