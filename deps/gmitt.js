module.exports = function (n) {
  //发布订阅模式
  return {
    /**
     * 实例化一个Map结构的n，用于管理订阅者
     */
    all: (n = n || new Map()),
    /**
     * on方法用于订阅一个事件
     * @param e (string | symbol) 事件名
     * @param t Function  回调方法
     */
    on: function (e, t) {
      var i = n.get(e) //get方法用于返回键对应的值，如果不存在，则返回undefined。
      /**
       * 分两种情况
       * if i为undefined，则(i && i.push(t))为false， 执行 || 右边，往n里面设置键值对。
       * else i不为undefined，则往i里面push传入的t方法。这也是为啥项目热更新后，点击emit会执行多次的原因
       */
      ;(i && i.push(t)) || n.set(e, [t])
    },
    /**
     * off退订指定订阅者
     * @param e  (string | symbol) 事件名
     * @param t   Function 要删除的回调函数，这里是对比回调函数而不是key，所有务必传递正确
     */
    off: function (e, t) {
      var i = n.get(e)
      /**
       * 分两种情况
       * if i为undefined，则不处理（传入了不存在的订阅者）。
       * else 使用splice达到删除功能。这里巧用了无符号右移运算符，我们知道indexOf会返回指定元素出现的位置，不存在则会返回-1，
       * 当为-1时，(i.indexOf(t) >>> 0)===4294967295，splice自然无法截取到,这样省去了if else判断。
       * 注意的是，第二个参数不要使用匿名函数（箭头函数），两个匿名函数不是同一个内存地址，indexOf是强等于判断，会导致退订失败。
       * 无符号右移运算符->https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Bitwise_Operators#Unsigned_right_shift
       */
      i && i.splice(i.indexOf(t) >>> 0, 1)
    },
    /**
     * emit用来发布一个事件
     * @param e  (string | symbol) 事件名
     * @param t   Any 传递的参数
     */
    emit: function (e, t) {
      /**
       * 发布事件，需要处理两种情况,1：发布指定名称为e的事件 2：发布(*)事件。他们传递的参数不一样
       * (n.get(e) || []) get返回键对应的值,如果为undefined,则返回一个数组，防止slice报错。
       * slice返回一个新数组，原数组不会改变，slice有两个参数，都是可选的（有些文档说第一个参数必填，咋们以mdn为准），
       * https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/slice 。
       * map循环方法，并把参数t传递过去
       */
      ;(n.get(e) || []).slice().map(function (n) {
        n(t)
      }),
        (n.get("*") || []).slice().map(function (n) {
          n(e, t)
        })
    },
  }
}
