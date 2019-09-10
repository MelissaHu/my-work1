/**
 * company:上海道枢信息
 * Time:2018-11-07
 * author:yuanlk
 * 地图画图封装类 圆、矩形、多边形、线、带距离标注且增加画线带缓冲功能
 */
import proj from 'ol/proj'
import Stroke from 'ol/style/stroke'
import Style from 'ol/style/style'
import Circle from 'ol/style/circle'
import Fill from 'ol/style/fill'
import Icon from 'ol/style/icon'
import Draw from 'ol/interaction/draw'
import sourceVector from 'ol/source/vector'
import layerVector from 'ol/layer/vector'
import GeoJSON from 'ol/format/geojson'
import Text from 'ol/style/text'
import Feature from 'ol/feature'
import LineString from 'ol/geom/linestring'
import geomCircle from 'ol/geom/Circle'
import Observable from 'ol/observable'
import Overlay from 'ol/overlay'
import Polygon from 'ol/geom/polygon'

var drawGeometry = function (options) {
  this.init(options)
}
drawGeometry.prototype = {
  map: null, // 地图对象
  _source: null, // 默认的图层源
  source: null, // 画图结束保存的外部图层源，不传值使用默认的_source
  vectorLayer: null, // 外部图层源,不传值使用默认的_vectorLayer与_source配合
  _vectorLayer: null, // 默认图层
  draw: null, // 矢量画图工具
  lineColor: 'rgba(3,255,252,1)', // 线颜色
  lineWidth: 3, // 线宽度
  fillColor: 'rgba(0, 0, 255, 0.4)', // 面的图层颜色
  imagePath: null, // 点的图标路径
  imageScale: 0.5, // 点图标的缩放比例
  pointRadius: 3, // 如果为未传入图标路径，默认点样式为圆点形式，圆点的半径
  pointFillColor: 'rgba(3,255,252,1)', // 圆点的填充颜色
  pointStrokeColor: undefined, // 圆点的边界颜色
  pointStrokeWidth: undefined, // 圆点的的宽度
  lineDash: undefined,
  lableSource: null,
  lableLayer: null,
  geometrychangeKey: null,
  pointermoveKey: null,
  circleCenter: null,
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

    this.lableSource = new sourceVector()
    this.lableLayer = new layerVector({
      source: this.lableSource,
      style: function (feature) {
        return new Style({
          fill: new Fill({
            color: 'rgba(0,80,168,0.3)'
          }),
          stroke: new Stroke({
            color: 'rgba(3,255,252,1)',
            lineDash: [10, 10],
            width: 2
          }),
          text: new Text({
            offsetY: -10,
            textAlign: 'center', // 位置
            textBaseline: 'middle', // 基准线
            font: 'bold 16px 微软雅黑', // 文字样式
            text: feature.get('distance'), // 文本内容
            fill: new Fill({color: 'rgba(3,255,252,1)'}), // 文本填充样式（即文字颜色）
            overflow: true,
            placement: 'line'
          })
        })
      }
    })
    me.map.addLayer(this.lableLayer)
    if (!me.source) {
      me._source = new sourceVector()
      me._vectorLayer = new layerVector({
        source: me._source,
        style: me.drawStyleFunction.bind(me)
      })
      me.map.addLayer(me._vectorLayer)
    }
  },
  /**
     * 地图画点线面要素封装类
     */
  _newInteraction: function (type) {
    var me = this
    var geometryFunction = null
    if (type === 'Square') {
      geometryFunction = Draw.createRegularPolygon(4)
      me.draw = new Draw({
        source: me.source || me._source,
        type: 'Circle',
        geometryFunction: geometryFunction,
        style: me.drawStyleFunction.bind(me)
      })
    } else if (type === 'Box') {
      geometryFunction = Draw.createBox()
      me.draw = new Draw({
        source: me.source || me._source,
        type: 'Circle',
        geometryFunction: geometryFunction,
        style: me.drawStyleFunction.bind(me)
      })
    } else {
      me.draw = new Draw({
        source: me.source || me._source,
        type: type,
        style: me.drawStyleFunction.bind(me)
      })
    }
  },
  drawStyleFunction: function () {
    var me = this
    var image = null
    if (!me.imagePath) {
      image = new Circle({
        radius: me.pointRadius,
        stroke: new Stroke({
          color: me.pointStrokeColor,
          width: me.pointStrokeWidth
        }),
        fill: new Fill({
          color: me.pointFillColor
        })
      })
    } else {
      image = new Icon({
        scale: me.imageScale,
        src: me.imagePath
      })
    }
    return new Style({
      fill: new Fill({
        color: me.fillColor
      }),
      stroke: new Stroke({
        color: me.lineColor,
        width: me.lineWidth,
        lineDash: me.lineDash
      }),
      image: image
    })
  },
  clearDrawSource: function () {
    var me = this
    if (!me.source) {
      me._source.clear()
    }
    me.lableSource.clear()
    if (me.measureTooltipElement) {
      me.measureTooltipElement.parentNode.removeChild(me.measureTooltipElement)
    }
    me.measureTooltipElement = null
  },
  /**
     * 根据类型添加画图工具
     * param: type ('Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon' or 'Circle' 'Square' 'Box')
     */
  addDrawByType: function (type, callback) {
    var me = this
    if (me.draw) {
      me.map.removeInteraction(me.draw)
    }
    if (type === 'LineBuffer') {
      this.lineBufferBool = true
      me._newInteraction.call(me, 'LineString')
    } else {
      this.lineBufferBool = false
      me._newInteraction.call(me, type)
    }
    me.map.addInteraction(me.draw)
    me.createMeasureTooltip() // 创建测量工具提示框
    me.createHelpTooltip() // 创建帮助提示框
    me.pointermoveKey1 = me.map.on('pointermove', me.pointerMoveHandler, me)
    if (type === 'Circle') {
      me.draw.on('drawstart', evt => {
        me.sketch = evt.feature
        this.circleCenter = evt.feature.getGeometry().getCenter()
        this.pointermoveKey = this.map.on('pointermove', pointermoveEvt => {
          this.caclulateCircleLable(pointermoveEvt.coordinate)
        })
      })
    } else if (type === 'Square' || type === 'Box' || type === 'Polygon') {
      me.draw.on('drawstart', evt => {
        var tooltipCoord = evt.coordinate// 绘制的坐标
        me.sketch = evt.feature
        this.geometrychangeKey = me.sketch.getGeometry().on('change', changeEvt => {
          var output
          let geom = changeEvt.target// 绘制几何要素
          output = me._formatArea(geom)// 面积值
          tooltipCoord = geom.getInteriorPoint().getCoordinates()// 坐标
          me.measureTooltipElement.innerHTML = output// 将测量值设置到测量工具提示框中显示
          me.measureTooltip.setPosition(tooltipCoord)// 设置测量工具提示框的显示位置
        })
      })
    } else if (type === 'LineString') {
      me.draw.on('drawstart', evt => {
        me.sketch = evt.feature
        this.geometrychangeKey = me.sketch.getGeometry().on('change', changeEvt => {
          let geom = changeEvt.target// 绘制几何要素
          this.caclulatePolygonOrLineLable(geom)
        })
      })
    }
    me.draw.on('drawend', function (evt) {
      if (me.geometrychangeKey) {
        Observable.unByKey(me.geometrychangeKey)
        me.geometrychangeKey = null
      }
      if (me.pointermoveKey) {
        Observable.unByKey(me.pointermoveKey)
        me.pointermoveKey = null
      }
      if (me.pointermoveKey1) {
        Observable.unByKey(me.pointermoveKey1)
        me.pointermoveKey1 = null
      }
      if (me.helpTooltipElement) {
        me.helpTooltipElement.parentNode.removeChild(me.helpTooltipElement)
      }
      me.sketch = null // 置空当前绘制的要素对象
      me.helpTooltipElement = null
      var data = me.eventDataTools(evt)
      if (callback) {
        callback(data)
      }
    })
  },
  /**
     * 启用画图工具
     */
  enable: function () {
    var me = this
    me.map.addInteraction(me.draw)
  },
  /**
     * 关闭画图工具
     */
  disenable: function () {
    var me = this
    me.map.removeInteraction(me.draw)
  },
  /**
     * 事件对象，数据转换函数，将画完的图形转换为WGS-84坐标的geojson格式
     * param:ol.interaction.Draw.Event
     */
  eventDataTools: function (evt) {
    var cFeature = evt.feature
    if (evt.feature.getGeometry().getType() === 'Circle') {
      var data = {}
      data.type = 'Circle'
      data.center = evt.feature.getGeometry().getCenter()
      data.radius = evt.feature.getGeometry().getRadius()
      return data
    } else {
      var geoFormat = new GeoJSON()
      var data = geoFormat.writeFeature(cFeature, {
        dataProjection: proj.get('EPSG:4326'),
        featureProjection: proj.get('EPSG:3857')
      })
      return data
    }
  },
  // 根据线计算长度
  caculateDistance (line) {
    let length = line.getLength()
    let output = null
    if (length > 1000) {
      output = (Math.round(length / 1000 * 100) / 100) + ' ' + 'km' // 换算成KM单位
    } else {
      output = (Math.round(length * 100) / 100) + ' ' + 'm' // m为单位
    }
    return output
  },
  // 画圆计算半径
  caclulateCircleLable (coordinates) {
    this.lableSource.clear()
    let lineRadius = new LineString([this.circleCenter, coordinates])
    let distance = this.caculateDistance(lineRadius)
    let lineFeature = new Feature({
      geometry: lineRadius,
      distance: distance
    })
    this.lableSource.addFeature(lineFeature)
  },
  // 画矩形计算面积
  caclulateBoxArea (geometry) {
    // 面积
    let geomArea = Number(geometry.getArea())
    let geomPoint = geometry.getInteriorPoint()
    this.lableSource.clear()
    let widthFeature = new Feature({
      geometry: geomPoint,
      distance: geomArea
    })
    this.lableSource.addFeatures(widthFeature)
  },
  // 画矩形计算长宽
  caclulateBoxLable (geometry) {
    // 左上角点坐标
    let leftTopCoords = geometry.getCoordinates()[0][3]
    // 右上角点坐标
    let rightTopCoords = geometry.getCoordinates()[0][2]
    // 左下角点坐标
    let leftBottomCoords = geometry.getCoordinates()[0][0]
    this.lableSource.clear()
    let lineWidth = new LineString([rightTopCoords, leftTopCoords])
    let widthDistance = this.caculateDistance(lineWidth)
    let widthFeature = new Feature({
      geometry: lineWidth,
      distance: widthDistance
    })
    // 矩形垂直宽
    let lineLength = new LineString([leftBottomCoords, leftTopCoords])
    let lengthDistance = this.caculateDistance(lineLength)
    let lengthFeature = new Feature({
      geometry: lineLength,
      distance: lengthDistance
    })
    this.lableSource.addFeatures([widthFeature, lengthFeature])
  },
  // 计算多边形或线段长度标注
  caclulatePolygonOrLineLable (geometry) {
    let coordinates = geometry.getCoordinates()
    if (coordinates.length === 1) {
      coordinates = geometry.getCoordinates()[0]
    }
    this.lableSource.clear()
    for (let i = 0; i < coordinates.length - 1; i++) {
      let lineLength = new LineString([coordinates[i], coordinates[i + 1]])
      let lengthDistance = this.caculateDistance(lineLength)
      let lengthFeature = new Feature({
        geometry: lineLength,
        distance: lengthDistance
      })
      this.lableSource.addFeature(lengthFeature)
    }
  },

  // 创建测量标注
  createMeasureTooltip: function () {
    var me = this
    if (me.measureTooltipElement) {
      me.measureTooltipElement.parentNode.removeChild(me.measureTooltipElement)
    }
    me.measureTooltipElement = document.createElement('div')
    me.measureTooltipElement.className = 'tooltip tooltip-measure'
    me.measureTooltip = new Overlay({
      element: me.measureTooltipElement,
      offset: [0, -15],
      positioning: 'bottom-center'
    })
    me.map.addOverlay(me.measureTooltip)
  },

  // 创建帮助提示框
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
    var helpMsg = '单击开始绘制'// 当前默认提示信息
    if (me.sketch) {
      var geomType = me.sketch.getGeometry().getType()
      if (geomType === 'Circle') {
        helpMsg = '再次单击完成绘制' // 绘制多边形时提示相应内容
      } else if (geomType === 'LineString' || geomType === 'Polygon') {
        helpMsg = '双击完成绘制' // 绘制线时提示相应内容
      }
    }
    me.helpTooltipElement.innerHTML = helpMsg // 将提示信息设置到对话框中显示
    me.helpTooltip.setPosition(evt.coordinate)// 设置帮助提示框的位置
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
  },
  // 面积
  _formatArea: function (polygon) {
    var me = this
    var area
    area = polygon.getArea()// 直接获取多边形的面积
    var output
    if (area > 10000) {
      output = (Math.round(area / 1000000 * 100) / 100) + ' ' + 'km<sup>2</sup>' // 换算成KM单位
    } else {
      output = (Math.round(area * 100) / 100) + ' ' + 'm<sup>2</sup>'// m为单位
    }
    return output // 返回多边形的面积
  }
}

export default drawGeometry
