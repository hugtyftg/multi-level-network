import { StyleCfg } from "../interface/style"
const DEFAULT_STYLE_CFG: StyleCfg = {
  width: 1800,
  height: 950,
  dataName: '6000_processed.json',
  // 空白填充度和强度，可暴露出来让用户配置，blankFillDegree和blankFillStrength越大，填充部分越大
  divBoxSelector: '#main',
  emphasisName: 'cnt',
  blankFillDegree: 16,
  blankFillStrength: 1,
  nodeStyle: {
    normal: {
      radius: 9,
      opacity: 0.7,
      strokeWidth: 1,
      stroke: '#fff',
      fill: (d: any) => {              
        if (d.children[0].is_alarming) {
          return '#FA5151';
        } else {
          return '#6FD798';
        }
      }
    },
    selected: {
      radius: 9,
      opacity: 1,
      strokeWidth: 5,
      stroke: '#2B41FF',
      fill: (d: any) => {
        if (d.children[0].is_alarming) {
          return '#FA5151';
        } else {
          return '#6FD798';
        }
      }
    }
  },
  nodeLabelStyle: {
    stroke: 'black',
    strokeWidth: 1,
    fontSize: '8px',
    textAnchor: 'middle',
    show: 'auto',
  },
  edgeStyle: {
    normal: {
      opacity: 0.4,
      strokeWidth: 1,
      strokeColor: 'gray',
      strokeDash: 'solid',
    },
    selected: {
      opacity: 1,
      strokeWidth: 2,
      strokeColor: '#3980FE',
      strokeDash: 'solid',
    }
  },
  maskStyle: {
    normal: {
      color: (d: any) => {
        if (d.data.hierarchy === 'az') {
          return '#DCDCDC';
        } else if (d.data.hierarchy === 'pod') {
          if (d.data.name === 'cnt') {
            return '#dff6fd';
          } else {
            return '#DCDCDC';
          }
        } else {
          throw new Error("当前层级不是level2或者level3");
        }
      },
      strokeColor: (d: any) => {
        if (d.data.hierarchy === 'az') {
          return 'white';
        } else if (d.data.hierarchy === 'pod') {
          return 'white'
        } else {
          throw new Error("当前层级不是level2或者level3");
        }
      },
      strokeWidth: (d: any) => {
        if (d.data.hierarchy === 'az') {
          return 10;
        } else if (d.data.hierarchy === 'pod') {
          return 2;
        } else {
          throw new Error("当前层级不是level2或者level3");
        }
      },
      opacity: 1
    },
    selected: {
      color: '#dff6fd',
      strokeColor: 'green',
    }
  },
  maskLabelStyle: {
    fill: (d: any) => {
      if (d.data.hierarchy === 'az') {
        return '#000';
      } else {
        return '#555';
      }
    }
  }
}
export {
  DEFAULT_STYLE_CFG
}