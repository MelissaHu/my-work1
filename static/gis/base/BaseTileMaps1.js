/**
 * company:上海道枢信息
 * Time:2018-6-25
 * 更新与：2018-9-7
 * author:yuanlk
 * 地图调用地图封装类
 *
 */
import proj4 from 'proj4'
import proj from 'ol/proj'
import Tile from 'ol/layer/tile'
import XYZ from 'ol/source/xyz'
import TileGrid from 'ol/tilegrid/tilegrid'
import extent from 'ol/extent'
import TileImage from 'ol/source/tileimage'
import TileWMS from 'ol/source/tilewms'

var BaseTileMaps = function (options) {
  this.init(options)
}
BaseTileMaps.prototype = {
  map: null,
  tilelayer: null,
  BdProjection: null,
  roadLayer: null,
  /**
     * @desc:初始化
     */
  init: function (options) {
    var me = this
    $.extend(this, options)
    proj.setProj4(proj4)
  },
  /**
     * 添加高德地图瓦片
     */
  getGdMap: function () {
    this.tilelayer = new Tile({
      source: new XYZ({
        crossOrigin: 'anonymous', // 打印地图时不设置导致无法输出
        url: 'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}'
      })
    })
    return this.tilelayer
  },
  /**
     * 添加高德注记瓦片
     */
  getGdAnnMap: function () {
    this.tilelayer = new Tile({
      source: new XYZ({
        url: 'http://webst0{1-4}.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}'
      })
    })
    return this.tilelayer
  },
  /**
     * 添加高德卫星瓦片
     */
  getGdSatMap: function () {
    this.tilelayer = new Tile({
      source: new XYZ({
        url: 'http://webst0{1-4}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}'
      })
    })
    return this.tilelayer
  },
  _getQQTileURL: function (tileCoord, pixelRatio, projection) {
    var scale = tileCoord[0]
    var x = tileCoord[1]
    var y = -tileCoord[2] - 1
    var reurl = ''
    y = Math.pow(2, scale) - 1 - y
    return 'http://rt2.map.gtimg.com/tile?z=' + scale + '&x=' + x + '&y=' + y + '&styleid=2000&scene=0&version=236'
  },
  /**
     * 添加腾讯地图瓦片
     */
  getQQMap: function () {
    var projection = proj.get('EPSG:900913')
    var projectionExtent = projection.getExtent()
    var maxResolution = extent.getWidth(projectionExtent) / (256)
    var resolutions = new Array(23)
    var matrixIds = new Array(23)
    for (var z = 0; z < resolutions.length; ++z) {
      resolutions[z] = maxResolution / Math.pow(2, z)
      matrixIds[z] = 'EPSG:900913:' + z
    }
    this.tilelayer = new Tile({
      title: 'satelite',
      source: new XYZ({
        url: '',
        projection: 'EPSG:900913',
        tileGrid: new TileGrid({
          resolutions: resolutions,
          tileSize: 256,
          origin: extent.getTopLeft(projectionExtent)
        }),
        tileUrlFunction: this._getQQTileURL
      })
    })
    return this.tilelayer
  },
  /**
     * 添加要切换的地图图层，并默认向地图添加第一个图层
     */
  getBdMapProjection: function (lever, coords) {
    if (proj4) {
      proj4.defs('BD-09', '+proj=merc +a=6378206 +b=6356584.314245179 +lat_ts=0.0 +lon_0=0.0 +x_0=0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs')
    } else {
      console.error('未引入proj4.js，无法调用修正百度地图加密坐标!')
    }
    this.BdProjection = proj.get('BD-09')
    return this.BdProjection
  },
  /**
     * 将“百度地图”上拾取下的坐标转换为调用百度瓦片下的xy坐标
     * @param coordss
     * @returns coords
     */
  convertBdCoords: function (coords) {
    if (this.BdProjection) {
      return proj4('EPSG:4326', 'BD-09', coords)// 转换为百度坐标
    } else {
      console.error('为设置百度地图投影无法转换坐标')
    }
  },
  /**
     * 根据样式添加百度地图
     * 默认地图样式(normal)
     * 清新蓝风格(light)
     * 黑夜风格(dark)
     * 红色警戒风格(redalert)
     * 精简风格(googlelite)
     * 自然绿风格(grassgreen)
     * 午夜蓝风格(midnight)
     * 浪漫粉风格(pink)
     * 青春绿风格(darkgreen)
     * 清新蓝绿风格(bluish)
     * 高端灰风格(grayscale)
     * 强边界风格(hardedge)
     * 具体见 http://lbsyun.baidu.com/custom/list.htm
     */
  getBdMap: function (style) {
    var resolutions = []
    for (var i = 0; i < 19; i++) {
      resolutions[i] = Math.pow(2, 18 - i)
    }
    var tilegrid = new TileGrid({
      origin: [0, 0],
      resolutions: resolutions
    })
    var baidu_source = new TileImage({
      projection: this.BdProjection,
      tileGrid: tilegrid,
      tileUrlFunction: function (tileCoord, pixelRatio, proj) {
        if (!tileCoord) {
          return ''
        }
        var z = tileCoord[0]
        var x = tileCoord[1]
        var y = tileCoord[2]
        var sub = x % 2
        if (x < 0) {
          x = 'M' + (-x)
        }
        if (y < 0) {
          y = 'M' + (-y)
        }
        return 'http://api' + sub + '.map.bdimg.com/customimage/tile/?x=' + x + '&y=' + y + '&z=' + z + '&customid=' + style
      }
    })
    this.tilelayer = new Tile({
      source: baidu_source
    })
    return this.tilelayer
  },
  /**
   * 百度地图卫星地图
   */
  getBdSatMap: function () {
    var resolutions = []
    for (var i = 0; i < 19; i++) {
      resolutions[i] = Math.pow(2, 18 - i)
    }
    var tilegrid = new TileGrid({
      origin: [0, 0],
      resolutions: resolutions
    })
    var baidu_source = new TileImage({
      projection: this.BdProjection,
      tileGrid: tilegrid,
      tileUrlFunction: function (tileCoord, pixelRatio, proj) {
        if (!tileCoord) {
          return ''
        }
        var z = tileCoord[0]
        var x = tileCoord[1]
        var y = tileCoord[2]
        var sub = x % 2
        if (x < 0) {
          x = 'M' + (-x)
        }
        if (y < 0) {
          y = 'M' + (-y)
        }
        return 'https://ss' + sub + '.bdstatic.com/8bo_dTSlR1gBo1vgoIiO_jowehsv/starpic/?qt=satepc&u=x=' + x + ';y=' + y + ';z=' + z + ';v=009;type=sate&fm=46&app=webearth2&v=009'
      }
    })
    this.tilelayer = new Tile({
      source: baidu_source
    })
    return this.tilelayer
  },
  /**
   * 百度地图注记
   */
  getBdAnnMap: function () {
    var resolutions = []
    for (var i = 0; i < 19; i++) {
      resolutions[i] = Math.pow(2, 18 - i)
    }
    var tilegrid = new TileGrid({
      origin: [0, 0],
      resolutions: resolutions
    })
    var baidu_source = new TileImage({
      projection: this.BdProjection,
      tileGrid: tilegrid,
      tileUrlFunction: function (tileCoord, pixelRatio, proj) {
        if (!tileCoord) {
          return ''
        }
        var z = tileCoord[0]
        var x = tileCoord[1]
        var y = tileCoord[2]
        var sub = x % 2
        if (x < 0) {
          x = 'M' + (-x)
        }
        if (y < 0) {
          y = 'M' + (-y)
        }
        return 'http://online' + sub + '.map.bdimg.com/tile/?qt=tile&x=' + x + '&y=' + y + '&z=' + z + '&styles=sl'
      }
    })
    this.tilelayer = new Tile({
      source: baidu_source
    })
    return this.tilelayer
  },
  clearTileLayer: function () {
    this.tilelayer = null
  },
  _getTileTrafficURL: function (tileCoord, pixelRatio, projection) {
    var scale = tileCoord[0]
    var x = tileCoord[1]
    var y = -tileCoord[2] - 1
    var reurl = ''
    var timeKey = (new Date().getTime() / 1000)
    y = Math.pow(2, scale) - 1 - y
    var balance = ['', 'a', 'b', 'c']
    var balanceItem = parseInt(4 * Math.random())
    return 'http://rtt2' + balance[balanceItem] + '.map.qq.com/rtt/?z=' + scale + '&x=' + x + '&y=' + y + '&times=1&time=' + timeKey
  },
  /**
     * 添加腾讯地图实时路况
     */
  getQQrealRoads: function () {
    var projection = proj.get('EPSG:900913')
    var projectionExtent = projection.getExtent()
    var maxResolution = extent.getWidth(projectionExtent) / (256)
    var resolutions = new Array(23)
    var matrixIds = new Array(23)
    for (var z = 0; z < resolutions.length; ++z) {
      resolutions[z] = maxResolution / Math.pow(2, z)
      matrixIds[z] = 'EPSG:900913:' + z
    }
    this.roadLayer = new Tile({
      title: 'soso_rtic',
      source: new XYZ({
        url: '',
        projection: 'EPSG:900913',
        tileGrid: new TileGrid({
          resolutions: resolutions,
          tileSize: 256,
          origin: extent.getTopLeft(projectionExtent)
        }),
        tileUrlFunction: this._getTileTrafficURL
      })
    })
    return this.roadLayer
  },
  /**
     * 百度地图实时路况
     */
  getBDrealRoads: function () {
    var resolutions = []
    for (var i = 0; i < 19; i++) {
      resolutions[i] = Math.pow(2, 18 - i)
    }
    var timeKey = new Date().getTime()
    var tilegrid = new TileGrid({
      origin: [0, 0],
      resolutions: resolutions
    })
    var baidu_source = new TileImage({
      projection: this.BdProjection,
      tileGrid: tilegrid,
      tileUrlFunction: function (tileCoord, pixelRatio, proj) {
        if (!tileCoord) {
          return ''
        }
        var z = tileCoord[0]
        var x = tileCoord[1]
        var y = tileCoord[2]
        var sub = x % 2
        if (x < 0) {
          x = 'M' + (-x)
        }
        if (y < 0) {
          y = 'M' + (-y)
        }
        return 'http://its.map.baidu.com:8002/traffic/TrafficTileService?level=' + z + '&x=' + x + '&y=' + y + '&time=' + timeKey + '&v=081&scaler=1'
      }
    })
    let BDdeMapLayerRoad = new Tile({
      source: baidu_source
    })
    return BDdeMapLayerRoad
  },
  /**
     * 高德地图实时路况
     */
  getGDrealRoads: function () {
    let timeKey = new Date().getTime()
    let gaodeMapLayerRoad = new Tile({
      source: new XYZ({
        url: 'http://tm.amap.com/trafficengine/mapabc/traffictile?v=1.0&;t=1&x={x}&y={y}&z={z}&&t=' + timeKey
      })
    })
    return gaodeMapLayerRoad
  },
  clearRoadLayer: function () {
    this.roadLayer = null
  },
  /**
   * 调用geowebcache发布的离线高德地图瓦片
   * url 图层服务地址
   * layerName图层名
   * origin起始坐标
   */
  getGeoWebCacheGdTile: function (url, layerName, origin) {
    var resolutions = [156543.033928, 78271.5169639999, 39135.7584820001, 19567.8792409999, 9783.93962049996, 4891.96981024998, 2445.98490512499, 1222.99245256249,
      611.49622628138, 305.748113140558, 152.874056570411, 76.4370282850732, 38.2185141425366, 19.1092570712683, 9.55462853563415, 4.77731426794937, 2.38865713397468,
      1.19432856685505, 0.597164283559817]
    var tileLayer = new Tile({
      source: new TileWMS({
        url: url,
        params: {
          'LAYERS': layerName,
          'FORMAT': 'image/png',
          'SRS': 'EPSG:3857'
        },
        tileGrid: new TileGrid({
          resolutions: resolutions,
          tileSize: 256,
          origin: origin
        }),
        projection: 'EPSG:3857'
      })
    })
    return tileLayer
  },
  /**
   * 天地图矢量图
   */
  getTDTVecTile: function () {
    var tileLayer = new Tile({
      title: '天地图文字标注',
      source: new XYZ({
        url: 'http://t{1-7}.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}'
      })
    })

    return tileLayer
  },
  /**
   * 天地图注记图
   */
  getTDTAnnoTile: function () {
    var tileLayer = new Tile({
      title: '天地图文字标注',
      source: new XYZ({
        url: 'http://t{1-7}.tianditu.com/DataServer?T=cva_w&x={x}&y={y}&l={z}'
      })
    })
    return tileLayer
  },
  /**
   * 天地图影像图
   */
  getTDTImgTile: function () {
    var tileLayer = new Tile({
      title: '天地图影像图',
      source: new XYZ({
        url: 'http://t{1-7}.tianditu.com/DataServer?T=img_w&x={x}&y={y}&l={z}'
      })
    })
    return tileLayer
  },
  /**
   * 天地图影像图注记
   */
  getTDTImgAnnoTile: function () {
    var tileLayer = new Tile({
      title: '天地图影像图注记',
      source: new XYZ({
        url: 'http://t{1-7}.tianditu.com/DataServer?T=cia_w&x={x}&y={y}&l={z}'
      })
    })
    return tileLayer
  }
}

export default BaseTileMaps
