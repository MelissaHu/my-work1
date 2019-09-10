/**
 * company:上海道枢信息
 * Time:2018-6-25
 * author:yuanlk
 * 地图封装类
 */

import Map from 'ol/map'
import View from 'ol/view'
import BaseTileMaps from './BaseTileMaps'
import proj4 from 'proj4'
import proj from 'ol/proj'

var MTIMap = function (options) {
  this.init(options)
}
MTIMap.prototype = {
  baseMapType: 'gaode', // 默认高德地图
  mapContainer: '', // 必填参数,地图元素
  baseTileMaps: null,
  center: [105, 40],
  zoom: 10,
  maxZoom: 20,
  minZoom: 3,
  map: null,
  projection: null,
  url: null,
  urlLayerName: null,
  origin: null,
  mapStyle: 'amap://styles/whitesmoke',
  // 初始化对象
  init: function (options) {
    var me = this
    Object.assign(this, options)
    me.configProjection() // 配置地图投影
    me.loadMap() // 初始化地图
  },
  // 加载地图
  loadMap: function () {
    var me = this
    me.map = new Map({
      target: me.mapContainer,
      loadTilesWhileAnimating: false, // 动态加载切片，提高用户体验，但在移动设备上影响性能
      view: new View({
        center: me.xyfromLonLat(me.center),
        zoom: me.zoom,
        maxZoom: me.maxZoom,
        minZoom: me.minZoom,
        projection: me.projection
      })
    })
    me.addBaseLayer() // 加载底图切片
  },
  /**
     * 根据地图类型配置地图投影
     */
  configProjection: function () {
    var me = this
    if (me.baseMapType.length > 8) {
      var projectType = me.baseMapType.substring(0, 5)
    } else {
      var projectType = me.baseMapType
    }
    switch (projectType) {
      case 'baidu':
        if (proj4) {
          proj4.defs('BD-09', '+proj=merc +a=6378206 +b=6356584.314245179 +lat_ts=0.0 +lon_0=0.0 +x_0=0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs')
        } else {
          console.error('未引入proj4.js，无法调用修正百度地图加密坐标!')
        }
        // 获得BD-09投影
        me.projection = proj.get('BD-09')
        break
      case 'gaode':
        me.projection = proj.get('EPSG:3857')
        break
      case 'GDinter':
        me.projection = proj.get('EPSG:3857')
        break
      case 'qqMap':
        me.projection = proj.get('EPSG:900913')
        break
      default:
        me.projection = proj.get('EPSG:3857')
        break
    };
  },
  /**
     * 根据地图类型将经纬度坐标转换为平面坐标
     */
  xyfromLonLat: function (coords) {
    var me = this
    if (me.baseMapType.length > 8) {
      var projectType = me.baseMapType.substring(0, 5)
    } else {
      var projectType = me.baseMapType
    }
    switch (projectType) {
      case 'baidu':
        return proj4('EPSG:4326', 'BD-09', coords)
      case 'gaode':
        return proj.fromLonLat(coords)
      case 'GDinter':
        return proj.fromLonLat(coords)
      case 'qqMap':
        return proj.transform(coords, 'EPSG:4326', 'EPSG:900913')
      default:
        return proj.fromLonLat(coords)
    };
  },
  /**
     * 添加地图底图切片
     */
  addBaseLayer: function () {
    var me = this
    me.baseTileMaps = new BaseTileMaps({ map: me.map })
    var tileLayer = null
    if (me.baseMapType.length > 8) {
      var projectType = me.baseMapType.substring(0, 5)
      var tileType = me.baseMapType.substring(6, me.baseMapType.length)
    } else {
      var projectType = me.baseMapType
    }
    switch (projectType) {
      case 'baidu':
        tileLayer = me.baseTileMaps.getBdMap(tileType)
        break
      case 'tdt':
        tileLayer = me.baseTileMaps.getTDTAnnoTile()
        me.map.addLayer(me.baseTileMaps.getTDTVecTile())
        break
      case 'gaode':
        tileLayer = me.baseTileMaps.getGdMap()
        break
      case 'GDinter':
        tileLayer = me.baseTileMaps.getGeoWebCacheGdTile(me.url, me.urlLayerName, me.origin)
        break
      case 'qqMap':
        tileLayer = me.baseTileMaps.getQQMap()
        break
      default:
        tileLayer = me.baseTileMaps.getGdMap()
        break
    };
    me.map.addLayer(tileLayer)
  }
}

export default MTIMap
