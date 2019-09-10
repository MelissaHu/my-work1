/**
 * company:上海道枢信息
 * Time:2018-6-25
 * author:yuanlk
 * 地图测量基础封装类
 */

import sourceVector from 'ol/source/vector'
import layerVector from 'ol/layer/vector'
import Sphere from 'ol/sphere'
import Stroke from 'ol/style/stroke'
import proj from 'ol/proj'
import LineString from 'ol/geom/linestring'
import Polygon from 'ol/geom/polygon'
import Style from 'ol/style/style'
import Circle from 'ol/style/circle'
import Fill from 'ol/style/fill'
import Observable from 'ol/observable'
import Draw from 'ol/interaction/draw'
import Overlay from 'ol/overlay'
import Collection from 'ol/collection'

var measureTool = function (options) {
  this.init(options)
}
measureTool.prototype = {
  map: null, // 地图对象
  helpTooltipElement: null,
  sketch: null,
  helpTooltip: null,
  measureTooltipElement: null,
  measureTooltip: null,
  geodesicBool: false, // 开启椭球体测量
  wgs84Sphere: new Sphere(6378137),
  measureSource: null,
  measureVector: null,
  measureDraw: null,
  pointermoveKey: null,
  /**
     * 工具初始化函数
     */
  init: function (options) {
    var me = this
    Object.assign(this, options)
    me.loadStyleString(
      '        .tooltip-static:before {' +
      '            border-top: 6px solid rgba(255, 255, 255, 0.5);' +
      '            border-right: 6px solid transparent;' +
      '            border-left: 6px solid transparent;' +
      '            content: "";' +
      '            position: absolute;' +
      '            bottom: -6px;' +
      '            margin-left: -7px;' +
      '            left: 50%;' +
      '        }' +
      '        .tooltip-static:before {' +
      '            border-top-color:rgba(3,255,252,1);' +
      '        }        .tooltip {' +
      '            position : relative;' +
      '            background: rgba(3,14,46,1);' +
      '            border-radius: 4px;' +
      '            color: rgba(3,255,252,1);' +
      '            padding: 4px 8px;' +
      '            opacity: 0.7;' +
      '            white-space: nowrap;' +
      '        }' +
      '        .tooltip-measure {' +
      '            opacity: 1;' +
      '            font-weight: bold;' +
      '        }' +
      '        .tooltip-static {' +
      '            background-color: rgba(3,14,46,1);' +
      '            color: rgba(3,255,252,1);' +
      '            border: 1px solid rgba(3,255,252,1);' +
      '           font-weight: bold;' +
      '        }') // 测量图层的标识样式
    me.measureSource = new sourceVector() // 图层数据源
    me.measureVector = new layerVector({
      source: me.measureSource,
      // 绘制结束图形样式
      style: new Style({ // 图层样式
        fill: new Fill({
          color: 'rgba(0,80,168,0.3)' // 填充颜色
        }),
        stroke: new Stroke({
          color: 'rgba(3,255,252,1)', // 边框颜色
          lineDash: [10, 10],
          width: 2.5 // 边框宽度
        }),
        image: new Circle({
          radius: 7,
          fill: new Fill({
            color: '#ffcc33'
          })
        })
      })
    })
    me.map.addLayer(me.measureVector)
  },
  /**
     * 启用大地测量
     */
  activeGeodesic: function () {
    this.geodesicBool = true
  },
  /**
     * 关闭大地线测量
     */
  disactiveGeodesic: function () {
    this.geodesicBool = false
  },
  /**
     * 开始测量
     * param type :传入"area"则测量面积，否则测量长度
     */
  startMeasure: function (type) {
    var me = this
    var type = (type === 'area' ? 'Polygon' : 'LineString')
    if (me.measureDraw) {
      me.map.removeInteraction(me.measureDraw)
    }

    me.measureDraw = new Draw({
      source: me.measureSource, // 测量绘制层数据源
      type: type, // 几何图形类型
      style: new Style({// 绘制几何图形的样式
        fill: new Fill({
          color: 'rgba(0,80,168,0.3)'
        }),
        stroke: new Stroke({
          color: 'rgba(3,255,252,1)',
          lineDash: [10, 10],
          width: 2
        }),
        image: new Circle({
          radius: 5,
          stroke: new Stroke({
            color: 'rgba(0, 0, 0, 0.7)'
          }),
          fill: new Fill({
            color: 'rgba(255, 255, 255, 0.4)'
          })
        })
      })
    })
    me.map.addInteraction(me.measureDraw)
    me.createMeasureTooltip() // 创建测量工具提示框
    me.createHelpTooltip() // 创建帮助提示框
    me.pointermoveKey = me.map.on('pointermove', me.pointerMoveHandler, me)
    var listener
    // 绑定交互绘制工具开始绘制的事件
    me.measureDraw.on('drawstart',
      function (evt) {
        me.sketch = evt.feature // 绘制的要素
        var tooltipCoord = evt.coordinate// 绘制的坐标
        // 绑定change事件，根据绘制几何类型得到测量长度值或面积值，并将其设置到测量工具提示框中显示
        listener = me.sketch.getGeometry().on('change', function (evt) {
          var geom = evt.target// 绘制几何要素
          var output
          if (geom instanceof Polygon) {
            output = me._formatArea(geom)// 面积值
            tooltipCoord = geom.getInteriorPoint().getCoordinates()// 坐标
          } else if (geom instanceof LineString) {
            output = me._formatLength(geom)// 长度值
            tooltipCoord = geom.getLastCoordinate()// 坐标
          }
          me.measureTooltipElement.innerHTML = output// 将测量值设置到测量工具提示框中显示
          me.measureTooltip.setPosition(tooltipCoord)// 设置测量工具提示框的显示位置
        })
      }, this)
    // 绑定交互绘制工具结束绘制的事件
    me.measureDraw.on('drawend',
      function (evt) {
        me.map.removeOverlay(me.measureTooltip)
        me.sketch = null; //置空当前绘制的要素对象
        me.sketch1 = evt.feature // 绘制的要素
        var geom = me.sketch1.getGeometry()
        var tooltipCoord
        var output
        if (geom instanceof Polygon) {
          output = me._formatArea(geom)// 面积值
          tooltipCoord = geom.getInteriorPoint().getCoordinates()// 坐标
        } else if (geom instanceof LineString) {
          output = me._formatLength(geom)// 长度值
          tooltipCoord = geom.getLastCoordinate()// 坐标
        }
        me.measureTooltipElement1 = null // 置空测量工具提示框对象
        me.measureTooltipElement1 = document.createElement('div')
        me.measureTooltipElement1.innerHTML = output// 将测量值设置到测量工具提示框中显示
        me.measureTooltipElement1.className = 'tooltip tooltip-static' // 设置测量提示框的样式
        me.measureTooltip1 = new Overlay({
          id: 999,
          name: 'length-overlay',
          element: me.measureTooltipElement1,
          offset: [0, -15],
          positioning: 'bottom-center'
        })
        me.map.addOverlay(me.measureTooltip1)
        me.measureTooltip1.setPosition(tooltipCoord)// 设置测量工具提示框的显示位置
        Observable.unByKey(listener)
      }, this)
  },
  /**
     * 结束测量
     */
  endMeasure: function () {
    var me = this
    Observable.unByKey(me.pointermoveKey)
    me.map.removeInteraction(me.measureDraw)
    if (me.helpTooltipElement) {
      me.helpTooltipElement.parentNode.removeChild(me.helpTooltipElement)
    }
    me.helpTooltipElement = null
    if (me.measureTooltipElement) {
      me.measureTooltipElement.parentNode.removeChild(me.measureTooltipElement)
    }
    me.measureTooltipElement = null
  },
  /**
     * 清除地图上的测量标记,zwt
     */
  clearMeasure: function () {
    var me = this
    if (me.measureSource) {
      me.measureSource.clear()
    }
    me.map.removeOverlay(me.helpTooltip)
    var lays = me.map.getOverlays()
    let laysArr = lays.getArray()
    for (var i = 0; i < laysArr.length; i++) {
      let layId = laysArr[i].id
      if (layId) {
        if (layId === 999) {
          me.map.removeOverlay(laysArr[i])
          i--
        } else {
        }
      }
    }

    me.endMeasure()
    if (me.measureTooltipElement) {
      me.measureTooltipElement.parentNode.removeChild(me.measureTooltipElement)
    }
    me.measureTooltipElement = null
  },

  createHelpTooltip: function () {
    var me = this
    if (me.helpTooltipElement) {
      me.helpTooltipElement.parentNode.removeChild(me.helpTooltipElement)
    }
    me.helpTooltipElement = document.createElement('div')
    me.helpTooltipElement.className = 'tooltip hidden'
    me.helpTooltip = new Overlay({
      id: 1,
      element: me.helpTooltipElement,
      offset: [15, 0],
      positioning: 'center-left'
    })
    me.map.addOverlay(me.helpTooltip)
  },
  pointerMoveHandler: function (evt) {
    var me = this
    if (evt.dragging) {
      return
    }
    /** @type {string} */
    var helpMsg = '单击开始测量'// 当前默认提示信息
    if (me.sketch) {
      var geom = (me.sketch.getGeometry())
      if (geom instanceof Polygon) {
        helpMsg = '双击完成测量面积' // 绘制多边形时提示相应内容
      } else if (geom instanceof LineString) {
        helpMsg = '双击完成测量距离' // 绘制线时提示相应内容
      }
    }
    me.helpTooltipElement.innerHTML = helpMsg // 将提示信息设置到对话框中显示
    me.helpTooltip.setPosition(evt.coordinate)// 设置帮助提示框的位置
  },
  /**
     *创建一个新的测量工具提示框（tooltip）
     */
  createMeasureTooltip: function () {
    var me = this
    if (me.measureTooltipElement) {
      me.measureTooltipElement.parentNode.removeChild(me.measureTooltipElement)
    }
    me.measureTooltipElement = document.createElement('div')
    me.measureTooltipElement.className = 'tooltip tooltip-measure'
    me.measureTooltip = new Overlay({
      id: 2,
      element: me.measureTooltipElement,
      offset: [0, -15],
      positioning: 'bottom-center'
    })
    me.map.addOverlay(me.measureTooltip)
  },
  _formatLength: function (line) {
    var me = this
    var length
    if (me.geodesicBool) { // 若使用测地学方法测量
      var coordinates = line.getCoordinates()// 解析线的坐标
      length = 0
      var sourceProj = me.map.getView().getProjection() // 地图数据源投影坐标系
      // 通过遍历坐标计算两点之前距离，进而得到整条线的长度
      for (var i = 0, ii = coordinates.length - 1; i < ii; ++i) {
        var c1 = proj.transform(coordinates[i], sourceProj, 'EPSG:4326')
        var c2 = proj.transform(coordinates[i + 1], sourceProj, 'EPSG:4326')
        length += me.wgs84Sphere.haversineDistance(c1, c2)
      }
    } else {
      length = Math.round(line.getLength() * 100) / 100 // 直接得到线的长度
    }
    var output
    if (length > 100) {
      output = (Math.round(length / 1000 * 100) / 100) + ' ' + 'km' // 换算成KM单位
    } else {
      output = (Math.round(length * 100) / 100) + ' ' + 'm' // m为单位
    }
    return output// 返回线的长度
  },
  _formatArea: function (polygon) {
    var me = this
    var area
    if (me.geodesicBool) { // 若使用测地学方法测量
      var sourceProj = me.map.getView().getProjection()// 地图数据源投影坐标系
      var geom = polygon.clone().transform(sourceProj, 'EPSG:4326') // 将多边形要素坐标系投影为EPSG:4326
      var coordinates = geom.getLinearRing(0).getCoordinates()// 解析多边形的坐标值
      area = Math.abs(me.wgs84Sphere.geodesicArea(coordinates)) // 获取面积
    } else {
      area = polygon.getArea()// 直接获取多边形的面积
    }
    var output
    if (area > 10000) {
      output = (Math.round(area / 1000000 * 100) / 100) + ' ' + 'km<sup>2</sup>' // 换算成KM单位
    } else {
      output = (Math.round(area * 100) / 100) + ' ' + 'm<sup>2</sup>'// m为单位
    }
    return output // 返回多边形的面积
  },
  loadStyleString: function (css) {
    var style = document.createElement('style')
    style.type = 'text/css'
    try {
      style.appendChild(document.createTextNode(css))
    } catch (ex) {
      style.styleSheet.cssText = css
    }
    var head = document.getElementsByTagName('head')[0]
    head.appendChild(style)
  }
}

export default measureTool
