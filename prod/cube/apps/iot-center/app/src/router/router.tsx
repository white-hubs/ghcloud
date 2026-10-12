import { createContext, lazy, useState, type ReactNode, useEffect, Suspense, createElement, useCallback } from 'react'
import { logger } from '../log'
import { historyEventManager, type ChangeHistoryEventData } from './history'

export interface RouteOption {
  name?: string;
  path: string;
  component: () => Promise<React.FC>;
}

interface Props {
  routes: RouteOption[];
}

export const RouteContext = createContext<RouteOption | null>(null)

interface Router {
  push: (path: string) => void;
}

export function useRouter (): Router {
  return {
    push: (path: string): void => {
      history.pushState(null, '', path)
    }
  }
}

function matchRoute (routes: RouteOption[], currentUrl: string): RouteOption | null {
  const matched = []
  const { pathname } = new URL(currentUrl, location.origin)
  for (const route of routes) {
    const { path } = route
    if (path === pathname) {
      return route
    }
    if (new RegExp(path).test(pathname)) {
      matched.push(route)
    }
  }
  return matched[0] ?? null
}

export const RouterView = (props: Props): ReactNode => {
  const { routes } = props
  const [currentUrl, setCurrentUrl] = useState(location.pathname + location.search)
  const currentRoute = matchRoute(routes, currentUrl)
  const component = currentRoute?.component && lazy(async () => ({
    default: await currentRoute.component()
  }))
  logger.debug('component', currentRoute, component)
  const onHistoryChange = useCallback((changed: ChangeHistoryEventData): void => {
    logger.debug('onHistoryChange', changed)
    setCurrentUrl(changed.target.pathname + changed.target.search)
  }, [])

  useEffect(() => {
    historyEventManager.addEventListener('changeState', onHistoryChange)

    return (): void => {
      historyEventManager.removeEventListener('changeState', onHistoryChange)
    }
  }, [onHistoryChange])

  return (
    <RouteContext.Provider value={currentRoute}>
      <Suspense>
        {component && createElement(component, { key: currentUrl })}
      </Suspense>
    </RouteContext.Provider>
  )
}
