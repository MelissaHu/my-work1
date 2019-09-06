/**
 * company:上海道枢信息
 * Time:2018-7-2
 * author:yuanlk
 * 图形修改封装类
 */
import Stroke from 'ol/style/stroke'
import Style from 'ol/style/style'
import Circle from 'ol/style/circle'
import Fill from 'ol/style/fill'
import Icon from 'ol/style/icon'
import Collection from 'ol/collection'
import Modify from 'ol/interaction/Modify'
import Select from 'ol/interaction/select'


var modifyGeometry = function (options) {
  this.init(options)
};
modifyGeometry.prototype = {
  map: null, // 地图对象
  source: null,
  select: null, // 矢量选择工具
  modify: null, // 矢量修改工具
  lineColor: '#ff0000', // 线颜色
  lineWidth: 3, // 线宽度
  fillColor: 'rgba(255, 0, 0, 0.4)', // 面的图层颜色
  imagePath: null, // 点的图标路径
  imageScale: 0.5, // 点图标的缩放比例
  pointRadius: 7, // 如果为未传入图标路径，默认点样式为圆点形式，圆点的半径
  pointFillColor: '#ff0000', // 圆点的填充颜色
  pointStrokeColor: undefined, // 圆点的边界颜色
  pointStrokeWidth: undefined, // 圆点的的宽度
  modifiedFeature: null,
  selectFeature: null,
  /**
     * 工具初始化函数
     */
  init: function (options) {
    var me = this
        Object.assign(this, options)
    },
  /**
     * 样式函数
     */
  styleFunction: function () {
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
        width: me.lineWidth
      }),
      image: image
    })
  },
  /**
     * 开始修改要素
     */
  startModify: function (features, f) {
    var me = this
    me.modify = new Modify({
      features: new Collection([features]),
      style: me.styleFunction.bind(me)
    })
    this.map.addInteraction(this.modify)
    this.modify.on('modifyend', function (evt) {
      me.modifiedFeature = evt.features.getArray()[0]
      if (f) {
        f(me.modifiedFeature)
      }
    })
  },
  /**
     * 获取修改后的要素
     * @returns {修改后的要素对象}
     */
  getModifiedFeature: function () {
    return this.modifiedFeature
  },
  /**
     * 结束修改
     */
  endModify: function () {
    this.map.removeInteraction(this.modify)
        this.modifiedFeature = null
    },
  /**
     * 开始选择要素
     */
  startSelect: function (selectLayer, f) {
    var me = this
        me.select = new Select({
      layers: [selectLayer],
      style: me.styleFunction.bind(me)
    })
        this.map.addInteraction(me.select)
        me.select.on('select', function (evt) {
      if (evt.deselected.length == 0 && evt.selected.length > 0) {
        me.selectFeature = evt.selected[0]
            if (f) {
          f(me.selectFeature)
        }
      } else if (evt.deselected.length > 0 && evt.selected.length == 0) {
        me.selectFeature = null
          }
    })
  },
  /**
   * 保存原始要素，便于修改后撤销
   */
  saveOriginalFeature () {
    if (this.selectFeature) {
      return this.selectFeature.clone()
      } else {
      return null
      }
  },
  /**
     * 停止选择要素
     */
  endSelect: function () {
    this.map.removeInteraction(this.select)
        this.select = null
    },
  /**
     * 从图层中删除选择的要素，并返回删除的要素，便于再删除数据库的数据
     * 需传入source图层源
     *
     * @returns {this.selectFeature}
     */
  deleteFeature: function () {
    if (this.select && this.select.getFeatures()) {
      this.selectFeature = this.select.getFeatures().getArray()[0]
        }
    if (this.source) {
      this.source.removeFeature(this.selectFeature)
            this.endSelect()
            this.startSelect()
            return this.selectFeature
    } else {
      return -1
    }
  }
}

export default modifyGeometry
