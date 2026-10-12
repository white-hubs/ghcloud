import axios from "@/utils/axios";
// import qs from 'qs';

export async function getDictList() {
  const promises = [];
  let dictList = [];
  const promise1 = axios.restful(`GET:/device-types/all-graph`);
  promises.push(promise1);
  promise1.then((deviceTypes) => {
    dictList = dictList.concat(
      deviceTypes.map((item) => {
        return {
          children: null,
          code: item.code,
          name: item.name,
          parentCode: "",
          sort: item.sort,
          typeCode: "deviceType",
        };
      }),
    );
  });
  const promise2 = axios.restful(`/sys/dict-datas/all`);
  promises.push(promise2);
  promise2.then((dicts) => {
    dictList = dictList.concat(dicts);
  });
  await Promise.all(promises);
  // console.log(dictList, '-------------------');
  return dictList;
}
