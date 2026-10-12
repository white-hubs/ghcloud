export interface SiteConfig {
  name: string
  url: string
  logo?: string
  description?: string
  ogImage?: string
  copyright?: string
}

export interface MetaConfig {
  title?: string
  description?: string
  keywords?: string
  ogImage?: string
}

export type PropType = 'string' | 'number' | 'boolean' | 'select' | 'image' | 'color'

export interface PropSchema {
  type: PropType
  required: boolean
  label: string
  default?: any
  options?: string
  placeholder?: string
}

export interface ComponentSchema {
  props: Record<string, PropSchema>
}

export interface ComponentInstance {
  name: string
  props: Record<string, any>
  interactive?: boolean
}

export interface Page {
  path: string
  isSystem: boolean
  meta?: MetaConfig
  components: ComponentInstance[]
}

export interface NavItem {
  id: string
  name: string
  path: string
  sortOrder: number
}

export interface SidebarItem {
  id: string
  name: string
  url: string
}

export interface SidebarConfig {
  enabled: boolean
  items: SidebarItem[]
}

export interface Article {
  id: string
  title: string
  content: string
  categoryId?: string
  [key: string]: any
}

export interface Category {
  id: string
  name: string
}

export interface FriendLink {
  id: string
  name: string
  url: string
}

export interface Database {
  site?: SiteConfig
  navigation?: NavItem[]
  sidebar?: SidebarConfig
  articles?: Article[]
  categories?: Category[]
  friendLinks?: FriendLink[]
  [key: string]: any
}

export interface SiteData {
  schema: {
    pages: Page[]
    site?: SiteConfig
  }
  database: Database
}
