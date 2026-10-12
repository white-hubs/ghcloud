import { defineComponent } from 'vue'
import { BaseModal } from '../base-modal/base-modal'
import styles from './user-modal.module.less'
import type { UserInfo } from '@ghcloud/cube-ouaa-service'

interface Props {
  visible: boolean;
  userInfo: UserInfo;
}

const genderObj = {
  NONE: '保密',
  MALE: '男',
  FEMALE: '女',
}

export const UserModalComponent = defineComponent({
  props: ['visible', 'userInfo'],
  emits: ['close'],
  setup (props: Props, { emit }) {
    return (): JSX.Element => (
      <BaseModal
        visible={props.visible}
        title='用户信息'
        wrapClassName={styles.userModal}
        onClose={() => {
          emit('close')
        }}
        size='small'
        skin='BUSINESS'
      >
        <div class={styles.userInfo}>
          <div class={styles.infoItemForm}>
            <div class={styles.formItem}>
              <div class={styles.formItemLabel}>姓名:</div>
              <div class={styles.formItemContent}>{props.userInfo.name ?? '--'}</div>
            </div>
            <div class={styles.formItem}>
              <div class={styles.formItemLabel}>电话号码:</div>
              <div class={styles.formItemContent}>
                {props.userInfo.mobile ?? '--'}
              </div>
            </div>
            <div class={styles.formItem}>
              <div class={styles.formItemLabel}>性别:</div>
              <div class={styles.formItemContent}>{genderObj[props.userInfo.gender] ?? '--'}</div>
            </div>
            <div class={styles.formItem}>
              <div class={styles.formItemLabel}>所属部门:</div>
              <div class={styles.formItemContent}>
                {props.userInfo.organizations.length ? props.userInfo.organizations[0]?.name ?? '--' : '--'}
              </div>
            </div>
            <div class={styles.formItem}>
              <div class={styles.formItemLabel}>职位:</div>
              <div class={styles.formItemContent}>
                {props.userInfo.positions.length ? props.userInfo.positions[0]?.name ?? '--' : '--'}
              </div>
            </div>
          </div>
        </div>
      </BaseModal>
    )
  }
})
