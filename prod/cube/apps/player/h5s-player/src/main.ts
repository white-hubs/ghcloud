import { render, h } from 'preact'
import { App } from './app'
import './global-style.css'

render(h(App, { test: '' }), document.body)
