/* 原始数据格式 */
export interface originLink {
  src_ip : string,
  dst_ip : string,
  src_port: string,
  dst_port: string,
}

export interface originNode {
  az: string | undefined,
  pod_name: string | undefined | null,
  type: string | undefined,
  role: string | undefined,
  mgmt_ip: string,
}

export interface originData {
  links: Array<originLink>,
  nodes: Array<originNode>,
}

/* 化简后的数据格式 */
// 每个设备
export interface deviceNode {
  index: number,
  groupIndex: number,
  az: string | undefined,
  pod_name: string | undefined,
  type: string | undefined,
  role: string | undefined,
  mgmt_ip: string,
  is_alarming: boolean,
  degree: number
}
// 每个Group
export interface group {
  groupIndex: number,
  isHyperNode: boolean,
  size: number,
  children: deviceNode[],
  isPerfectPod: boolean,
}
// group之间的每条link
export interface groupLink {
  source: number,
  target: number,
}
// 化简后的数据
export interface groupData {
  groupList: group[],
  groupLinks: groupLink[]
}
// 层级化的数据结构
export interface hierarchicalStructure {
  // 只有最底层才是bottomLevelStructure
  children: hierarchicalStructure[] | bottomLevelStructure[] | any,
  // 当前层级
  hierarchy: string,
  // 当前层级名称
  name: string
}
// 最底层的数据结构
export interface bottomLevelStructure {
  hierarchy: string,
  name: string,
  num: number,
  nodes: group[],
  edges?: groupLink[]
}