import { StyleCfg } from "./style"

// 原始数据格式
export interface originLink {
  src_ip : string | undefined,
  dst_ip : string | undefined,
  src_port: string | undefined,
  dst_port: string | undefined,
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

// 化简后的数据格式
export interface deviceNode {
  index: number,
  az: string | undefined,
  pod_name: string | undefined,
  type: string | undefined,
  role: string | undefined,
  mgmt_ip: string,
  is_alarming: boolean,
  degree: number
}

export interface group{
  groupIndex: number,
  isHyperNode: boolean,
  size: number,
  children: deviceNode[],
  isPerfectPod: boolean,
  /* 多层级适配时会修改 */
  az: string,
  pod: string,
}

export interface groupLink {
  source: number,
  target: number,
}

export interface groupData {
  groupList: group[],
  groupLinks: groupLink[]
}

export interface hierarchicalStructure {
  children: hierarchicalStructure[] | bottomLevelStructure[] | any, // 只有最底层才是bottomLevelStructure
  hierarchy: string,
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