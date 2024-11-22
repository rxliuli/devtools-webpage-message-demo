function createIframeUi() {
  const wrapper = document.createElement('div')
  wrapper.style.height = '0'
  wrapper.style.width = '0'
  const ifr = document.createElement('iframe')
  wrapper.appendChild(ifr)
  ifr.src = browser.runtime.getURL('/iframe.html')
  ifr.style.width = '0'
  ifr.style.height = '0'
  ifr.style.zIndex = '-9999'
  ifr.style.border = 'none'
  ifr.id = 'inject-iframe'
  document.body.appendChild(wrapper)
  return ifr
}

export default defineUnlistedScript(() => {
  console.log('isolation-content', createIframeUi())
})
