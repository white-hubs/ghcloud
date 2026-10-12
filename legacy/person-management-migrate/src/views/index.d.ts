declare namespace personnelManagement {
  interface successResult {
    data: {
      records: any[];
      total: number;
      pages?: number;
    };
  }
}