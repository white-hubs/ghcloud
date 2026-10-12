import { MockMethod } from "vite-plugin-mock";
import {Random,mock} from "mockjs";
import moment from "moment";
import panelConfig from "./panelConfig";
export default [
  {
    url:'/api/electricity/sub-item',
    method:'get',
    response:() =>{
      return {
        code:200,
        message:'success',
        data:{
          'data:|4':[{
            'id|+1':1,
            'name|+1':['空调用电','照明插座','动力用电','特殊用电'],
            'value|600-1000':100,
          }]
        }
      }
    }
  },
  {
    url: "/api/business/panel",  /**这里只能是string格式 */
    method: "get",
    response: (data) => {
      const query = data.query;
      let panel = panelConfig.find(item =>{
        if(item.areaLeave == query.areaLeave && item.menuId == query.menuId){
          return item
        }
      })
      return {
        code:200,
        message:"success",
        data:panel
      };
    },
  },
  {
    url:"/api/inspection/record",
    method:"get",
    response:() =>{
      return {
        code:200,
        message:"success",
        'data:|5-10':[{
          'id|+1':1,
          'level|1':['消防设备','电气设备','档位','监控设备','动环设备'],
          'status|1':[true,false],
          'time':moment().format('YYYY-MM-DD')+" "+ Random.time('HH:mm')
        }],
        total:4
      }
    }
  },
] as MockMethod[]