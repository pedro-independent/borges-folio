import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CustomEase } from 'gsap/CustomEase'

const pluginMap = {
  Flip: () => import('gsap/Flip'),
  Observer: () => import('gsap/Observer'),
  ScrollToPlugin: () => import('gsap/ScrollToPlugin'),
  TextPlugin: () => import('gsap/TextPlugin'),
  SplitText: () => import('gsap/SplitText'),
  DrawSVGPlugin: () => import('gsap/DrawSVGPlugin'),
}

let registered = false

export default function useGSAP() {
  if (!registered) {
    gsap.registerPlugin(ScrollTrigger, CustomEase)
    CustomEase.create('osmo', 'M0,0 C0.625,0.05 0,1 1,1')
    CustomEase.create('crisp-corner', '1, 0, 0, 1')
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
