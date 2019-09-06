/**
 * company:上海道枢信息
 * Time:2018-6-29
 * author:yuanlk
 * 地图画图封装类
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
import Observable from 'ol/observable';


import {buffer as TurfBuffer, point as TurfPoint, lineString as TurfLineString} from '@turf/turf/turf';

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
  lineColor: '#0000ff', // 线颜色
  lineWidth: 3, // 线宽度
  fillColor: 'rgba(0, 0, 255, 0.4)', // 面的图层颜色
  imagePath: null, // 点的图标路径
  imageScale: 0.5, // 点图标的缩放比例
  pointRadius: 7, // 如果为未传入图标路径，默认点样式为圆点形式，圆点的半径
  pointFillColor: '#0000ff', // 圆点的填充颜色
  pointStrokeColor: undefined, // 圆点的边界颜色
  pointStrokeWidth: undefined, // 圆点的的宽度
  lineDash: undefined,
  bufferSource: null,
  bufferLayer: null,
  bufferDistance: 100, // 缓冲距离，单位米
  lineBufferBool: false,
  /**
     * 工具初始化函数
     */
  init: function (options) {
    var me = this
    Object.assign(this, options)
    if (!me.source) {
      me._source = new sourceVector()
      me._vectorLayer = new layerVector({
        source: me._source,
        style: me.drawStyleFunction.bind(me)
      })
      me.map.addLayer(me._vectorLayer)
      this.bufferSource = new sourceVector()
      this.bufferLayer = new layerVector({
        source: this.bufferSource,
        style: function (feature) {
          return new Style({
            fill: new Fill({
              color: 'rgba(0,80,168,0.3)'
            }),
            stroke: new Stroke({
              color: 'rgba(3,255,252,1)',
              lineDash: [10, 10],
              width: 2
            })
          })
        }
      })
      me.map.addLayer(this.bufferLayer)
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
      //me.bufferSource.clear()
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
    me._newInteraction.call(me, type)
    if (type === 'LineBuffer') {
      this.lineBufferBool = true
      me._newInteraction.call(me, 'LineString')
    } else {
      this.lineBufferBool = false
      me._newInteraction.call(me, type)
    }
    me.map.addInteraction(me.draw)
    me.draw.on('drawend', function (evt) {
      if(me.geometrychangeKey){ 
        Observable.unByKey(me.geometrychangeKey)
        me.geometrychangeKey=null
      }
     me.bufferSource.clear() 
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
      });
      if (this.lineBufferBool) {
        let coordinates = JSON.parse(data).geometry.coordinates
        let lineFence = TurfLineString(coordinates)
        let buffered = TurfBuffer(lineFence, this.bufferDistance, {units: 'meters'})
        return buffered
      } else {
        return data
      }
    }
  }
}

export default drawGeometry
