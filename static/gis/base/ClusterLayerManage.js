/**
 * company:上海道枢信息
 * Time:2018-12-5
 * author:yuanlk
 * 多动画聚合图层聚合管理 
 */
import AnimatedCluster from 'ol-ext/layer/AnimatedCluster';
import SelectCluster from './SelectCluster';
import Stroke from 'ol/style/stroke';
import Style from 'ol/style/style';
import Circle from 'ol/style/circle';
import Fill from 'ol/style/fill';
import Icon from 'ol/style/icon';
import Cluster from 'ol/source/cluster';
import Text from 'ol/style/text';

let ClusterLayerManage = function (options) {
  this.init(options);
};
ClusterLayerManage.prototype = {
  map: null,//地图对象
  clusterLayers: {},//聚合图层
  clusterSelecter: null,
  styleCaches: {},//各聚合图层样式缓存
  init: function (options) {
    Object.assign(this, options)
  },
  createClusterLayer: function (layerName, source, layerOpts) {
    let me = this;
    layerOpts = layerOpts || {}
    let clusterSource = new Cluster({
      distance: layerOpts.distance || 40,
      source: source
    });
    this.styleCaches[layerName] = {}
    let styleFunction = layerOpts.style ? layerOpts.style(layerName).bind(this) : this.getStyleFunctionByName(layerName).bind(this)
    if (!me.clusterLayers[layerName]) {
      me.clusterLayers[layerName] = new AnimatedCluster(
        {
          name: layerName,
          source: clusterSource,
          animationDuration: layerOpts.animationDuration || 500,
          style: styleFunction//聚簇的样式,
        });
      //  this.map.addLayer(me.clusterLayers[layerName])
    } else {
      // console.error('存在同名动画聚合图层!')
    }
  },
  /**
 * 根据图层名添加图层
 */
  addLayer: function (layerName) {
    this.map.addLayer(this.clusterLayers[layerName])
  },
  /**
   * 根据图层名移除图层
   */
  removeLayer: function (layerName) {
    this.map.removeLayer(this.clusterLayers[layerName])
  },

  /**
 * 获取图层
 */
  getLayer: function (layerName) {
    return this.clusterLayers[layerName]
  },

  /**
   * 绑定选择事件
   * callBack回调函数
   * style样式
   */
  OnSelect: function (callBack, style) {
    this.clusterSelecter = new SelectCluster(
      {
        circleMaxObjects: 0,
        animate: false,
        style: style
      })
     this.map.addInteraction(this.clusterSelecter);
    this.clusterSelecter.getFeatures().on(['add'], function (e) {//图层点击方法
      var features = e.element.get('features');
      if (callBack) {
        callBack(features)
      }
    }
    )
  },
  /**
   * 取消选择
   */
  OutSelect: function (callBack) {
    this.clusterSelecter.getFeatures().on(['remove'], function (e) {
      var features = e.element.get('features');
      if (callBack) {
        callBack(features)
      }
    })
  },
  /**
   * 消除选择
   */
  unSelect: function () {
    if (this.clusterSelecter) {
      this.map.removeInteraction(this.clusterSelecter);
    }
    this.clusterSelecter = null;
  },
  addSelect: function (style) {
    this.clusterSelecter = new SelectCluster(
      {
        circleMaxObjects: 0,
        animate: true,
        style: style
      })
      this.map.addInteraction(this.clusterSelecter);
  },

  //默认聚合样式，内部函数
  getStyleFunctionByName: function (layerName) {
    return function (feature, resolution) {
      let me = this
      let size = feature.get('features').length;
      let style = me.styleCaches[layerName][size];
      if (size == 1) {//聚簇单点的样式
        if (!style) {
          style = me.styleCaches[size] = new Style({
            image: new Circle(
              {
                radius: 10,
                stroke: new Stroke(
                  {
                    color: "rgba(255,255,0,0.5)",
                    width: 5,
                  }),
                fill: new Fill(
                  {
                    color: "rgba(255,0,0,1)"
                  })
              })
          });
        }
      } else {//聚簇多点的样式
        if (!style) {
          var color = size > 40 ? "192,0,0" : size > 10 ? "255,128,0" : "0,128,0";
          var lineWidth = size > 40 ? 10 : size > 12 ? 9 : 5;
          var radius = Math.max(10, Math.min(size * 0.75, 25));
          style = me.styleCaches[size] = new Style(
            {
              image: new Circle(
                {
                  radius: radius,
                  stroke: new Stroke(
                    {
                      color: "rgba(" + color + ",0.5)",
                      width: lineWidth,
                    }),
                  fill: new Fill(
                    {
                      color: "rgba(" + color + ",1)"
                    })
                }),
              text: new Text(
                {
                  text: size.toString(),
                  fill: new Fill(
                    {
                      color: '#fff'
                    })
                })
            });
        }
      }
      return [style];
    }
  }
}

export default ClusterLayerManage;
