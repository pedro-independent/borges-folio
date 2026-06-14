import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const pluginMap = {
  Flip: () => import('gsap/Flip'),
  Observer: () => import('gsap/Observer'),
  ScrollToPlugin: () => import('gsap/ScrollToPlugin'),
  TextPlugin: () => import('gsap/TextPlugin'),
}

let registered = false

export default function useGSAP() {
  if (!registered) {
    gsap.registerPlugin(ScrollTrigger)
    registered = true
  }
  async function lazyLoadPlugin(name) {
    const loader = pluginMap[name]
    if (!loader) throw new Error(`useGSAP: unknown plugin "${name}"`)
    const plugin = (await loader())[name]
    gsap.registerPlugin(plugin)
    return plugin
  }
  return { gsap, ScrollTrigger, lazyLoadPlugin }
}
