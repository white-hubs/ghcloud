import { useEffect, useState } from 'react'

interface UseTableScroll {
  scrollY: number;
  calcTableScroll: () => void;
  showSwitchBtn: boolean;
  formExpend: boolean;
  setFormExpend: (value: boolean) => void;
}

export default function useTableScroll (): UseTableScroll {
  const [scrollY, setValue] = useState<number>(520)
  const [showSwitchBtn, setShowSwitchBtn] = useState<boolean>(false)
  const [formExpend, setFormExpend] = useState<boolean>(false)

  function calcTableScroll (): void {
    const height = (document.querySelector('.todo-layout-content') as unknown as HTMLElement).clientHeight - 110
    setValue(height)
  }

  function calcFormExpend (): void {
    const width = document.body.clientWidth
    setShowSwitchBtn(width < 1200)
    setFormExpend(width >= 1200)
  }

  useEffect(() => {
    calcFormExpend()
    calcTableScroll()

    window.addEventListener('resize', calcTableScroll)
    window.addEventListener('resize', calcFormExpend)
    return (): void => {
      window.removeEventListener('resize', calcTableScroll)
      window.removeEventListener('resize', calcFormExpend)
    }
  }, [])

  return {
    scrollY, calcTableScroll, showSwitchBtn, formExpend, setFormExpend
  }
}
