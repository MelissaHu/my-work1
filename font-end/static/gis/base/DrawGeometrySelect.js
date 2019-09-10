/**
 * company:上海道枢信息
 * Time:2018-09-13
 * author:yuanlk
 * 根据绘制图形选择图层中的要素
 */

import proj from 'ol/proj'
import Stroke from 'ol/style/stroke'
import Style from 'ol/style/style'
import Circle from 'ol/style/circle'
import Fill from 'ol/style/fill'
import Icon from 'ol/style/icon'
import Point from 'ol/geom/point'
import Collection from 'ol/collection'
import Draw from 'ol/interaction/Draw'
import sourceVector from 'ol/source/vector'
import layerVector from 'ol/layer/vector'
import GeoJSON from 'ol/format/geojson'
import LineString from 'ol/geom/linestring'
import {polygon as TurfPolygon, buffer as TurfBuffer, lineString as TurfLineString} from '@turf/turf/turf';
import {point as TurfPoint, booleanPointInPolygon as TurfBooleanPointInPolygon} from '@turf/turf/turf';

let DrawGeometrySelect = function (options) {
  this.init(options)
};
DrawGeometrySelect.prototype = {
  map: null,
  selectStyle: null,
  selectFeature: null,
  drawTool: null,
  drawSource: null,
  bufferDistance: 200,
  /**
   * 工具初始化函数
   */
  init: function (options) {
    this.selectFeature = new Collection()
    Object.assign(this, options)
    this.drawSource = new sourceVector()
    let vectorLayer = new layerVector({
      source: this.drawSource,
      style: this.styleFunction
    })
    this.map.addLayer(vectorLayer)
  },
  _newInteraction: function (type) {
    let geometryFunction = null
    if (type === 'Square') {
      geometryFunction = Draw.createRegularPolygon(4)
      this.drawTool = new Draw({
        source: this.drawSource,
        type: 'Circle',
        geometryFunction: geometryFunction,
        style: this.styleFunction
      })
    } else if (type === 'Box') {
      geometryFunction = Draw.createBox()
      this.drawTool = new Draw({
        source: this.drawSource,
        type: 'Circle',
        geometryFunction: geometryFunction,
        style: this.styleFunction
      })
    } else{
      this.drawTool = new Draw({
        source: this.drawSource,
        type: type,
        style: this.styleFunction
      })
    }
  },
  selectPointsWithinPolygon: function (source, Polygons) {
    let polygon = TurfPolygon(Polygons)
    source.forEachFeature(feature => {
      let point = TurfPoint(proj.toLonLat(feature.getGeometry().getCoordinates()))
      if (TurfBooleanPointInPolygon(point, polygon)) {
        this.selectFeature.push(feature)
        feature.setStyle(this.selectStyle)
      }
    })
  },
  selectPointsWithinCircle: function (source, data) {
    let center = data.center
    let radius = data.radius
    let from = TurfPoint(center)
    source.forEachFeature(feature => {
      let line = new LineString([proj.fromLonLat(center), feature.getGeometry().getCoordinates()])
      let distance = line.getLength()
      if (distance < radius) {
        this.selectFeature.push(feature)
        feature.setStyle(this.selectStyle)
      }
    })
  },
  selectPointsNearbyLine: function (source, lines) {
    let line = TurfLineString(lines)
    let buffer = TurfBuffer(line, this.bufferDistance, {units: 'meters'})
    source.forEachFeature(feature => {
      let point = TurfPoint(proj.toLonLat(feature.getGeometry().getCoordinates()))
      if (TurfBooleanPointInPolygon(point, buffer)) {
        this.selectFeature.push(feature)
        feature.setStyle(this.selectStyle)
      }
    })
  },
  /**
   * 开始选择
   * type为选择类型： 'Polygon', 'Circle' ,'Square','Box'
   * source待选择要素的数据源
   * callback 回调函数 参数为选中要素的Collect集合
   *
   */
  startSelect: function (type, source, callback) {
    if (this.drawTool) {
      this.map.removeInteraction(this.drawTool)
    }
    this._newInteraction(type)
    this.map.addInteraction(this.drawTool)
    this.drawTool.on('drawend', evt => {
      this.selectFeature.forEach(feature => {
        feature.setStyle()
      })
      this.selectFeature.clear()
      this.drawSource.clear()
      let data = this.eventDataTools(evt)
      if (data.geometry) {
        if (data.geometry.type === 'Polygon') {
          let coordinates = data.geometry.coordinates
          this.selectPointsWithinPolygon(source, coordinates)
        } else if (data.geometry.type === 'LineString') {
          let coordinates = data.geometry.coordinates
          this.selectPointsNearbyLine(source, coordinates)
        }
      }else {
        this.selectPointsWithinCircle(source, data)
      }
      if (callback) {
        callback(this.selectFeature)
      }
    })
  },
  eventDataTools: function (evt) {
    var cFeature = evt.feature
    if (evt.feature.getGeometry().getType() === 'Circle') {
      var data = {}
      data.type = 'Circle';
      data.center = proj.toLonLat(evt.feature.getGeometry().getCenter())
      data.radius = evt.feature.getGeometry().getRadius()
      return data
    } else {
      var geoFormat = new GeoJSON()
      var data = geoFormat.writeFeature(cFeature, {
        dataProjection: proj.get('EPSG:4326'),
        featureProjection: proj.get('EPSG:3857')
      })
      return JSON.parse(data)
    }
  },
  /**
   * 关闭选择工具
   */
  stopSelect: function () {
    this.selectFeature.forEach(feature => {
      feature.setStyle()
    })
    this.selectFeature.clear()
    this.drawSource.clear()
    this.map.removeInteraction(this.drawTool)
  },
  stopDraw: function () {
    this.drawSource.clear()
    this.map.removeInteraction(this.drawTool)
  },
  /**
   * 样式函数
   */
  styleFunction: function () {
    return new Style({
      fill: new Fill({
        color: 'rgba(0,100,100,0.2)'
      }),
      stroke: new Stroke({
        color: 'rgb(0,0,255)',
        width: 2
      })
    })
  }
}

export default DrawGeometrySelect
