import { epsilonesque, dot, linearDependent } from './formula';
import { ConflictList, ConflictListNode } from './ConflictList';
import { Vertex } from './Vertex';
import { Face } from './Face';
import WeightedVoronoiError from './WeightedVoronoiError';
import { seed } from '../nestedVoronoi/seed';
export class ConvexHull {
  vertexList: any[];
  facetsList: any[];
  generated: any[];
  horizonal: any[];
  evident: any[];
  cur: number | any;
  constructor() {
    this.vertexList = [];
    this.facetsList = [];
    this.generated = [];
    this.horizonal = [];
    this.evident = [];
    this.cur = 0;
  }
  // 用每个站点坐标(x,y,z)初始化
  init(boundSitesCoordinates: any, sitesCoordinates: any) {
    this.vertexList = [];
    for (let i = 0; i < sitesCoordinates.length; i++) {
      this.vertexList[i] = new Vertex(
        sitesCoordinates[i].x,
        sitesCoordinates[i].y,
        sitesCoordinates[i].z,
        null,
        sitesCoordinates[i],
        false
      );
    }
    this.vertexList = this.vertexList.concat(boundSitesCoordinates);
  }
  permutate() {
    let pointSize = this.vertexList.length;
    for (let i = pointSize - 1; i > 0; i--) {
      // let randomIndex = Math.floor(Math.random() * i);
      let randomIndex: number = Math.floor(seed(0) * i);
      let tempVertex = this.vertexList[randomIndex];
      tempVertex.index = i;
      let currentItem = this.vertexList[i];
      currentItem.index = randomIndex;
      this.vertexList.splice(randomIndex, 1, currentItem);
      this.vertexList.splice(i, 1, tempVertex);
    }
  }
  prep() {
    if (this.vertexList.length <= 3) {
      throw new WeightedVoronoiError('少于四个节点');
    }
    for (let i = 0; i < this.vertexList.length; i++) {
      this.vertexList[i].index = i;
    }

    let vertex0: any, vertex1: any, vertex2: any, vertex3: any;
    let face1: Face | any,
      face2: Face | any,
      face3: Face | any,
      face0: Face | any;
    vertex0 = this.vertexList[0];
    vertex1 = this.vertexList[1];
    vertex2 = vertex3 = null;

    // 搜索不与前两个共线的第三个点
    for (let i = 2; i < this.vertexList.length; i++) {
      if (
        !(
          linearDependent(vertex0, this.vertexList[i]) &&
          linearDependent(vertex1, this.vertexList[i])
        )
      ) {
        vertex2 = this.vertexList[i];
        vertex2.index = 2;
        this.vertexList[2].index = i;
        this.vertexList.splice(i, 1, this.vertexList[2]);
        this.vertexList.splice(2, 1, vertex2);
        break;
      }
    }
    if (vertex2 === null) {
      throw new WeightedVoronoiError(
        'Not enough non-planar Points (vertex2 is null)'
      );
    }

    // 创建第一个jFaceace
    face0 = new Face(vertex0, vertex1, vertex2);
    // 搜索不与前三个点共面的第四个点
    for (let i = 3; i < this.vertexList.length; i++) {
      if (
        !epsilonesque(
          dot(face0.normalVector, face0.verts[0]) -
            dot(face0.normalVector, this.vertexList[i])
        )
      ) {
        vertex3 = this.vertexList[i];
        vertex3.index = 3;
        this.vertexList[3].index = i;
        this.vertexList.splice(i, 1, this.vertexList[3]);
        this.vertexList.splice(3, 1, vertex3);
        break;
      }
    }
    if (vertex3 === null) {
      throw new WeightedVoronoiError(
        'Not enough non-planar Points (vertex3 is null)'
      );
    }

    face0.orient(vertex3);
    face1 = new Face(vertex0, vertex2, vertex3, vertex1);
    face2 = new Face(vertex0, vertex1, vertex3, vertex2);
    face3 = new Face(vertex1, vertex2, vertex3, vertex0);
    this.addFacet(face0);
    this.addFacet(face1);
    this.addFacet(face2);
    this.addFacet(face3);
    // 连接三角面
    face0.link(face1, vertex0, vertex2);
    face0.link(face2, vertex0, vertex1);
    face0.link(face3, vertex1, vertex2);
    face1.link(face2, vertex0, vertex3);
    face1.link(face3, vertex2, vertex3);
    face2.link(face3, vertex3, vertex1);
    this.cur = 4;

    let v: any;
    for (let i: number = this.cur; i < this.vertexList.length; i++) {
      v = this.vertexList[i];
      if (face0.conflict(v)) {
        this.addConflict(face0, v);
      }
      if (face1.conflict(v)) {
        this.addConflict(face1, v);
      }
      if (face2.conflict(v)) {
        this.addConflict(face2, v);
      }
      if (face3.conflict(v)) {
        this.addConflict(face3, v);
      }
    }
  }
  // 建立两个面的交线方程
  addConflicts(old1: any, old2: any, faceInstance: any) {
    let line1 = old1.conflicts.getVertices();
    let line2 = old2.conflicts.getVertices();
    let nCLArr: any[] = [];
    let vertex1: any, vertex2: any;
    let i: number | any = 0,
      l: number | any = 0;

    while (i < line1.length || l < line2.length) {
      if (i < line1.length && l < line2.length) {
        vertex1 = line1[i];
        vertex2 = line2[l];
        if (vertex1.index === vertex2.index) {
          nCLArr.push(vertex1);
          i++;
          l++;
        } else if (vertex1.index > vertex2.index) {
          nCLArr.push(vertex1);
          i++;
        } else {
          nCLArr.push(vertex2);
          l++;
        }
      } else if (i < line1.length) {
        nCLArr.push(line1[i++]);
      } else {
        nCLArr.push(line2[l++]);
      }
    }
    for (let i: number = nCLArr.length - 1; i >= 0; i--) {
      vertex1 = nCLArr[i];
      if (faceInstance.conflict(vertex1))
        this.addConflict(faceInstance, vertex1);
    }
  }

