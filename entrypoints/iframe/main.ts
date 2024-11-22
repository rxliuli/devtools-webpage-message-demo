import { expose, transfer, windowEndpoint, wrap } from 'comlink'

interface IFS {
  readFile: (path: string) => Promise<ArrayBuffer>
  writeFile: (path: string, data: ArrayBuffer) => Promise<void>
  readdir: (path: string) => Promise<string[]>
}

async function main() {
  const tabId = (await browser.tabs.getCurrent())!.id
  if (!tabId) {
    return
  }
  const ipc = wrap<IFS>(windowEndpoint(globalThis.parent))
  const bc = new BroadcastChannel(
    `${browser.runtime.getManifest().name}-iframe-${tabId}`,
  )
  expose(
    {
      readFile: async (path: string) => {
        const r = await ipc.readFile(path)
        // 将 ArrayBuffer 通过 transfer 传递回 devtools-panel 中
        return transfer(r, [r])
      },
      writeFile: async (path: string, data: ArrayBuffer) => {
        // 将 ArrayBuffer 通过 transfer 传递到 content-script 中
        await ipc.writeFile(path, transfer(data, [data]))
      },
      readdir: async (path: string) => {
        console.log('readdir', path)
        return await ipc.readdir(path)
      },
    } as IFS,
    bc,
  )

  console.log('iframe main')

  await wrap<{
    onReady: () => void
  }>(bc).onReady()
}

main()
