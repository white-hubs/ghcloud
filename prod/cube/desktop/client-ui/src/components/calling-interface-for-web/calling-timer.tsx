import { computed, defineComponent, onBeforeUnmount, onMounted, ref } from 'vue'

export const CallingTimer = defineComponent({
  name: 'CallingTimer',
  setup () {
    const callDuration = ref(0);
    let timer: number | null = null;
    const formatTime = computed(() => {
      const hours = Math.floor(callDuration.value / 3600);
      const minutes = Math.floor((callDuration.value % 3600) / 60);
      const seconds = callDuration.value % 60;
      if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      } else {
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
    });

    const startTimer = (): void=> {
      if (timer) clearInterval(timer);
      timer = window.setInterval(() => {
        callDuration.value++;
      }, 1000);
    };

    const stopTimer = (): void => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };
    onMounted(()=>{
      startTimer();
    })
    onBeforeUnmount(() => {
      stopTimer();
    });

    return (): JSX.Element => <span>{formatTime.value}</span>
  }
})