import { expose, windowEndpoint } from 'comlink'

export default defineUnlistedScript(() => {
  const map = new Map<string, ArrayBuffer>()

  interface IFS {
    readFile: (path: string) => Promise<ArrayBuffer>
    writeFile: (path: string, data: ArrayBuffer) => Promise<void>
    readdir: (path: string) => Promise<string[]>
  }

  expose(
    {
      readFile: async (path: string) => {
        return map.get(path) || new Uint8Array([1, 2, 3]).buffer
      },
      writeFile: async (path: string, data: ArrayBuffer) => {
        map.set(path, data)
      },
      readdir: async (path: string) => {
        return Array.from(map.keys()).filter((p) => p.startsWith(path))
      },
    } as IFS,
    windowEndpoint(
      (document.querySelector('#inject-iframe')! as HTMLIFrameElement)
        .contentWindow!,
    ),
  )
  console.log('main-content')
})
