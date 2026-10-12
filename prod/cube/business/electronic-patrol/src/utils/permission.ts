import { ref } from 'vue'

const authList = ref<unknown[]>([])
export const initAuth = (auth: unknown[]): void => {
  authList.value = auth
}

export const getId = (): string => {
  const id: any = authList.value.find((item: any) => {
    return item.path == location.pathname
  })
  if (id) {
    return id?.dataPermissions[0]?.id == undefined ? '' : id?.dataPermissions[0]?.id
  } else {
    return ''
  }
}
