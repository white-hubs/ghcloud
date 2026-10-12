import type { UserInfo } from '@ghcloud/cube-ouaa-service'
import { closeKeyPlaceModal, openKeyPlaceModal } from '../components/key-place-modal/key-place-modal'
import { closePersonModal, openPersonModal } from '../components/person-modal/person-modal'
import { createKeyPlaceMarker, createUserMarker, restoreTheInitialStateOfTheMap } from './gis-helper'
import { clearMap, setCenter } from '@/pages/event/register/gis'

export const createKeyPlaceModal = async (title: string, data?: Record<string, unknown>,center?:boolean): Promise<void>=>{
  let doCloseCallBack = true
  const modalId = await openKeyPlaceModal({
    title: title,
    data: data ? data : {},
    onClose: ()=>{
      // doCloseCallBack && restoreTheInitialStateOfTheMap()
    },
    onLocate: (data)=>{
      doCloseCallBack = false
      closeKeyPlaceModal(modalId)
      // clearMap()
      if(center){
        setCenter({ lat: data.latitude, lng: data.longitude },20)
        return;
      }
      createKeyPlaceMarker(data, { lat: data.latitude, lng: data.longitude }, true,false,false)
    }
  })
}

export const createPersonModal = async (title: string, type?: string): Promise<void>=>{
  let doCloseCallBack = true
  await openPersonModal({
    title: title,
    data: { type },
    onClose: ()=>{
      // doCloseCallBack && restoreTheInitialStateOfTheMap()
    },
    onLocate: (userInfo)=>{
      doCloseCallBack = false
      clearMap()
      createUserMarker(userInfo as unknown as UserInfo, undefined, true)
      closePersonModal()
    }
  })
}