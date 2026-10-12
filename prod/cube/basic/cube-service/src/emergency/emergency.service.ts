import { getAuthRequester, getPublicRequester } from '../request'
import type { EmergencyEventType, EmergencyType } from './emergency.model'

export class EmergencyService {
  private static readonly publicRequester = getPublicRequester()

  private static readonly authRequester = getAuthRequester()

  public static async getEventType (): Promise<EmergencyEventType[]> {
    const url = '/api/emergency/emergency-event-types'
    return this.authRequester.get({
      url,
    })
  }

  public static async getTypes (): Promise<EmergencyType[]> {
    const url = '/api/emergency/emergency-types'
    return this.authRequester.get({
      url,
    })
  }
}
