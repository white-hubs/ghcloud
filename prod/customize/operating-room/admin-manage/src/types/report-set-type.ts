export interface ReportSet {
  tenant?: string | undefined;
  tenantName?: string | undefined;
  time?: number | undefined;
  company?: string | undefined;
  phone?: string | undefined;
  address?: string | undefined;
  statement?: string | undefined;
  seal?: File | null | undefined;
  template?: string | undefined;
}
