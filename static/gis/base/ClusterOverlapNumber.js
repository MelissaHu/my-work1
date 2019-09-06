/**
 * company:上海道枢信息
 * Time:2018-7-12
 * author:yuanlk
 * 地图点位动画聚合
 */
import AnimatedCluster from 'ol-ext/layer/AnimatedCluster'
import SelectCluster from './SelectClusterOverlap'
import Stroke from 'ol/style/stroke'
import Style from 'ol/style/style'
import Circle from 'ol/style/circle'
import Fill from 'ol/style/fill'
import Icon from 'ol/style/icon'
import IconImage from 'ol/style/IconImage'
import LineString from 'ol/geom/linestring'
import Cluster from 'ol/source/cluster'
import Text from 'ol/style/text'

var MTICluster = function (options) {
  this.init(options)
}
MTICluster.prototype = {
  map: null,
  source: null,
  clusterSource: null,
  clusterLayer: null,
  iconUrl: null,
  iconBgUrl: null, // 聚合多点的图标
  activeIconUrl: '', // 单个点选中的样式
  selectCluster: null,
  maxSelect: 10,
  init: function (options) {
    var me = this
    me.map = options.map
    me.styleCache = {}
    me.maxSelect = options.maxSelect || 10
    me.iconUrl = options.iconUrl
    me.activeIconUrl = options.activeIconUrl
    me.iconBgUrl = options.iconBgUrl
    me.numberCount = options.numberCount
    me.clusterSource = new Cluster({
      distance: 40,
      source: options.source
    })
    me.clusterLayer = new AnimatedCluster({
      name: 'Cluster',
      source: me.clusterSource,
      animationDuration: 500,
      // 利用bind()将当前的对象绑定到getStyle函数中，便于在getStyle函数作用域中拿到当前实例化对象的属性，
      style: this.getStyle.bind(this) // 聚簇的样式,
    })
    me.selectCluster = new SelectCluster({
      maxSelect: this.maxSelect,
      maxObjects: this.maxSelect,
      pointRadius: 100, // 点击聚簇点弹出的图层，点之间的距离
      animate: true,
      featureStyle: function (f, res) {
        if (f.getProperties().geometry instanceof LineString) {
          return new Style( // 点击聚簇点弹出的图层样式
            {
              // 弹出图层中间线
              stroke: new Stroke({
                color: 'rgba(3,255,252,1)',
                width: 1,
                lineDash: [10, 10]
              })
            })
        } else {
          return new Style( // 点击聚簇点弹出的图层样式
            {
              image: new Icon({
                scale: 0.6, // 图标缩放比例
                src: me.iconUrl // 图标的url
              }),
              text: new Text({
                text: me.numberCount,
                font: 24,
                offsetY: -10,
                fill: new Fill({
                  color: 'rgba(3,255,252,1)'
                })
              })
            })
        }
      },
      style: function (f, res) {
        var cluster = f.get('features')
        if (cluster && cluster.length) {
          if (cluster.length > 1) {
            var s = me.getStyle(f, res)
            return s
          } else {
            return [
              new Style({
                image: new Icon(({
                  scale: 1, // 图标缩放比例
                  src: me.activeIconUrl ? me.activeIconUrl : me.iconUrl // me.iconUrl //选中图标的url
                }))
              })
            ]
          }
        }
      }
    })
    me.map.addInteraction(me.selectCluster)
  },
  getStyle: function (feature, resolution) {
    var me = this
    var size = feature.get('features').length
    var style = me.styleCache[size]
    if (size == 1) { // 聚簇单点的样式
      if (!style) {
        style = me.styleCache[size] = new Style({
          image: new Icon(({
            scale: 0.4, // 图标缩放比例
            src: me.iconUrl // 图标的url
          }))
        })
      }
    } else { // 聚簇多点的样式
      if (!style) {
        var color = size > 40 ? '192,0,0' : size > 10 ? '255,128,0' : '0,128,0'
        var lineWidth = size > 40 ? 10 : size > 12 ? 9 : 5
        var radius = Math.max(10, Math.min(size * 0.75, 25))
        // 不同图层图标样式修改
        style = me.styleCache[size] = new Style({
          image: new Icon(({
            scale: 0.8, // 图标缩放比例
            src: me.iconBgUrl // 图标的url
          })),
          text: new Text({
            text: size.toString(),
            fill: new Fill({
              color: '#fff'
            })
          })
        })
      }
    }
    return [style]
  },
  // // 绑定选定事件，且小于me.maxSelect时触发
  // onSelect (f) {
  //   var me = this
  //   this.selectCluster.getFeatures().on(['add'], function (e) { // 图层点击方法
  //     var features = e.element.get('features')
  //     if (f && features.length <= me.maxSelect) {
  //       f(features)
  //     }
  //   })
  // },
  // // 绑定切换选择事件，且小于me.maxSelect时触发
  // outSelect (f) {
  //   var me = this
  //   this.selectCluster.getFeatures().on(['remove'], function (e) {
  //     var features = e.element.get('features')
  //     if (f && features.length <= me.maxSelect) {
  //       f(features)
  //     }
  //   })
  // },
  // 添加聚合图层
  addClusterLayer: function () {
    var me = this
    me.map.addLayer(me.clusterLayer)
  },
  // 移除聚合图层
  removeClusterLayer: function () {
    var me = this
    me.map.removeLayer(me.clusterLayer)
  },
  /**
     * 消除选择
     */
  unSelect: function () {
    if (this.selectCluster) {
      this.map.removeInteraction(this.selectCluster)
    }
    this.clusterSelecter = null
  }
}

export default MTICluster
