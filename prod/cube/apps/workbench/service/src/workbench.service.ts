import { type CubeAuth, CubeGateway, type LegacyServiceError } from "@ghcloud/cube-gateway";
import { BASE_API } from "@ghcloud/cube-protocol";

const baseURL = `${BASE_API}/ouaa`;

export interface Card {
  id: string;
  applicationCode: string;
  applicationId: string;
  cardSize: string;
  code: string;
  defaultCard: boolean;
  name: string;
  sort: number;
}

export interface NoUseCardQuery {
  keyword: string;
}

export interface UserMemoModifyParam {
  title: string;
  content: string;
}

export interface UserMemoPageQuery {
  pageNumber: number;
  pageSize: number;
  keyword?: string;
}

export interface UserMemo {
  id: string | number;
  title: string;
  content: string;
  createTime: string | number;
  updateTime: string | number;
}

export interface UserMemoPage {
  total: number;
  pages: number;
  records: UserMemo[];
}

export class CubeWorkbenchService {
  private readonly gateway: CubeGateway;

  public constructor(auth: CubeAuth) {
    this.gateway = new CubeGateway(auth);
  }

  public async getCards(): Promise<Card[]> {
    const url = `${baseURL}/context/terminal-home-cards`;
    const resp = await this.gateway.get<LegacyServiceError<Record<string, unknown>[]>>({ url });
    const data = resp.data || resp;
    return data.map(toCard);

    function toCard(record: Record<string, unknown>): Card {
      return {
        id: record.id as string,
        applicationCode: record.applicationCode as string,
        applicationId: record.applicationId as string,
        cardSize: record.cardSize as string,
        code: record.code as string,
        defaultCard: record.defaultCard === true,
        name: record.name as string,
        sort: record.sort as number,
      };
    }
  }

  public async getNoUseCards(query: NoUseCardQuery): Promise<Card[]> {
    const url = `${baseURL}/context/terminal-cards`;
    const resp = await this.gateway.get<LegacyServiceError<Record<string, unknown>[]>>({ url, payload: { ...query } });
    const data = resp.data || resp;
    return data?.map(toCard);

    function toCard(record: Record<string, unknown>): Card {
      return {
        id: record.id as string,
        applicationCode: record.applicationCode as string,
        applicationId: record.applicationId as string,
        cardSize: record.cardSize as string,
        code: record.code as string,
        defaultCard: record.defaultCard === true,
        name: record.name as string,
        sort: record.sort as number,
      };
    }
  }

  public async deleteHomeCard(code: string): Promise<void> {
    const url = `${baseURL}/home-application-card/${code}`;
    return this.gateway.delete({ url });
  }

  public async saveHomeCard(cards: Record<string, unknown>[]): Promise<void> {
    const url = `${baseURL}/home-application-card/batch`;
    return this.gateway.custom({ url, method: "POST", payload: { cardModifyParams: cards } });
  }

  public async getUserMemoPage(query: UserMemoPageQuery): Promise<UserMemoPage> {
    const url = `${baseURL}/user-memos/page`;
    const resp = await this.gateway.get<LegacyServiceError<UserMemoPage>>({ url, payload: { ...query } });
    return resp.data ?? resp;
  }

  public async createUserMemo(payload: UserMemoModifyParam): Promise<number> {
    const url = `${baseURL}/user-memos`;
    const resp = await this.gateway.create<LegacyServiceError<number>>({ url, payload });
    return resp.data ?? resp;
  }

  public async updateUserMemo(id: string, payload: UserMemoModifyParam): Promise<void> {
    const url = `${baseURL}/user-memos/${id}`;
    await this.gateway.update<LegacyServiceError<void>>({ url, payload });
  }

  public async deleteUserMemo(id: string): Promise<void> {
    const url = `${baseURL}/user-memos/${id}`;
    await this.gateway.delete({ url });
  }
}
