export const getChromeVersion = (): number => {
  var raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)

  return raw ? parseInt(raw[2], 10) : -1
}
