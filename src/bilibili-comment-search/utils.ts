function getBV() {
  let url = window.location.href;
  let match = url.match(/BV[a-zA-Z0-9]+/);

  if (match) {
    return match[0]
  } else {
    console.log('未找到 bv 号');
    return ''
  }
}

export function getOid() {
  return getBV()
}
