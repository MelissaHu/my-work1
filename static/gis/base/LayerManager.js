/**
 * company:上海道枢信息
 * Time:2018-6-26
 * author:gaopo
 * 图层管理
 */
import sourceVector from 'ol/source/vector'
import layerVector from 'ol/layer/vector'
import GeoJSON from 'ol/format/geojson'
import $ from 'jquery'

var layerManage = function (options) {
  this.init(options)
}
layerManage.prototype = {
  map: null,
  lys: {},
  eventMg: {},
  project: null,

  /**
   * @desc:初始化
   * @author GaoPo
   * @date 2018/04/24 16:25:10
   */
  init: function (options) {
    var me = this
    $.extend(this, options)
  },
  /**
   * @desc: 添加图层
   * @author GaoPo
   * @date 2018/04/24 16:25:01
   */
  addLayer: function (layerName, layerObj) {
    var me = this
    var ly = me.lys[layerName]
    if (ly != null || ly != undefined) {
      me.map.removeLayer(ly)
    }
    me.map.addLayer(layerObj)
    me.lys[layerName] = layerObj
    return layerObj
  },
  /**
   * @desc:获取图层
   * @author GaoPo
   * @date 2018/04/24 16:24:43
   */
  getLayer: function (layerName) {
    var me = this
    return me.lys[layerName]
  },

  /**
   * @desc: 移除layer对象
   * @author GaoPo
   * @date 2018/04/24 16:24:28
   */
  removeLayer: function (layerName) {
    var me = this;
    var ly = me.getLayer(layerName);
    if (ly === null || ly === undefined) {
      
    } else {
      me.map.removeLayer(ly);
      for (var i = 0; i < me.lys.length; i++) {
        if (me.lys[i] === ly) {
          me.lys.splice(i, 1);
          return;
        }
      }
    }
  },
  /**
   * @desc:设置图层的可见性
   * @author GaoPo
   * @date 2018/04/24 16:24:09
   */
  setLayerVisible: function (layerName, visible) {
    var me = this
    var ly = me.getLayer(layerName)
    ly.setVisible(visible)
  },

  /**
   * @desc:创建矢量图层
   * @author GaoPo
   * lyname:String  图层名
   * style:ol.style.Style或ol.StyleFunction 图层样式
   * @date 2018/04/24 16:23:28
   */
  createVectorLy: function (lyname, style) {
    var ly = new layerVector({
      source: new sourceVector(),
      name: lyname
    })
    if (style != null || style != undefined) {
      ly.setStyle(style)
    }
    return ly
  },
  /**
   * @desc:添加要素到图层中
   * @author GaoPo
   * @date 2018/04/24 16:26:13
   */
  addFeatures: function (fts, layerName) {
    var me = this
    var ly = me.getLayer(layerName)
    ly.getSource().addFeatures(fts)
  },
  /**
   * @desc:添加要素到图层中
   * @author GaoPo
   * @date 2018/04/24 16:26:13
   */
  addFeature: function (ft, layerName) {
    var me = this
    var ly = me.getLayer(layerName)
    ly.getSource().addFeature(ft)
  },
  /**
   * @desc: 删除图层中指定要素
   * @author GaoPo
   * @date 2018/05/10 11:00:19
   */
  removeFeature: function (ft, layerName) {
    var me = this
    var ly = me.getLayer(layerName)
    ly.getSource().removeFeature(ft)
  },
  /**
   * @desc: 清除指定图层中所有数据
   * @author GaoPo
   * @date 2018/05/10 10:58:17
   */
  clearLayer: function (layerName) {
    var me = this
    var ly = me.getLayer(layerName)
    ly.getSource().clear()
  },

  /**
   * (废弃)
   * @desc: 读取geojson数据，输出成features
   * @author GaoPo
   * @date 2018/04/24 17:15:01
   * o:4326    t:3875
   */
  readGeoJSON: function (geojson, o, t) {
    var me = this
    var features = (new GeoJSON()).readFeatures(geojson, {
      dataProjection: 'EPSG:' + o,
      featureProjection: 'EPSG:' + t
    })
    return features
  },
  /**
   * (废弃)
   * @desc: 将要素生成为geojson
   * @author GaoPo
   * @date 2018/04/25 16:56:48
   * o:3857    t:4326
   */
  writeGeoJSON: function (fts, o, t) {
    var me = this
    var geojson = (new GeoJSON()).writeGeometry(fts, {
      dataProjection: 'EPSG:' + t,
      featureProjection: 'EPSG:' + o
    })
    return geojson
  },

  /**
   * @desc: 从GeoJson中读取feature要素
   * @author GaoPo
   * @date 2018/04/24 17:15:01
   * o:4326    t:3875
   */
  readFeature: function (geojson, o, t) {
    var me = this
    var feature = (new GeoJSON()).readFeature(geojson, {
      dataProjection: 'EPSG:' + o,
      featureProjection: 'EPSG:' + t
    })
    return feature
  },
  /**
   * @desc: 从GeoJson中读取feature要素集
   * @author GaoPo
   * @date 2018/04/24 17:15:01
   * o:4326    t:3875
   */
  readFeatures: function (geojson, o, t) {
    var me = this
    var features = (new GeoJSON()).readFeatures(geojson, {
      dataProjection: 'EPSG:' + o,
      featureProjection: 'EPSG:' + t
    })
    return features
  },
  /**
   * @desc: 从GeoJson中读取geometry几何体
   * @author GaoPo
   * @date 2018/04/24 17:15:01
   * o:4326    t:3875
   */
  readGeometry: function (geojson, o, t) {
    var me = this
    var geo = (new GeoJSON()).readGeometry(geojson, {
      dataProjection: 'EPSG:' + o,
      featureProjection: 'EPSG:' + t
    })
    return geo
  },

  /**
   * @desc: 将feature要素转为geojson字符串
   * @author GaoPo
   * @date 2018/04/24 17:15:01
   * o:4326    t:3875
   */
  writeFeature: function (ft, o, t) {
    var me = this
    var geojson = (new GeoJSON()).writeFeature(ft, {
      dataProjection: 'EPSG:' + t,
      featureProjection: 'EPSG:' + o
    })
    return geojson
  },

  /**
   * @desc: 将feature要素集转为geojson字符串
   * @author GaoPo
   * @date 2018/04/24 17:15:01
   * o:4326    t:3875
   */
  writeFeatures: function (fts, o, t) {
    var me = this
    var geojson = (new GeoJSON()).writeFeatures(fts, {
      dataProjection: 'EPSG:' + t,
      featureProjection: 'EPSG:' + o
    })
    return geojson
  },

  /**
   * @desc: 将geometry几何体转为geojson字符串
   * @author GaoPo
   * @date 2018/04/24 17:15:01
   * o:4326    t:3875
   */
  writeGeometry: function (geo, o, t) {
    var me = this
    var geojson = (new GeoJSON()).writeGeometry(geo, {
      dataProjection: 'EPSG:' + t,
      featureProjection: 'EPSG:' + o
    })
    return geojson
  },
  /**
   * @desc: 将geometry几何体转为geojson对象
   * @author GaoPo
   * @date 2018/04/24 17:15:01
   * o:4326    t:3875
   */
  writeGeometryObject: function (geo, o, t) {
    var me = this
    var geojson = (new GeoJSON()).writeGeometryObject(geo, {
      dataProjection: 'EPSG:' + t,
      featureProjection: 'EPSG:' + o
    })
    return geojson
  },

  /**
   * @desc: 增加图层点击事件
   * @author GaoPo
   * @date 2018/05/28 19:17:52
  */
  lyASingleClickEvent: function (lyname, eventName, that, callback) {
    var me = this
    me.lyRSingleClickEvent(eventName)
    me.eventMg[eventName] = me.map.on('singleclick', function (evt) {
      var fts = me.map.getFeaturesAtPixel(evt.pixel, {
        layerFilter: function (ly) {
          if (ly.get('name') === lyname) {
            return true
          } else {
            return false
          }
        }
      })
      callback.apply(that, [fts])//此处不判断是否点击处有数据

    })
  },
  /**
   * @desc: 删除图层点击事件
   * @author GaoPo
   * @date 2018/05/28 19:18:05
  */
  lyRSingleClickEvent: function (eventName) {
    var me = this
    var event = me.eventMg[eventName]
    if (event != null || event != undefined) {
      me.map.unByKey(event)
    }
  },

  /**
   * @desc: 增加鼠标移动到图层，改变鼠标样式事件
   * cursor : default , help , wait , crosshair , move , pointer
   * @author GaoPo
   * @date 2018/05/29 15:47:47
  */
  lyAMouseCursorEvent: function (lyname, eventName, cursor) {
    var me = this
    me.lyRMouseCursorEvent(eventName)
    me.eventMg[eventName] = me.map.on('pointermove', function (evt) {
      var hit = me.map.hasFeatureAtPixel(evt.pixel, {
        layerFilter: function (ly) {
          if (ly.get('name') === lyname) {
            return true
          } else {
            return false
          }
        }
      })
      me.map.getTargetElement().style.cursor = hit ? cursor : ''
    })
  },
  /**
   * @desc: 删除鼠标移动到图层，改变鼠标样式事件
   * @author GaoPo
   * @date 2018/05/29 15:47:04
  */
  lyRMouseCursorEvent: function (eventName) {
    var me = this
    var event = me.eventMg[eventName]
    if (event != null || event != undefined) {
      me.map.unByKey(event)
    }
  }

}

export default layerManage
