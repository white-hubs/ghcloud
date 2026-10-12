import { storeArea } from "@/piniaStore/area";
import moment from "moment";
import { getDays, getHour, getMonth, getWeek } from './getTime';
import { reactive } from 'vue'
import { getMarketList} from "@/api/shennong/compre";

// 获取当前时间
export function getNowDateTime(format: string = "YYYY-MM-DD HH:mm:ss") {
  const nowDateTime = moment().format(format);
  return nowDateTime;
}
//将16进制颜色转为rgba
export function hex2Rgba(hex: string, opacity: number) {
  if (!hex) hex = "#2989FF";
  return (
    "rgba(" +
    parseInt("0x" + hex.slice(1, 3)) +
    "," +
    parseInt("0x" + hex.slice(3, 5)) +
    "," +
    parseInt("0x" + hex.slice(5, 7)) +
    "," +
    opacity +
    ")"
  );
}

export function getAreaCamera(area,name?:string) {
  if ((window as any).config.perspective) {
  let curItem = (window as any).config.perspective.find((item) => {
   if (item.area === area){
        return item;
     }else if (area.indexOf('-') !== -1) {
      if (area.indexOf(item.area) !== -1 && item.area.indexOf('-') !== -1) {
        return item;
      }else if(item.area === name){
        return item;
      }
     }
    });
    let curItems = (window as any).config.perspective.find((item) => {
      if (item.area === name || item.area === area){
        return item;
     }
    })
    if (curItems) {
      return curItems.camera;
    }else if (curItem) {
      return curItem.camera;
    } else {
      return null;
    }
  } else {
    return null;
  }
}

/** 获取视角配置 */
export function getPerspective(area,name?) {
  if ((window as any).config.perspective) {
    let curItem = (window as any).config.perspective.find((item) => {
      if (item.area === area || item.area === name) {
        return item;
      }
    });
    if (curItem) {
      return curItem;
    } else {
      return null;
    }
  } else {
    return null;
  }
}

/** 防抖 */
export function debounce(fn, delay, immdiate = false, resultCallback = null) {
  let timer = null;
  let isInvoke = false;
  function _debounce(...arg) {
    if (timer) clearTimeout(timer);
    if (immdiate && !isInvoke) {
      const result = fn.apply(this, arg);
      if (resultCallback && typeof resultCallback === "function")
        resultCallback(result);
      isInvoke = true;
    } else {
      timer = setTimeout(() => {
        const result = fn.apply(this, arg);
        if (resultCallback && typeof resultCallback === "function")
          resultCallback(result);
        isInvoke = false;
        timer = null;
      }, delay);
    }
  }

  _debounce.cancel = function () {
    if (timer) clearTimeout(timer);
    timer = null;
    isInvoke = false;
  };

  return _debounce;
}

/** 添加样式类 */
export function addClass(element: HTMLElement, cls: string) {
  if (!element.className) {
    element.className = cls;
  } else {
    let newClassName = element.className;
    newClassName += " ";
    newClassName += cls;
    element.className = newClassName;
  }
}
/** 移除样式类 */
export function removeClass(element: HTMLElement, cls: string) {
  if (hasClass(element, cls)) {
    let reg = new RegExp("(\\s|^)" + cls + "(\\s|$)");
    element.className = element.className.replace(reg, " ");
  }
}

/** 检查是否有样式类 */
function hasClass(element: HTMLElement, cls: string) {
  return element.className.match(new RegExp("(\\s|^)" + cls + "(\\s|$)"));
}

// 今日、本周、本月、本年 x轴数据
type TimeType = "TODAY" | "THIS_WEEK" | "THIS_MONTH" | "THIS_YEAR";
export function getXDataByTime(type: string) {
  let XData: string[] = [];
  switch (type) {
    case "TODAY":
      XData = ["4", "8", "12", "16", "20", "24h"];
      break;
    case "THIS_WEEK":
      XData = ["1", "2", "3", "4", "5", "6", "7天"];
      break;
    case "THIS_MONTH":
      XData = ["1", "5", "10", "15", "20", "25", "30日"];
      break;
    case "THIS_YEAR":
      XData = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12月"];
      break;
    default:
      XData = ["4", "8", "12", "16", "20", "24h"];
      break;
  }
  return XData;
}

// 获取x轴数据
/**
 * @param {type} 时间类型
 */
export function getXaxleData(type: string) {
  let XData: string[] = [];
  switch (type) {
    case "TODAY":
      for (let index = 0; index <= 24; index++) {
        if (index === 24) {
          XData.push(index.toString() + '时')
        } else {
          XData.push((index+1).toString()+':00')
        }
      }
      break;
    case "THIS_WEEK":
      XData = ["1", "2", "3", "4", "5", "6", "7天"];
      break;
    case "THIS_MONTH":
      for (let index = 0; index < 31; index++) {
        if (index === 30) {
          XData.push(index.toString() + '日')
        } else {
          XData.push(index.toString())
        }
      }
      break;
    case "THIS_YEAR":
      XData = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12月"];
      break;
    case "THIS_PERID":
      XData = ['0-4', '4-8', '8-12', '12-16', '16-20', '20-24h']
      break;
    default:
      XData = ["04:00", "08:00", "12:00", "16:00", "20:00", "24h"]
      break;
  }
  return XData;
}