  // 为face和vertex添加交点列表
  addConflict(face: any, vert: any) {
    let conflictNode = new ConflictListNode(face, vert);
    face.conflicts.add(conflictNode);
    vert.conflicts.add(conflictNode);
  }
  // 清空交点
  removeConflict(face: any) {
    face.removeConflict();
    let index = face.index;
    face.index = -1;
    if (index === this.facetsList.length - 1) {
      this.facetsList.splice(this.facetsList.length - 1, 1);
      return;
    }
    if (index >= this.facetsList.length || index < 0) return;
    let lastFace = this.facetsList.splice(this.facetsList.length - 1, 1);
    lastFace[0].index = index;
    this.facetsList.splice(index, 1, lastFace[0]);
  }
  addFacet(face: any) {
    face.index = this.facetsList.length;
    this.facetsList.push(face);
  }
  compute() {
    this.prep();
    while (this.cur < this.vertexList.length) {
      let nextVertext = this.vertexList[this.cur];
      if (nextVertext.conflicts.isEmpty()) {
        // 如果没有交点说明点在凸包内
        this.cur++;
        continue;
      }
      this.generated = [];
      this.horizonal = [];
      this.evident = [];
      nextVertext.conflicts.fill(this.evident);
      // 依次储存水平边
      let edge: any;
      for (let jFace = 0; jFace < this.evident.length; jFace++) {
        edge = this.evident[jFace].getHorizon();
        if (edge !== null) {
          edge.findHorizon(this.horizonal);
          break;
        }
      }
      let lastFace: null | any = null,
        firstFace: null | any = null;
      // 遍历所有的水平边，创建新的三角面
      for (let hEi = 0; hEi < this.horizonal.length; hEi++) {
        let hEdge = this.horizonal[hEi];
        let faceInstance = new Face(
          nextVertext,
          hEdge.origin,
          hEdge.destine,
          hEdge.twin.next.destine
        );
        faceInstance.conflicts = new ConflictList(true);
        this.addFacet(faceInstance);
        this.generated.push(faceInstance);
        // 添加新交点
        this.addConflicts(hEdge.iFace, hEdge.twin.iFace, faceInstance);
        // 把新的face三角面和水平边连接起来
        faceInstance.link(hEdge);
        if (lastFace !== null)
          faceInstance.link(lastFace, nextVertext, hEdge.origin);
        lastFace = faceInstance;
        if (firstFace === null) firstFace = faceInstance;
      }
      // 把第一个和最后一个jFaceace三角面连接起来
      if (firstFace !== null && lastFace !== null) {
        lastFace.link(firstFace, nextVertext, this.horizonal[0].origin);
      }
      if (this.generated.length !== 0) {
        for (let f = 0; f < this.evident.length; f++) {
          this.removeConflict(this.evident[f]);
        }
        this.cur++;
        this.generated = [];
      }
    }
    return this.facetsList;
  }
  clear() {
    this.vertexList = [];
    this.facetsList = [];
    this.generated = [];
    this.horizonal = [];
    this.evident = [];
    this.cur = 0;
  }
}
