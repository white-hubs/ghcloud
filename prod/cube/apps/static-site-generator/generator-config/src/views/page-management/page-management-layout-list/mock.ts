export interface LayoutItem {
  id: string;
  layoutName: string;
  createdTime: string;
  updatedTime: string;
}

const MOCK_DATA: LayoutItem[] = [
  {
    id: "1",
    layoutName: "default",
    createdTime: "2024-01-10 10:00:00",
    updatedTime: "2024-03-20 14:30:00",
  },
];

export async function getMockLayoutList(): Promise<LayoutItem[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...MOCK_DATA]), 300);
  });
}

export async function deleteMockLayout(id: string): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = MOCK_DATA.findIndex((item) => item.id === id);
      if (index > -1) MOCK_DATA.splice(index, 1);
      resolve();
    }, 300);
  });
}
