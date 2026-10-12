import type { SceneDataType } from '@/api/models/mdata'
import { defineComponent } from 'vue'
import styles from './sub-business-nav-item.module.less'

interface Props {
  parentNav: SceneDataType | undefined;
  activeId: string;
  mouseInSubNav: boolean;
  visible: boolean;
}

export const SubBusinessNavItem = defineComponent({
  props: ['parentNav', 'activeId', 'mouseInSubNav', 'visible'],
  emits: ['clickNav', 'update:mouseInSubNav'],
  setup (props: Props, { emit }) {
    /**
 * 点击菜单事件
 * @param nav 菜单数据
 * @param lv 层级
 */
    function clickNav (nav: SceneDataType, lv: number): void {
      emit('clickNav', nav, lv)
    }

    function onMouseenter (): void {
      emit('update:mouseInSubNav', true)
    }
    function onMouseleave (): void {
      emit('update:mouseInSubNav', false)
    }

    return () => {
      return (
        <>
          {
            props.parentNav.children.length > 8 &&
              <div
                class={`${styles['sub-nav']} swiper ${!props.visible ? styles['hide-sub-nav'] : ''}`}
                onMouseenter={() => { onMouseenter() }}
                onMouseleave={() => { onMouseleave() }}
              >
                <div class='swiper-wrapper'>
                  {
                    props.parentNav.children.map((item) => {
                      return (
                        <div class='swiper-slide' key={'sub' + item.id}>
                          <div
                            class={`${styles.item} ${item.id === props.activeId ? 'active' : ''}`}
                            onClick={() => { clickNav(item, 2) }}
                          >
                            {item.name}
                          </div>
                        </div>
                      )
                    })
                  }
                </div>
              </div>
          }
          {
            props.parentNav.children.length <= 8 &&
              <div class={`${styles['sub-nav']} ${styles['no-swiper']} ${!props.visible ? styles['hide-sub-nav'] : ''}`}>
                {
                  props.parentNav.children.map((item) => {
                    return (
                      <div
                        class={`${styles.item} ${item.id === props.activeId ? 'active' : ''}`}
                        onClick={() => { clickNav(item, 2) }}
                        key={'sub' + item.id}
                      >
                        {item.name}
                      </div>
                    )
                  })
                }
              </div>
          }
        </>
      )
    }
  }
})
