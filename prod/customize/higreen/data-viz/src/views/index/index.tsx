import { defineComponent } from 'vue'
import { Layout } from './components/layout/layout'
import { NavMenu } from './components/nav-menu/nav-menu'

export const Index = defineComponent({
  setup: () => {
    return (): JSX.Element =>
      <Layout>
        <NavMenu />
      </Layout>
  }
})
