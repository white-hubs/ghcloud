export type AiCenterTabKey = "agents" | "skills" | "mine";

export interface AiCenterAgent {
  id: string;
  libraryRef?: string;
  shelfId?: string;
  name: string;
  description: string;
  detail: string;
  skillSummary: string;
  createdAt: string;
  categoryId: string;
  categoryName: string;
  icon: string;
  visibility?: string;
  installed?: boolean;
}

export interface AiCenterSkillCategory {
  id: string;
  name: string;
  shortName: string;
  color: string;
}

export interface AiCenterSkill {
  id: string;
  libraryRef?: string;
  shelfId?: string;
  name: string;
  description: string;
  categoryId: string;
  categoryName?: string;
  icon: string;
  installed?: boolean;
  source?: string | null;
}
