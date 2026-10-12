import { getApiBaseUrL, getAuthHeaders } from '@ghcloud/cube-app-js-sdk'
import { HTTPClientImpl } from '../../infrastructure/http-client'
import { BaseAPIResult } from '../base-api'
import axios from 'axios'

class FileService {
  private readonly client = new HTTPClientImpl({
    baseURL: getApiBaseUrL()??'/api',
    headers: getAuthHeaders()
  })

  // 上传oss
  public async uploadFile (formData: FormData): Promise<any> {
    if(getAuthHeaders().Authorization.length===7){
      const {data}=await axios.post(`/api/ouaa/oauth2/token`, {
        grant_type: 'client_credentials',
        client_id:'client_2',
        client_secret: 'cli@pwd#ghy!789'
      }, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }})
      const result = await this.client.uploadPost<any>('/file/file', formData,{
        headers:{
        'Authorization':'Bearer '+data.access_token
        }
      })
      return result
    }else{
      const result = await this.client.uploadPost<any>('/file/file', formData)
      return result
    }
  }
}

export const fileService = new FileService()
