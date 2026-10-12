import type { FileVOState } from "@ghcloud/cube-protocol";

export interface Agent {
  id: string;
  name: string;
  avatar: FileVOState;
  description: string;
  platform: string;
  flowId: string;
  apiKey: string;
  apiUrl: string;
  useInUE: boolean;
}
