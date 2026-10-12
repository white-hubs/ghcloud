import {
  makeCreateRequest,
  makeCustomRequest,
  makeDELETERequest,
  makeGETRequest,
  makeListRequest,
  makeUpdateRequest,
} from "@ghcloud/cube-gateway";
import type { DictionaryGateway } from "@ghcloud/cube-service-interface/dictionary";
import type { CascadeDictionaryItem } from "@ghcloud/cube-service-interface/dictionary";

export const getDictionaryItemByCode: DictionaryGateway["getDictionaryItemByCode"] = async (code) => {
  const resp = await makeGETRequest({
    url: `/gw-bff/dictionary/items/${code}`,
  }).send();
  return resp.json();
};

export const createDictionaryItem: DictionaryGateway["createDictionaryItem"] = async (params) => {
  const resp = await makeCreateRequest({
    url: `/gw-bff/dictionary/items`,
    payload: { ...params },
  }).send();
  return resp.json();
};

export const getOrCreateDictionaryItem: DictionaryGateway["createDictionaryItem"] = async (params) => {
  const resp = await makeCustomRequest({
    method: "POST",
    url: `/gw-bff/dictionary/items/get-or-create`,
    payload: { ...params },
  }).send();
  return resp.json();
};

export const getDataDictionaryByItem: DictionaryGateway["getDataDictionaryByItem"] = async (params) => {
  const resp = await makeListRequest({
    url: `/gw-bff/dictionary/datas`,
    payload: { ...params },
  }).send();
  return resp.json();
};

export const createDataDictionary: DictionaryGateway["createDataDictionary"] = async (params) => {
  const resp = await makeCreateRequest({
    url: `/gw-bff/dictionary/datas`,
    payload: { ...params },
  }).send();
  return resp.json();
};

export const updateDataDictionary: DictionaryGateway["updateDataDictionary"] = async (params) => {
  const resp = await makeUpdateRequest({
    url: `/gw-bff/dictionary/datas`,
    payload: { ...params },
  }).send();
  return resp.json();
};

/** 级联字典树；与旧 visual-config 一致走 /api/dictionary */
export const getCascadeDictionaryItem: DictionaryGateway["getCascadeDictionaryItem"] = async (params) => {
  const resp = await makeGETRequest({
    url: `/gw-bff/dictionary/getCascadeDictionaryItem`,
    payload: { ...params },
  }).send();
  const data = (await resp.json()) as CascadeDictionaryItem[] | { data?: CascadeDictionaryItem[] };
  if (Array.isArray(data)) {
    return data;
  }
  return data?.data ?? [];
};
