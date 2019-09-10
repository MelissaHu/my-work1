/**
 * company:上海道枢信息
 * Time:2018-7-12
 * author:yuanlk
 * 地图点位动画聚合
 */
import AnimatedCluster from 'ol-ext/layer/AnimatedCluster'
import Stroke from 'ol/style/stroke'
import Style from 'ol/style/style'
import Circle from 'ol/style/circle'
import Fill from 'ol/style/fill'
import Icon from 'ol/style/icon'
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
  iconUrl: null, // 单个聚合点的图标
  iconBgUrl: null, // 聚合多点的图标
  maxSelect: 10,
  openClusterstyle: new Style( // 点击聚簇点弹出的图层样式
    {
      // image: new Circle(
      //   {
      //     stroke: new Stroke({color: "#fff", width: 5}),
      //     fill: new Fill({color: "#3399cc"}),
      //     radius: 10
      //   }),
      // // 弹出图层中间线
      // stroke: new Stroke(
      //   {
      //     color: "#fff",
      //     width: 1
      //   })
    }),
  init: function (options) {
    var me = this
    me.map = options.map
    me.styleCache = {}
    me.maxSelect = options.maxSelect || 10
    me.iconUrl = options.iconUrl
    me.iconBgUrl = options.iconBgUrl
    me.clusterSource = new Cluster({
      distance: 40,
      source: options.source
    })
    me.clusterLayer = new AnimatedCluster(
      {
        name: 'Cluster',
        source: me.clusterSource,
        animationDuration: 500,
        // 利用bind()将当前的对象绑定到getStyle函数中，便于在getStyle函数作用域中拿到当前实例化对象的属性，
        style: this.getStyle.bind(this)// 聚簇的样式,
      })
    me.map.addLayer(me.clusterLayer)
  },
  getStyle: function (feature, resolution) {
    var me = this
    var size = feature.get('features').length
    var style = me.styleCache[size]
    if (size === 1) { // 聚簇单点的样式
      if (!style) {
        // 不同图层图标样式修改
        style = me.styleCache[size] = new Style({
          image: new Icon({
            scale: 0.6, // 图标缩放比例
            src: me.iconUrl // 图标的url
          }),
          text: new Text({
            text: size.toString(),
            fill: new Fill({
              color: '#fff'
            })
            // font:
          })
        })
      }
    } else { // 聚簇多点的样式
      if (!style) {
        var color = size > 40 ? '192,0,0' : size > 10 ? '255,128,0' : '0,128,0'
        var lineWidth = size > 40 ? 10 : size > 12 ? 9 : 5
        var radius = Math.max(10, Math.min(size * 0.75, 25))
        // 不同图层图标样式修改
        style = me.styleCache[size] = new Style(
          {
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
  // getFeatures: function () {
  //   var me = this
  //   me.clusterSource.getSource()
  // },
  removeFreature:function(feature){
    var me  =this
    me.clusterSource.removeFeature(feature)
  }
}

export default MTICluster
