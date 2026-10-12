import { StaffUser } from '../../domain/user'
import { ref, Ref } from 'vue'
import { staffService } from './staff.service'

export function useCurrentUser (): Ref<StaffUser> {
  const user = ref(staffService.getCurrentUserSync())
  return user
}
