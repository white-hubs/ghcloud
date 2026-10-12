import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

export function resolveRef(ref: string, baseDir: string, resolved: Set<string>): any {
  if (resolved.has(ref)) {
    throw new Error(`Circular reference detected: ${ref}`)
  }
  resolved.add(ref)
  
  const fullPath = join(baseDir, ref)
  if (!existsSync(fullPath)) {
    throw new Error(`Referenced file not found: ${fullPath}`)
  }
  
  const content = JSON.parse(readFileSync(fullPath, 'utf-8'))
  return resolveRefs(content, baseDir, resolved)
}

export function resolveRefs(obj: any, baseDir: string, resolved: Set<string> = new Set()): any {
  if (obj === null || obj === undefined) {
    return obj
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => resolveRefs(item, baseDir, resolved))
  }
  
  if (typeof obj === 'object') {
    if ('$ref' in obj) {
      const refValue = obj.$ref
      if (typeof refValue === 'string') {
        return resolveRefs(resolveRef(refValue, baseDir, resolved), baseDir, resolved)
      }
      return resolveRefs(refValue, baseDir, resolved)
    }
    
    const result: any = {}
    for (const [key, value] of Object.entries(obj)) {
      result[key] = resolveRefs(value, baseDir, resolved)
    }
    return result
  }
  
  return obj
}

export function applyLayout(page: any, layouts: Record<string, any>, siteConfig: any): any {
  if (!page.layout) {
    return page
  }
  const layoutData = layouts[page.layout]
  if (!layoutData) {
    return page
  }
  if (!layoutData.components) {
    return page
  }
  
  const navStyle = page.meta?.navStyle || siteConfig.site?.navStyle || 'light'
  const transparentTextColor = navStyle === 'dark' ? '#374151' : '#ffffff'
  
  const layoutComponents = layoutData.components.map((comp: any) => {
    if (comp.name === 'NavMenu') {
      const baseProps = comp.props || {
        logo: siteConfig.site?.ogImage,
        logoAlt: siteConfig.site?.name,
        contactText: "立即咨询",
        contactHref: "/consultation.html",
        transparentBgColor: "transparent",
        items: siteConfig.navigation || []
      }
      return { ...comp, props: { ...baseProps, transparentTextColor } }
    }
    if (comp.name === 'SiteFooter') {
      return { ...comp, props: comp.props || {} }
    }
    if (comp.name === 'FloatingSidebar') {
      return { ...comp, props: comp.props || { items: [] } }
    }
    return comp
  })

  const slotName = layoutData.slot || 'main'
  const finalComponents: any[] = []
  let slotFound = false

  for (const comp of layoutComponents) {
    if (comp.name === '__slot__') {
      finalComponents.push(...page.components)
      slotFound = true
    } else {
      finalComponents.push(comp)
    }
  }

  if (!slotFound) {
    finalComponents.push(...page.components)
  }
  
  return {
    ...page,
    components: finalComponents
  }
}
