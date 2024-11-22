import { expose, transfer, wrap } from 'comlink'
import { PublicPath } from 'wxt/browser'

async function injectScript() {
  const includeIframe = await new Promise((resolve) => {
    browser.devtools.inspectedWindow.eval(
      `!!document.querySelector('#inject-iframe')`,
      (result) => {
        resolve(result)
      },
    )
  })
  if (includeIframe) {
    return
  }
  const tabId = browser.devtools.inspectedWindow.tabId
  if (!tabId) {
    return
  }
  await browser.scripting.executeScript({
    target: { tabId },
    files: ['/isolation-content.js' as PublicPath],
    world: 'ISOLATED',
  })
  await browser.scripting.executeScript({
    target: { tabId },
    files: ['/main-content.js' as PublicPath],
    world: 'MAIN',
  })
}

async function main() {
  await injectScript()
  interface IFS {
    readFile: (path: string) => Promise<ArrayBuffer>
    writeFile: (path: string, data: ArrayBuffer) => Promise<void>
    readdir: (path: string) => Promise<string[]>
  }
  const tabId = browser.devtools.inspectedWindow.tabId
  if (!tabId) {
    return
  }
  const bc = new BroadcastChannel(
    `${browser.runtime.getManifest().name}-iframe-${tabId}`,
  )
  await new Promise<void>((resolve) => expose({ onReady: resolve }, bc))
  document.querySelector('#app')!.textContent = 'Injected'
  const ipc = wrap<IFS>(bc)
  const r = await ipc.readdir('/')
  console.log(r)
  const data = new Uint8Array([1, 2, 3]).buffer
  await ipc.writeFile('/test.txt', transfer(data, [data]))
  const r2 = await ipc.readFile('/test.txt')
  console.log(r2)
}

main()
