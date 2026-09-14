export interface CrmAnalyticsKpi {
  totalVisitors: number;
  totalPageViews: number;
  totalUnitViews: number;
  totalInquiries: number;
  conversionRate: number;
  totalShareClicks: number;
}

export interface CrmAnalyticsGrowth {
  visitors: number;
  pageViews: number;
  unitViews: number;
  inquiries: number;
  conversionRate: number;
}

export interface CrmAnalyticsDevices {
  mobile: number;
  desktop: number;
  tablet: number;
}

export interface CrmAnalyticsOverview {
  period: string;
  kpi: CrmAnalyticsKpi;
  growth: CrmAnalyticsGrowth;
  devices: CrmAnalyticsDevices;
}

export interface TrafficTrendPoint {
  date: string;
  day: number;
  visitors: number;
  pageViews: number;
  unitViews: number;
  inquiries: number;
}

export interface TopUnitItem {
  id: string;
  name: string;
  merekName: string;
  tipeName: string;
  platNomor: string;
  tahun: number;
  warna: string;
  transmisi: string;
  otrPrice: number;
  statusUnit: string;
  imageFilename: string | null;
  viewCount: number;
  inquiryCount: number;
  inquiryRate: number;
}

export interface VisitorLogUnit {
  id: string;
  name: string;
  platNomor: string;
  otrPrice: number;
  statusUnit: string;
  imageFilename: string | null;
}

export interface VisitorLogRow {
  id: string;
  visitorId: string;
  sessionId: string | null;
  eventType: 'PAGE_VIEW' | 'UNIT_VIEW' | 'WHATSAPP_CLICK' | 'PHONE_CLICK' | 'SHARE_CLICK' | string;
  pagePath: string;
  pageTitle: string | null;
  durationSeconds: number;
  meta: Record<string, unknown> | null;
  createdAt: string;
  deviceType: 'MOBILE' | 'DESKTOP' | 'TABLET' | string;
  browser: string;
  os: string;
  referrer: string | null;
  unit: VisitorLogUnit | null;
}

export interface VisitorLogsMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface VisitorLogsResponse {
  data: VisitorLogRow[];
  meta: VisitorLogsMeta;
}

export interface CrmAnalyticsFilterParams {
  period?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface VisitorLogsParams {
  page?: number;
  limit?: number;
  search?: string;
  eventType?: string;
  unitId?: string;
  dateFrom?: string;
  dateTo?: string;
  period?: string;
}
