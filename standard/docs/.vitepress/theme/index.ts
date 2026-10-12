import { h } from 'vue'
import type { EnhanceAppContext, Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import './style.css'
import { Layout } from '../../code/components/layout/layout'
import { DemoPreview } from '../../code/components/demo-preview/demo-preview'
import { CubeAuthService } from '@ghcloud/cube-auth-service'
import { CubeTerminalEnum } from '@ghcloud/cube-protocol'

export default {
  extends: DefaultTheme,
  Layout: (): JSX.Element=> {
    return h(Layout, null, {
    })
  },
  enhanceApp: async (ctx: EnhanceAppContext): Promise<void>=> {
    if (typeof sessionStorage === 'undefined') {
      // @ts-ignore
      global.sessionStorage = {
        _data: {}, // 用于存储键值对
        getItem (key): string | null {
          return this._data[key] || null; // 如果键不存在，返回 null
        },
        setItem (key, value): void {
          this._data[key] = String(value); // 将值转换为字符串并存储
        },
        removeItem (key): void {
          delete this._data[key]; // 删除指定键
        },
        clear (): void{
          this._data = {}; // 清空所有键值对
        },
      };
      const mockStorage: Record<string, string> = {
        'GH-Token': '{"access_token":"eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5hbnRzIjpbIjU4MTk3MjYwIiwiNTk5OTYwNTIiLCIxODMyMTYwMiIsIjgyOTcwMTQwIiwiNjIyMjA4OTciLCI0NjI0MjcyOCIsIjQ3NTc4MTYxIiwiNjA1MTYyNjgiLCI1NTc2NDM1IiwiMzUzNzk4MjkiLCI3MjczNDIxMSIsIjQzOTUwMjQyIl0sInBhc3N3b3JkX2V4cGlyZWQiOmZhbHNlLCJ1c2VyX25hbWUiOiIxNzMxMTM2OTc4MiIsImFkbWluIjpmYWxzZSwicGFzc3dvcmRfZm9yY2VkIjpmYWxzZSwiYXV0aG9yaXRpZXMiOlsiMTY1MTgzODAzNDk1NTU0NjYyNSIsIjE2NTE4MzMxMTE5ODc2OTU2MTciLCIxNjUxODQ0ODc4MjcyOTAxMTIxIiwiMTc3Njg3MDU4NDIyODA2NTI4MiIsIjE2Mjc0ODM5ODE3NDAwNTY1NzgiLCIxNzcwMjY3OTU1MjgwNTU2MDMzIiwiMTgxMzEwNTk2NTM1NTcwODQxNyIsIjE3OTM0NDA4NTk5MDgyODg1MTMiLCIxODE1Mjg3NDQ2MTY2ODM1MjAxIiwiMTY1MTg0NTU1NDYyOTU4Njk0NSIsIlJPTEVfQUNUSVZJVElfVVNFUiIsIjE2NTE4NDY3OTE2OTM0MTQ0MDEiLCIxNjUxODM3NTIyOTgyMDIzMTcwIiwiMTc3MjgzMTU5MDg3NjAwMDI1OCIsIjE2MDI4NDc4MjY2Mzc4MjgwOTciLCIxNjU0MDM4MTQ1MjY5ODM3ODI1Il0sImNsaWVudF9pZCI6ImNsaWVudF8yIiwicGFzc3dvcmRfZXhwaXJhdGlvbl9yZW1pbmRlZCI6ZmFsc2UsImFkbWluaXN0cmF0ZWRfdGVuYW50cyI6WyI1ODE5NzI2MCIsIjU5OTk2MDUyIiwiMTgzMjE2MDIiLCI4Mjk3MDE0MCIsIjYyMjIwODk3IiwiNDYyNDI3MjgiLCI0NzU3ODE2MSIsIjYwNTE2MjY4IiwiNTU3NjQzNSIsIjM1Mzc5ODI5IiwiNzI3MzQyMTEiLCI0Mzk1MDI0MiJdLCJzY29wZSI6WyJzZWxlY3QiXSwibmFtZSI6Iui2hee6p-euoeeQhuWRmDIiLCJwYXNzd29yZF9leHBpcmF0aW9uX2RhdGUiOjE3NzE2NTY2MjIwMDAsImlkIjoxNDc4NjM2ODg2OTg0NTIzNzc3LCJleHAiOjE4NDA3MjEzOTQsImp0aSI6IjI0MWI3YTY1LTc2ZGUtNDliNy04MGMzLTBiODg4NjcwYmM2ZiJ9.HTt4wd6pgUs7GjkR_aVXEL1isynFHJfXSeBnCB6kCGV_Xl4kD2wSjjgns7L99R8EqXn-FkclWJVB228bv0bwBdKlHMS48rN9doNDxjWxp2DP0wSW733vTOi0fMUHfEJht4j3mXetgCdotSXeAblE8Pes0MeV09th1Ozu1Y4bI4t8aiSOaovTC0MEzDfg-NtDCLkBO498KC-5ZpqPw_Zq74XNArLaS2zrRDGkndkpt61T9JYtLm9gicDUbbNYDyh8H9gRmsSNsEMkG8yhvwsekH3PWRvN-Rc3P3MNxiGJMjFw0pgmbC2Z1NMtJsUqq3ydOhvcqgZ37YNQgQYblbpwqA","token_type":"bearer","refresh_token":"eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5hbnRzIjpbIjU4MTk3MjYwIiwiNTk5OTYwNTIiLCIxODMyMTYwMiIsIjgyOTcwMTQwIiwiNjIyMjA4OTciLCI0NjI0MjcyOCIsIjQ3NTc4MTYxIiwiNjA1MTYyNjgiLCI1NTc2NDM1IiwiMzUzNzk4MjkiLCI3MjczNDIxMSIsIjQzOTUwMjQyIl0sInBhc3N3b3JkX2V4cGlyZWQiOmZhbHNlLCJ1c2VyX25hbWUiOiIxNzMxMTM2OTc4MiIsImFkbWluIjpmYWxzZSwicGFzc3dvcmRfZm9yY2VkIjpmYWxzZSwiYXV0aG9yaXRpZXMiOlsiMTY1MTgzODAzNDk1NTU0NjYyNSIsIjE2NTE4MzMxMTE5ODc2OTU2MTciLCIxNjUxODQ0ODc4MjcyOTAxMTIxIiwiMTc3Njg3MDU4NDIyODA2NTI4MiIsIjE2Mjc0ODM5ODE3NDAwNTY1NzgiLCIxNzcwMjY3OTU1MjgwNTU2MDMzIiwiMTgxMzEwNTk2NTM1NTcwODQxNyIsIjE3OTM0NDA4NTk5MDgyODg1MTMiLCIxODE1Mjg3NDQ2MTY2ODM1MjAxIiwiMTY1MTg0NTU1NDYyOTU4Njk0NSIsIlJPTEVfQUNUSVZJVElfVVNFUiIsIjE2NTE4NDY3OTE2OTM0MTQ0MDEiLCIxNjUxODM3NTIyOTgyMDIzMTcwIiwiMTc3MjgzMTU5MDg3NjAwMDI1OCIsIjE2MDI4NDc4MjY2Mzc4MjgwOTciLCIxNjU0MDM4MTQ1MjY5ODM3ODI1Il0sImNsaWVudF9pZCI6ImNsaWVudF8yIiwicGFzc3dvcmRfZXhwaXJhdGlvbl9yZW1pbmRlZCI6ZmFsc2UsImFkbWluaXN0cmF0ZWRfdGVuYW50cyI6WyI1ODE5NzI2MCIsIjU5OTk2MDUyIiwiMTgzMjE2MDIiLCI4Mjk3MDE0MCIsIjYyMjIwODk3IiwiNDYyNDI3MjgiLCI0NzU3ODE2MSIsIjYwNTE2MjY4IiwiNTU3NjQzNSIsIjM1Mzc5ODI5IiwiNzI3MzQyMTEiLCI0Mzk1MDI0MiJdLCJzY29wZSI6WyJzZWxlY3QiXSwiYXRpIjoiMjQxYjdhNjUtNzZkZS00OWI3LTgwYzMtMGI4ODg2NzBiYzZmIiwibmFtZSI6Iui2hee6p-euoeeQhuWRmDIiLCJwYXNzd29yZF9leHBpcmF0aW9uX2RhdGUiOjE3NzE2NTY2MjIwMDAsImlkIjoxNDc4NjM2ODg2OTg0NTIzNzc3LCJleHAiOjE4NDA3MjEzOTQsImp0aSI6IjczMzA2MTdiLWY5OGQtNGI5Yy1iNjlhLTk4ODk2ZDMzYTJkZSJ9.Y7DmPplN9cT34gHLgsQpeBhF1yLV9XRtK13U4GKMJ_uN6Uav3xfJtkE4vYTjfesZBF8jpDeYcJjSUOEpiyns2zIEh0LviotIDMKMTx_IKiLtESYKnaX8FmE5cBVTJ6EjgmL2tX0O5LNhnyTNc1gvJYCoaW_xsJK0F4Gr5PuMhvQ8W9r4dOdRQ95nYPSyMC9tRnOQ_r8tJ9hct99oS8bagy_ZtwWI-f5NMtYi_uBEt3_XZHMpaHyCjwfMrx3MWeNaiai0yqMOj03OrPyIUiZq_4gVHJ3oj7oKPqh4zMqthBg_vLSQ9FIyqpj9k_LqdpCUnyth4-zYzGYOYOXFILNSXQ","expires_in":99999999,"scope":"select","id":"1478636886984523777","name":"超级管理员2","admin":false,"tenants":["58197260","59996052","18321602","82970140","62220897","46242728","47578161","60516268","5576435","35379829","72734211","43950242"],"administrated_tenants":["58197260","59996052","18321602","82970140","62220897","46242728","47578161","60516268","5576435","35379829","72734211","43950242"],"password_expired":false,"password_forced":false,"password_expiration_reminded":false,"password_expiration_date":1771656622000,"jti":"241b7a65-76de-49b7-80c3-0b888670bc6f","expire_time":1840721393861}',
        'GH-NowEnterprise': '{"id":"1527470128244015106","code":58197260,"name":"安全指挥调度系统","address":"四川省成都市武侯区石羊场街道ICP环汇商业广场M6座","location":"","building":10,"areaCovered":40222,"logoId":"1879369727330009089","file":"","remark":"成都农产品中心批发市场是由深圳市农产品集团股份有限公司和成都益民投资集团有限公司共同打造的国家级“菜篮子”。市场现有经销商3000余家，实现蔬菜、肉类、海鲜、水果、冻品、水产、干货、调味品等全品类覆盖。作为西南最大、品类最齐全的一站式采购综合性集散中心，市场年交易量达240万吨，交易额250亿元，保障了成都市主城区80%的生鲜农产品供应，是全国公益性农产品示范市场（批发）、国家首批农产品冷链流通标准化试点企业、全国食品安全典范市场、成都市基层“微党校”市级示范实践一类基地，被成都市委市政府授予“成都市先进基层党组织”称号和成都市抗击新冠肺炎疫情先进集体。","enabled":true,"admin":true,"recentLogin":false,"mainEnterprise":true,"floorArea":133704,"files":[],"createTime":1653012232000}',
        'GH-currentApplication': '{"id":"1701796027231993858","code":"ATTENDANCE_MANAGEMENT","name":"考勤管理@","icon":"/resource/app-icons/考勤管理/main.png","remark":"考勤管理","enabled":true,"sort":null,"applicationGroupId":"1560474800323899394","applicationGroupName":"","createTime":1694574765000,"updateTime":1709803961000,"path":"","fileVO":null,"menuVOS":[],"lastVisitTime":null,"alias":"{\\"name\\":\\"考勤管理@\\",\\"icon\\":\\"\\"}"}'
      }
      for (const key in mockStorage) {
        // @ts-ignore
        sessionStorage.setItem(key, mockStorage[key])
      }
    }
    if (typeof window !== 'undefined') {
      const cubeAuthService = new CubeAuthService(CubeTerminalEnum.BUSINESS)
      const authRes = await cubeAuthService.getTokenWithoutCode({
        username: '17311369782',
        password: 't&<B2=[0'
      })
      const mockStorage: Record<string, string> = {
        'GH-Token': JSON.stringify({ access_token: authRes.accessToken }),
        'GH-NowEnterprise': JSON.stringify({ code: authRes.tenantIDs[0] }),
        'GH-currentApplication': '{"id":"1701796027231993858","code":"ATTENDANCE_MANAGEMENT","name":"考勤管理@","icon":"/resource/app-icons/考勤管理/main.png","remark":"考勤管理","enabled":true,"sort":null,"applicationGroupId":"1560474800323899394","applicationGroupName":"","createTime":1694574765000,"updateTime":1709803961000,"path":"","fileVO":null,"menuVOS":[],"lastVisitTime":null,"alias":"{\\"name\\":\\"考勤管理@\\",\\"icon\\":\\"\\"}"}'
      }
      for (const key in mockStorage) {
        sessionStorage.setItem(key, mockStorage[key])
      }
    }
    const { app } = ctx;
    app.component('DemoPreview', DemoPreview);
  }
} satisfies Theme
