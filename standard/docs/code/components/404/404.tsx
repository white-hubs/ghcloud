import { defineComponent } from 'vue'

export default defineComponent({
  name: 'NotFound',
  setup () {
    return (): JSX.Element => (
      <div class='flex flex-col items-center justify-center min-h-screen bg-gray-100'>
        <h1 class='text-6xl font-bold text-gray-900'>404</h1>
        <p class='mt-4 text-xl text-gray-700'>文档建设中</p>
        <a href='/' class='mt-6 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300'>
          返回首页
        </a>
      </div>
    )
  },
})