/** 获取当前区域层级  */
export function getCurrentAreaInfo() {
  const piniaStoreArea = storeArea();
  const res = {
    build: piniaStoreArea.currentBuild,
    floor: piniaStoreArea.currentFloor
  }
  return res
}

// 处理内联样式px转换rem
export function px2rem(px: string){
  if(/%/ig.test(px)){ // 有百分号%，特殊处理，表述pc是一个有百分号的数，比如：90%
    return px
  }else{
    return (parseFloat(px) / 192) + 'rem'
  }
}
// 时间参数转换
export const setTimeType = (value:string)=>{
  if (value === 'TODAY') {
     return 'TODAY'
  }else if (value === 'THIS_WEEK') {
    return 'WEEK'
  }else if (value === 'THIS_MONTH') {
    return 'MONTH'
  }else if (value === 'THIS_YEAR') {
    return 'YEAR'
  }
  }

  export const getallNumber=(data,value)=>{
  let total=0
  if(data.length > 0) {
    for (let i = 0; i < data.length; i++) {
      total+= data[i][value];
    }
  }
  return total
  }

     /**
     * 数组拆分
     * size每组数组多少个，如：10
     * array需要拆分的数组
     */
     export const splitArray = (array, size)=>{
      let data = [];
      for (let i = 0; i < array.length; i += size) {
          data.push(array.slice(i, i + size))
      }
      return data
  }

export function getXDataByType(type: string, data: Array<any>): Array<any> {
  let XData = [...data], unit = ''
  switch (type) {
    case "TODAY":
      unit = '时'
      break;
    case "THIS_WEEK":
      unit = '日'
      break;
    case "THIS_MONTH":
      unit = '日'
      break;
    case "THIS_YEAR":
      unit = '月'
      break;
    default:
      unit = '月'
      break;
  }
  XData[data.length - 1] = XData[data.length - 1] + unit
  return XData;
}

// 请求一次之后自动分页
export const autoPage = (target, total, pages:number = 1) =>{
  if(!target.page){
    target.total = total
    target.pages = pages
    target.pageNumber++
    if(target.pageNumber >= target.pages+1) target.pageNumber = 1
  }else{
  
    target.page.total = total
    target.page.pages = pages
    target.page.pageNumber++
    if(target.page.pageNumber >= target.page.pages+1) target.page.pageNumber = 1
  
  }
  
}

export const TwoArray=(items: unknown[], size)=>{
  const results: unknown[][] = []
  let tempStackItems: unknown[] = []
  for (const item of items) {
    tempStackItems.push(item)
    if (tempStackItems.length === size) {
      results.push(tempStackItems)
      tempStackItems = []
    }
  }
  if (tempStackItems.length > 0) {
    results.push(tempStackItems)
  }
  return results
}
export const HData=(target, total, pages:number = 1)=>{
  

  
  if(!target.page){
    target.total = total
    target.pages = pages
    target.pageNumber++
    
    if(target.pageNumber >= target.pages+1) target.pageNumber = 1
    
    let start = (target.pageNumber - 1) *target. pageSize; 
    let end = start +target.pageSize;  
    return {
    start,end
    }
  }else{
  
    target.page.total = total
    target.page.pages = pages
    target.page.pageNumber++
    if(target.page.pageNumber >= target.page.pages+1) target.page.pageNumber = 1
    let start = (target.page.pageNumber - 1) *target.page.pageSize; 
    let end = start +target.page.pageSize;  
    return {
      start,end
      }
  }



}
 export const  getcurrentData=(risk,name,rank=true)=>{
  // log
  // if(!rank){
  //   risk.splice(0, 1);
  //   return true
  // }
  
  
  let currentName = risk.find((item) => item.marketName==name);
    
  let currentIndex = risk.findIndex((item) => item.marketName==name);
  
      if (currentName!=undefined) {
        risk.splice(currentIndex, 1);
        risk.unshift(currentName);
      return false
      }else{
        // risk.splice(currentIndex, 1);
      return true
      }

}
// 数组处理，前面几个展示，多余的展示为其他
export const setDeviceData = (data,colors)=>{
  const dataArr = []
  let other = 0
  data = data.sort((a,b)=>{
    return b.deviceNumber - a.deviceNumber
  })
   data.forEach((item,index)=>{
     if(index<=2){
      dataArr.push({
        areaId:item.areaId,
        name:item.areaName,
        value:item.deviceNumber,
        color:colors[index]
      })
     }else{
      other += item.deviceNumber
     }
   })
   if (data.length > 3) {
    dataArr.push({
      name:'其他',
      value:other,
      color:'#19F8F7'
    })
   }
   return dataArr
}
export const isHttpUrl = (url:string):boolean => {
  return url.includes('http') || url.includes('https') 
}
export const getFileType = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  if (!extension){
    return 'unknown';
  } else {
    return extension
  }
  
};
export const filterMarket = (records: any[], fieldName?: string): any => { 
  const piniaStoreArea = storeArea();
  let marketV2List = piniaStoreArea.marketV2List
  try {
    const marketNameV2 = marketV2List?.map(e => e.marketName + '')
    const marketTenantV2 = marketV2List?.map(e => e.marketTenant + '')
    const newRecords = records?.map(e => {
      const marketName = e?.marketName ?? e?.[fieldName]
      const marketTenant = e?.marketTenant ?? e?.[fieldName]
      if (marketNameV2.includes(marketName + '') || marketTenantV2.includes(marketTenant + '')) {
        return e
      }
    })?.filter(e => e)
    return newRecords
  } catch (error) {
    return records
  }

};
export const filterMarketOptions = (marketList: any[]): any => { 
  try {
    const marketV1 = window?.config?.feature?.subMarketV1 || [];
    const tenantV1 = marketV1?.map(item => item.tenant)
    const marketOptions = marketList.filter(item => item.status)?.filter(item => !tenantV1.includes(item.marketTenant+''))
    return marketOptions
  } catch (error) {
    return marketList
  }
};

