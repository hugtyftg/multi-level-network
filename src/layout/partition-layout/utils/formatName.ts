  // UPDATE1: 有的设备所属pod为null
function formatName(thisDatum: any) {
  let name: string = thisDatum['data']['name']
  return name;
}
export { formatName }