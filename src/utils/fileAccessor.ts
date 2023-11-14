const getAssetsImgUrl = (url: string) => {
  return new URL(`../assets/icon/${url}.svg`, import.meta.url).href;
}
export {
  getAssetsImgUrl
};