/** 动态计算fontSize */
export function calcFontSize(size:number){
  const clientWidth = window.innerWidth||document.documentElement.clientWidth||document.body.clientWidth;
  if (!clientWidth) return;
  let fontSize = clientWidth / 1920;
  return size * fontSize;
}
export const fallback =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAYoAAAGSCAIAAABymRGxAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAEXRFWHRTb2Z0d2FyZQBTbmlwYXN0ZV0Xzt0AACAASURBVHic7d35V1zlwcDx5947+wzMwjDDDJiFBFNMa6JWoxE1jZpYt7S21rrV2mNP+zf1tPV42lNtrdq41KXRmJqgZjshISQGQsgGhLAz+3Lv+8Nj5p0OS0gM8ADfzw8eGGaGC2a+PPe5z72jWZYlAEA9+kJvAABMzZZKpRZ6GwBgCoyeACiKPAFQFHkCoCjyBEBR5AmAosgTAEWRJwCKIk8AFEWeACiKPAFQFHkCoCjyBEBR5AmAosgTAEWRJwCKIk8AFEWeACiKPAFQFHkCoCjyBEBR5AmAosgTAEWRJwCKIk8AFEWeACiKPAFQFHkCoCjyBEBR5AmAosgTAEWRJwCKIk8AFEWeACiKPAFQFHkCoCjyBEBR5AmAosgTAEWRJwCKIk8AFEWeACiKPAFQFHkCoCjyBEBR5AmAosgTAEWRJwCKIk8AFEWeACiKPAFQFHkCoCjyBEBR5AmAosgTAEWRJwCKIk8AFEWeACiKPAFQFHkCoCjyBEBR5AmAosgTAEWRJwCKIk8AFEWeACiKPAFQFHkCoCjyBEBR5AmAosgTAEWRJwCKIk8AFEWeACiKPAFQFHkCoCjyBEBR5AmAosgTAEWRJwCKIk8AFEWeACiKPAFQFHkCoCjyBEBR5AmAosgTAEWRJwCKIk8AFEWeACiKPAFQFHkCoCjyBEBR5AmAosgTAEWRJwCKIk8AFEWeACiKPAFQFHkCoCjyBEBR5AmAosgTAEWRJwCKIk8AFEWeACiKPAFQFHkCoCjyBEBR5AmAosgTAEWRJwCKIk8AFEWeACiKPAFQFHkCoCjyBEBR5AmAosgTAEWRJwCKIk8AFEWeACiKPAFQFHkCoCjyBEBR5AmAosgTAEWRJwCKIk8AFEWeACiKPAFQFHkCoCjyBEBR5AmAosgTAEWRJwCKIk8AFEWeACiKPAFQFHkCoCjyBEBR5AmAosgTAEWRJwCKIk8AFEWeACiKPAFQFHkCoCjyBEBR5AmAosgTAEWRJwCKIk8AFEWeACiKPAFQlG2hNwDXplgsFovFfD6fz+cXelsWGdsVhmFomrbQm4OrI0+LiWVZ+Xw+k8kkEolEIrHQm7PIuN1uzxULvS2YFfK0aFiWVSwWRkZGhoaGkslkMplc6C1aZGSeIpGIy+UyDGOhNwdXR54WC8s0zVwu19/f39XVVSgUCoXCQm/SIuNwOOx2u67r4XCYPC0K5GlxsCxRLBay2ez4+Pjg4OBCb86ipOu6YRgTExOZTEbTNGag1MeRu8XBsqxcLp9Opxk0XTfLsorFopy5y2azlmUt9BbhKhg9LQ7ypZXPF4rF4kJvy2JlWZZlWYVCIZfLFQoF8qQ+Rk8AFEWeACiKPAFQFHkCoCjyBEBR5AmAosgTAEWRJwCKIk8AFMWqcfw/TdM0TZPLqVlUjQVHnvAtTdMcDofNZisWi4VCwTRN0zQXeqOwrJGnZU3TNP0KwzDcbrfT6czlcvl8Xl6zxbyCwRTmH3la1ux2eyAQCAQCPp/P6/XKC92WXy94dHR0dHQ0lUql02kKhXlGnpYpOc3kdDrD4XA8Hq+trQ0EAqWvyqsGZ7PZixcv6rouhMhkMuQJ84w8LVN2u726ujoUCkWj0ZqaGpfLVf5VebU2p9NZU1Njt9t0XU+lUrlcrlgsEinMG/K0TNlstmAwGIvFIpFIKBSafAfDMAzDCIVCfn91KpW6fPmyaZpcbQrziTwtU4ZhuFwuj8djt9tnuJuua0LY3G6P3++3LCuXyzF6wrxhWeYypeu6fOcSm22mP1Ga9u0RvUAg4HK55DwUMD/417ZMydGTPFp31TvLqSjahHnGzt0yJUdPXq93lncmT5h//INbpkzTzGQyqVRqNm/9It+IgVknzDPytEwVi8V0Op1MJvP5/FXvLI/ZcY4L5hl5WqauafQk3/6TheOYZ+RpmbqmPGUymdHR0XQ6zQAK84mp8WWqUCiMjY05HA6n02m32+V/y+9gWaZpWolEIplMDg8P8wbFmH/kaZnK5/NjY2OWZbndbrfbrWlaRZ5M0yoWCyMjI319fUNDQ5lMhusWYJ6Rp2VKnvSbTCYvXbqUy+Wqqqo8Ho9cQCC/ms1ms9nMyMjI8PBIIpGgTZh/5GmZsizLNM10Ot3f3z80NOR0Ol0ul8PhkGMoy7ISiUQiMVEoFOUxO9qE+Ueeli/LsuRpdPl8PpfLZTIZm80mF5FblpVOpzOZzA3/prqua1ewWAEzI08QlmUVCoVisSirIW+ci3CULs4p16DLLN7w74IlgzxBiCsjqbn+Lrqu+/3+6upqu91usxnDwyMjIyOyjHP9rbEYkSfMH5vNVltb29DQ4Ha77Hb7mTNnMplMJpMhT5gSecJ8MAzD4/EEAoHa2tpwOOx0Og1DD4drM5ns0NBQPp9n9h2TkSfMB5vNJi9qHg6HfT6fvPhBTU3IMAzTNEdHR4UQjKFQgTxhbum67nA4qqqqwuFwJBKpqqoqrV3weLyGYUsmk5lMZmxsTC4TXejthULIE+aWYRg+n6+mpqampiYYDJaufifXqeu6XldX53K5zpw5MzExwQAK5cgTKsmj/t/9jQ80TbPZbF6vNxwO19XV+f1+p9NZfge5yKCqqsrhcCQSibGxsWQyyXURUEKe8D/koMbpdH73A2qli5THYrF4PF7xXlUlcgwVDocLhUJfX19/fz/nHkMiT/iWfFdOp9NZVVXl9XpHRkZGRkaub2G3XH7pdrtDoVA0Gqmpqamurp7uznIMJe+Qz+cTiUQ6neYtYSDIE0oMw/D7/eFwOBwOBwKBnp6eTCaTzWaz2ey1PpWu606n0++vrq+vj8XqfD7fVR/idrttNls6nU6n00NDQ7KM1/VzYOkgT/h2ksjtdtfU1MRisZqaGr/fn0qlUqlUaQA1+zGUpmkOh0MucaqtDQeDQV03rvoou91ut9uDwWA+n5fXS8hkMoVCgTHUckae8O3BtVAoFIlEotGo0+nUdb22Nuxw2Ht6zspdrVnmSb7llNfrjcfjsVisqqraMAwhtFluic/ns9lsMk+jo6OJRIIx1HJGnpY1OUkkBzuRyP9MEvl8VW63J5lMjY+PT0xMTExMzGZht91u93q9NTU1kUgkHA7b7XZNu4YLRrtcLpfLlclk0umUvCJVNptlQfmyRZ6WNbkj5vP5IpHaeDzm8/3/297puq5poqamRghx4cIFeTHfq45lPB5PQ0NDLBbz+/3ykNx1bFVVVVVDQ4MQWiaTkSMp8rQ8kaflS045yfXcNTXhUChUPkmkaZqmGdXV1Q6HI5PJjI+PJ5PJVCo1XSkMw3A4HH6/v66uTu4hygtvXge32+10OrLZXDKZFEIUi0U5IXV9z4bFizwtU3K3zuPxxOPxhoZ6vz+g60bpYk8lcgQUiUSEEH19fRcvXpxuUZLH46mtrS0tv7zuNl3ZNiMYDOq65nA4crncLHctscSQp+VITmDLNZPRaDQWi+n61O9RbhiGYRjBYNDhcOTzefl2UhVjGV3XbTZbdXW1HDeVzqr7LpunaZrP5/N43Pl8YXR0VL5pKO9UvNyQp2WnfNwUi9UFAv4px03lHA6Hpmm1tbWFQmFgYGBwcLD8vYVl5urq6sLhcHV1demsuhuxnUYg4F+9epXL5ert7U0mk4yhlhXytOxcWTPpr6uri8frXS7XVSew5TXIQ6GQruvFYlHuapmmKUvn9XojkUgkEgkGgx6P50Zt55UxVJXNZrcskUgkCoVCNptlqcHyQZ6WHafTGY1G6+rqgsGgy+Wa/SSRy+UKBoPJZHJiYkIuSrLb7T6fT045hUKh77hPNyXDMFwuVyAQiMfjhmFcvnw5lUrd8O8CNZGnZaS0ZjISicRiMXlUbvYPl2fkhUIhefwun8/LhebyApizOXPlOsjJr+rqarl4PZlM5nI5JqGWCfK0jMjhj1ww6fP5rm+wIxclORwOm83m8bgjkWgoFLqmzF0HuWShUCjk83mHwzEyMpJOp+f0O0IF5GlZkPM4bre7tCPm9Xqv/rCpeL1er9crTz3xeDzRaNTj8XyXZQSzIc/I0zRNDprkucrz8+4yWEDkaVmQ55rIy+nKVQLf8Qk9Hk8sFrPZbPIEvRuykVflcDiCwaBcZGBZltzRm59vjQVBnpY+eSGn0rukBAKB7/6cHo/nBh6kmyWHwyHDmkql8vm83NdjALWEkaclTg5wQqFQfX19JBKZ7pKVi4jL5YpGo5qmyTzl83mWGixV5GmJk8f+a2pq6uvrQ6HQQm/ODSCvamAYxtjYWCKRsCyLPC1V5GnJMgzDbreHQqF4PBaJRJfAuKmc2+1uaKi32+39/f3Dw8OMoZYk8rRk2Ww2uZLgpptWhEKhuT64Ns/cbnd9fYPb7cnlcnIdFnlaesjTEiTPNamqqopGo9Fo1ONxG4Y+81l1i46maYahezzuaDRqWdalS5cKhQJn5C0x5GkJ0nXdMAy5frKmpsbt9szmat+Li7wcldvtiUajNpstlUqNj48L3gl9aSFPS5CcC5enrczmjN/FS9d1l8tVXV0dj8c1TRsaGhobG1vojcINQ56WoKqqqpUrV8rLm8jF1gu9RXNFXihdXh9dXriOPC0l5GkJKhaLuVxOXoFkCQ+dSkzTzGQy8lThhd4W3EjkaQkqFAryym1LeNxUwbIs+WYNC70huJHI0xKUTqcHBwdv1FUrF4tCocBlDJaY5fUveJlIpVLZbHb5DJ0klj4tPeRpCbqm9xwHlLX0500BLFLkCYCiyBMARZEnAIoiTwAURZ4AKIo8AVAU654WB/kOmna7fYldVW4+yXfTstvtTqfTZrMtt2WrixF5Whw0TXM47G63a7mdqnID6bqu67rT6fT5fC6Xizypj3/ri4OmCcOwOZ0uv98fiUTkO5SYpslpHLOh67qmaS6Xy+l0VldXO51OBqGLAnlaLDR5baNYLOZwOMbHx8fHx7PZbCaTWegNWwTkmwxXV1f7/f6amprlcJGZpYE8LRpy+snv98vdE6/XS55mqTxPHo+HPC0W5GkxkTO7uq7LF1uxWGTnbjbkrJOMFJPii4iWTCYXehsAYAqMcgEoijwBUBR5AqAo8gRAUeQJgKLIEwBFkScAiiJPABRFngAoijwBUBR5AqAo8gRAUeQJgKLIEwBFkScAiiJPABRFngAoijwBUBR5AqAo8gRAUeRpIfX29u7atWtiYmLyl/L5fG9v73QPPH369J49e+b0XaRM05y8SR988EFHR8d3f/ITJ068++67g4ODV72nZVl79+7t6empuL2rq+udd95JpVJCiPHx8XfeeefMmTNTPkNbW9vevXvz+XzF7WfOnNmzZ08ul7ueHwDzgjeSmis7d+68fPnylF/68Y9/XF9fL4To6+vr7OyMRqPHjx/fsmVLXV1d6T7vvPPO0NDQ5s2bN2zYMPkZ2tvbe3t7N27c6HK5Kr7U29v73//+95o2devWrZFIpPyWtra21tbWBx544JZbbindaJrmuXPnTNMsv/H65HK5ixcvHjx48JFHHpn5nj09PceOHRsbG1u1alX57b29vf39/blczuPxTExM9Pf3Dw8Pr169evIzHDhwIJ/Pb968ueL29vb2CxcubNy40eFwlN8+MTEx+X9cfX393//+d8uyptxIwzBeeOGFmX8QXAfyNFfkmEi+qLq6uvx+f21tbTqdvnDhgvybL4SQ/9wdDsfY2Ni///3vl156qfTm2i0tLR988EFra2symZz80pJjgYrXlZRMJkdGRnRdt9mu/j9XvlPe2NhYRZ6+y9vn9fT0fPTRR83NzQ888IAQYu/evZMHXPIHP3PmzB/+8IfJz/Dyyy/b7Xb5sXyszWaTH9jtdq/Xe/ny5b6+PvlV+akQ4sKFCzabLRgMrlixovRUo6Oj+Xze6/XO/q03T506tX///oobH3rooWQyaRiGx+MRV/7nVlVVCSGSyWRppDk6OvrGG2/EYrEdO3bM8tthBuRpDvn9fsMwWlpauru7161bl81mY7HYhQsXSneQr1KPx3Pfffft2bPn888/f/DBB+WX4vH4c889949//KOtrS2TyWzdurX8mWWeSq/hye6+++7SsKutre2rr75qaWlZv359xd3kKOlG/KzfMk3zs88+0zRt06ZN8pZkMlksFgOBwGwCMTY2VlHGixcvCiG6u7u7u7uFELquRyKR/v7+0vaX7tnb29vb2xuJRMrz1NXVJYTI5/O7d++Wt+i6Lrs5naamJvmL3bdvn91uv+uuu4QQtbW1QoiGhoZHH31UCPHHP/5R13U5YnrrrbcGBgbkYwOBQH19/YULF86fP3/TTTdd9efFzMjTHNI0rbu7OxaLyU/b29vvvvvu8juU/urecsstx44dSyQS5V/1er2//OUv33zzzZUrV1Y8s3wNz2Z8NDEx8eWXX1qWdejQoaNHj5Zu37p1azQavfaf6SoOHTqUzWabmpoq9jqfeOIJn88nhDh79mx7e/u2bdtkAjo7O8+ePdvS0iLv/95775Xnu62trVgsxuPxdevWyVsMw4hEIqlU6siRIz09PQ899JDP5xsYGGhtbV23bl1zc7Pb7S7/vnJCKpfLnTx5snTjzHmqrq6+9dZbhRCtra2GYciPJ09dTaelpeWNN97YtWvXyy+/PMuHYDrkaW6tXLmys7NTCDE6OlooFOSUkxBCzgrLfYTh4WG3271ly5bJE0lut/tXv/rV5KctFApCiEwmM/kh5UZHR9955x3Lsnw+n9/vF0JYliVn3Gczlunt7S1/fvkSHR8flwMZIYSmaRXTPcePHxdC/OAHP6h4KsMwisXi7t27Ozs7NU3r7++Xg4v29vb+/v6urq4NGzbcddddLper1NxisXjgwAFN07Zt21YRHb/fL3+rtbW1gUBAVt7v95f+EkimaQ4NDWma9swzz8g3Ln/zzTcr3sE8kUjI38xsnD9//rXXXiv9KuTH6XS6/D7BYNDlcmUymYGBgYpdZlwr8jS3NmzY0Nvb29fXZ7fb77jjDhkF0zTffPPN0n1Ku1d+v/+5555LJpNHjhwpfXX9+vWBQKDiaeXxpm+++WbKiXPp9OnTu3btMk1T07RkMnnHHXesW7fuX//6lxCisbFR7q3MrLOzU1ag3Pj4+Mcff1z69IUXXpBTMEKIRCKRTqftdnv5uGz79u1CiBMnTrS2tuZyOa/Xu2PHDp/P193dXVVV9dOf/rS7u/vzzz8/cuTI8ePHt2/f/vDDD8sHHjx4MJ/Px+Px8vGUx+M5deqUEEJGtrW11e12y1FnZ2fn+Pi4pmn33nuvHJodOHDAsqybbropGAwKISYmJgqFQjweL/9x3nvvvYceemjt2rVX/W0IIXRdL+1Qa5omP85kMhVT5o2NjR0dHSdPniRP3xF5mkODg4M7d+4UQhSLxY6ODsMwZHd0Xd+wYYNpmqdOncpms6FQSI6qZIaGh4fL98Kqqqoq8pTL5eTO3cx5unjxomVZDz74YDwef+utt/bs2dPa2ipf8KUEzGzFihWl4d50yodXMhwVW3vy5Mkvv/wyk8lomnbLLbfcd999mUzmb3/7m2zKI4880tjYuHr16v379x8+fPj9999vamrasmWLzWaTs/sOh2PXrl2lZ6urqytNPAkhzp49W/p4ZGRkZGRECHHbbbf5/f5MJiN/26WRlxz0Vewp67r+n//8Z2BgoPz4Q2nFg2mag4ODNpvN6/UKIerr68vnnp577jnxv3NPUjwe7+jo6Onpuf/++2f+7WFm5GmurF+/Xr5aTNPs7Oz0eDyll3pNTU1TU5MQ4ty5c9ls1uPxtLS0lB5YV1f385//XAhx9uzZAwcOTH7m0otnaGgon89PN0F+//3333HHHW63+5tvvnE4HKlUSu6SyO1Zu3Zt6SjhZHJ3afXq1de0hmBoaEhuf/mNx48fz2Qyq1evvv/++z0ez6VLl9599105ihkYGPjoo4/k4olNmzY1Nja+//77Z86cufPOO/1+/5133nnHHXeMjY35/f62trbGxsa1a9fKXaeZN0P2aPfu3fKnkJPrQgi5eKpigcJPfvKTTz75pK2tbWBg4PHHH7fZbOPj46WxbS6Xkx+/8sors/89NDQ0iEk7fbgO5GmuNDc3yxwUi8XOzs66uro777xTCKFpmpwkFlfmni5dulT+QLvdLve8RkdHp3xmeRzdbrfn8/murq7m5ubJ9ykWi59++mlfX18ikbAsyzCMpqamdevWHT58WK4Y2r17dzweD4VCU34L+dKa4cjglOSCidK+nvTkk0+mUik5v3P06NHW1lbLsjZu3HjPPffIELS2tnZ3d2/btq22tvbFF1/MZDKl34+u68FgMBaLtbW1hcPhNWvWyNsPHjw45ZLOmpoa+Uu+fPmyjFEgEBgdHU2n05qm9fX12Wy2isGd0+mUxx/6+vr++te/Pv/88y6XS86dHTt2zDCM8kCfP3/+z3/+s7gy9yQ/zmazFZsh+2iapmVZFVNduCbkaa58+OGH5bshXV1d8iC3EOLZZ58NBAKpVEr+ec/n88lkUu4+zIZ84T3wwAO7du06derUlHkyDOPSpUu5XO7mm29ubGzcvXt3Npt1u907duxIJBIdHR2dnZ1DQ0PT7bvJPB08eFDur022bt26yfM18lFyZVCJ3W6vrq4+duzYgQMHstmsPK4vt7m6uvr5559/7733+vv7//KXvzQ3N2/evLnUJiHEp59+almWjPjJkyflaPSee+7p7Oycst0DAwMyT3I9/YYNG2Kx2EcffdTW1pbNZi3Luvnmmyc/ymaz/eIXv/jnP/9pmqYsshzMtre32+12+XE+ny/vWjab1TRNZsjtdk/uuDwUkE6nK34buCbkaa7ce++9w8PDQohCofDFF1/U1dWVOiJLJOMVDocHBwfPnDnz/e9/fzZPm06ne3t77XZ7U1PTkSNH+vv7TdOc8jCcnBkRQqRSqXA4fO7cuXPnzgUCgbuuEP+7bqicLMLo6Oh0Izin0zk5T/J4Yvlr1TTNtra2Q4cOyeHGihUrHnzwwfK9M5fL9fTTT58+fXr37t0dHR0nTpxYvXr1pk2bZAvK4zg+Pj4+Pi6E2LhxoxBC1/Xf/e535d/9T3/6U+njm266afv27Y2NjXLk2N7eXiwWy1djVTAM4+mnn57hBBe73f7ss8+WPpVzT+W3VNB1vVgsykXt090HV0We5orD4QiHw8ViUQ7+LcvKZDKpVCqdTrtcrlWrVsk8tbS0vPvuu2fPnp1lng4ePCiEkHsct95662effXb8+PHJB/JL5B/wJ554IpVKffnll11dXfv37y/tJU1neHhY1/WXXnpp8peGhobefffdKR/lcrkmJibK51z6+vq++uorIURVVdXExITcgZrysfLgl81m6+7uTiQSP/vZz8SVGZ+enp5du3bdfvvtt99+uyjLX0VNJh8+E0JomrZu3Tq54nzyaqxyuq5P91XTNLPZrIxj6Rbxv3vlwWCwfBG/PHYx+xExpkSe5sobb7xR/oK5dOmS/NdsGEYwGFy1atU333yj63osFqurq+vt7Z1hkjuRSOzfv3/r1q2WZcnlhXIE0dTU9Pnnn3/99dfr16+fcgCVTqdfe+01Xdej0eiaNWvuvffe+++//6onrIyPj8up6ylfrlOeSSPJnZ3yPNXX1z/wwAMNDQ2mab7++uti0nG9ksHBQYfD8Zvf/ObUqVNyallcKZFcCWWz2SrGZeXDpRm2TR5HE0L88Ic/nG7Lp1MoFHbu3NnX13fnnXdWnOlSLBbffvvt0qdbtmwp38uW/brWyTtUIE9z5b777stms4FAwOl0OhwOy7IcDoecZlq1alVPT08mk5HLCJuamnp7e/ft27dly5bJzzM8PLx///5CobB169YvvviiUCjU1tbKXQZd19etW3fixImDBw/KnbUKNptt06ZNp0+f7uvr6+3t/eKLLzwez4oVK9auXdvQ0DDdrK08Hi+PLV4TOW1UcT6tHOjJncTVq1eXztqp8Oqrr8olWqUF4jPTNK1ivNne3j75bkNDQ5999pn8+MMPP3zmmWeuuh51dHS0q6tLLssoFAq9vb3yPL7yheNHjhzRdV0uKJfKV4SWjl3M5gfBDMjTXOnv7z916tSOHTt27tz5+OOPf/zxx/F43DCMs2fP/va3v5UrBuROWVNT0969e0+cOCEX7JSeQf4FPnHihBBi8+bNR48ePX78uKZp5RVraWnp6uo6fPjwzTffPHlgYrfbb7vttttuu800zfPnz3d2dp47d+7kyZMnT558/vnnq6urJ292oVCQ3/E68rRixYqOjo7prtPw3Q0NDe3bt0+uDNA0rXw1hhDim2++qbj/4ODgv/71L9M0V65cmU6nBwYGXn/99bvuukv+aLFYLJvNTh5wdXR0yCm5cDh88803Nzc3y/uUL2Rtb2/Xdb3iFKUSuWR0uqOimD3yNFf6+/udTqf8N3r58uVwONzb27t9+/bu7u7Dhw8PDg76fD45B2S32zdt2tTa2rpr1y455yLJE0RsNttjjz2Wy+U+/PBDIcT27dvD4XDpPjab7Uc/+tEnn3yyc+fOF198sTQ0OH/+/ORhQjQajUajiURiYGBALmgsX5AtffbZZ6Zprl279jr++K9cuVLTtEQiUSgUpjwf8NKlS4cPH57ysXLqesovyVf7oUOH5O6VXIptmuaePXvK71YoFMq3+fDhw19//bUQIh6PP/roo6Zpvvfee/ICW3v27FmzZk0oFLr99tvldQg0TSsUCqZper3eW265JRAIlE4MFkLkcrmKxR9y0cD58+fLbywNSM+dOyeEmOVKdMyAPM0JeTi8vr5eTt9MTEysXLmyr6/P4/HYbDb5MrvvvvtK99+wYYNcGXjx4sXSwf66urpUKvXUU085HA45z7J58+bJlzRas2ZNNBq9dOnSsWPHSovIz58/X/HiqTDlte7a29tPnz7tcrkqLpAwQFMLYAAAA8FJREFUS7qu19bWDgwMnDp1asr1nGNjYzIZU5puVkv+ILquNzc3b9y4saqqSp7oO8OF8fr6+uQ3+t73vicHm7qu79ixo7+/v7W19fLly+VnCJdomvb73/8+EAhUjEP7+/s/+OCDyfd///33yz995ZVX7Ha7aZrydzvLvVTMgDzNiYmJCU3T5OldXq/X5XKtXbt2bGzM4XA8+eST/f39HR0dFcuXH3744Y8++qh8ZLRp06a7775bDoI2bNiQzWanO4Vl27ZtH3/8sdxVlPdvbm6ezcvj9OnTx44dK30ajUYdDscTTzwxw4LymbW0tLz99ttHjx6dMk8NDQ1yXdJkU77+pQcffFBO2JXfOPnAYvkxwVgstmLFivXr11c8qq6u7qmnnhJC9PX1DQ0NpVIpeSxVHgSc7tzgYDB41Wl1wzDkgPHUqVOmaTY2NjqdzpkfgqvSksnkQm/D0mSapmma013zZMrFSotlkXE+n9d1fbqEffDBB+fOnXvsscfKr7skhCgWi7quT/cDyom2WV40bso75/N5TdNmc5GZuWOa5quvvlooFH7961+Tp++O0dNc0XV9hhfblF9aFG0SVzsmtXXr1n379lVcu0oIMfOIbPZXs5zuziocKRsfH1+5cuWqVato0w3B6AmAoninFgCKIk8AFEWeACiKPAFQFHkCoCjyBEBR5AmAosgTAEWRJwCKIk8AFEWeACiKPAFQFHkCoCjyBEBR5AmAosgTAEWRJwCKIk8AFEWeACiKPAFQFHkCoCjyBEBR5AmAosgTAEWRJwCKIk8AFEWeACiKPAFQFHkCoCjyBEBR5AmAosgTAEWRJwCKIk8AFEWeACiKPAFQFHkCoCjyBEBR5AmAosgTAEWRJwCKIk8AFEWeACiKPAFQFHkCoCjyBEBR5AmAosgTAEWRJwCKIk8AFEWeACiKPAFQFHkCoCjyBEBR5AmAosgTAEWRJwCKIk8AFEWeACiKPAFQFHkCoCjyBEBR5AmAosgTAEWRJwCKIk8AFEWeACiKPAFQFHkCoCjyBEBR5AmAosgTAEWRJwCKIk8AFEWeACiKPAFQFHkCoCjyBEBR5AmAosgTAEWRJwCKIk8AFEWeACiKPAFQFHkCoCjyBEBR5AmAosgTAEWRJwCKIk8AFEWeACiKPAFQFHkCoCjyBEBR5AmAosgTAEWRJwCKIk8AFEWeACiKPAFQFHkCoCjyBEBR5AmAosgTAEWRJwCKIk8AFEWeACiKPAFQFHkCoCjyBEBR5AmAosgTAEWRJwCKIk8AFPV/aQP6rs/K2PEAAAAASUVORK5CYII=";
