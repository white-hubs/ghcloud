import { computed, defineComponent, type Slot } from 'vue'
import { PreviewGroup } from './preview-group'

interface Props {
  file?: string;
}

export const DemoPreview = defineComponent({
  name: 'PreviewComponent',
  props: ['file'],
  setup (props: Props, { slots }) {
    const codeSlots = computed(() => {
      const result: Record<string, Slot<unknown> | undefined> = {}
      props.file && (result[props.file] = slots[props.file])
      return result
    })

    return (): JSX.Element => (
      <div class='border-border shadow-float relative rounded-xl border'>
        <div class='not-prose relative w-full overflow-x-auto rounded-t-lg px-4 py-6'>
          <div class='flex w-full max-w-[700px] px-2'>
            {props.file
              ? slots.default?.()
              : (
                <div class='text-destructive text-sm'>
                  <span class='bg-destructive text-foreground rounded-sm px-1 py-1'>ERROR:</span>
                  The preview directory does not exist. Please check the parameter.
                </div>
              )}
          </div>
        </div>
        {props.file && <PreviewGroup file={props.file} v-slots={codeSlots.value} />}
      </div>
    )
  },
})
