// 事件类型可以是: 字符串 | symbol
export type EventType = string | symbol

// An event handler can take an optional event argument and should not return a value
// 泛型没指定的话, 默认为（是不是默认的意思呢？）: 顶级类型 unknown, (这是为了避免开发时类型推导的性能损耗么？)，尽量避免使用 any, unknown 可以认为是安全版本的 any
export type Handler<T = unknown> = (event: T) => void

// keyof (见总结 2.1)
// T[keyof T] 实际上是联合类型 （见总结 2.2）
// Record 工具函数 (见总结 2.3)
export type WildcardHandler<T = Record<string, unknown>> = (
  type: keyof T,
  event: T[keyof T]
) => void

// An array of all currently registered event handlers for a type
export type EventHandlerList<T = unknown> = Array<Handler<T>>
export type WildCardEventHandlerList<T = Record<string, unknown>> = Array<
  WildcardHandler<T>
>

// A map of event types and their corresponding event handlers.
// 这里的 Map 指的实际上是 ES6 的 Map， new Map 的这个 Map, 项目里可以用`Command + 鼠标左键`点击Map 查看具体内容
export type EventHandlerMap<Events extends Record<EventType, unknown>> = Map<
  keyof Events | "*",
  EventHandlerList<Events[keyof Events]> | WildCardEventHandlerList<Events>
>

export interface Emitter<Events extends Record<EventType, unknown>> {
  all: EventHandlerMap<Events>

  // 重载（需要重载的原因: 根据 type 是否为'*', handler的参数会发生变化）
  on<Key extends keyof Events>(type: Key, handler: Handler<Events[Key]>): void
  on(type: "*", handler: WildcardHandler<Events>): void

  // 重载
  off<Key extends keyof Events>(type: Key, handler?: Handler<Events[Key]>): void
  off(type: "*", handler: WildcardHandler<Events>): void

  // 重载
  emit<Key extends keyof Events>(type: Key, event: Events[Key]): void
  // 意思是如果 type 真是 undefined, 就把 undefined 当做 key, 否则类型则为 never 代表永不存在的值的类型
  // 所以 emit() 理论上是不能简单地理解成 emit('*') 的简写
  emit<Key extends keyof Events>(
    type: undefined extends Events[Key] ? Key : never
  ): void
}

/**
 * Mitt: Tiny (~200b) functional event emitter / pubsub.
 * @name mitt
 * @returns {Mitt}
 */
// Events 到底指的是哪一个？
// 其实指的是 T 这个位置的 function mitt<T>() {}
export default function mitt<Events extends Record<EventType, unknown>>(
  all?: EventHandlerMap<Events>
): Emitter<Events> {
  type GenericEventHandler =
    // Events[keyof Events] 实际上是个联合类型
    // 具体见总结3.1
    // 这边是只有一个参数的事件处理函数
    // (event) => {}
    | Handler<Events[keyof Events]>
    // 这边是两个参数的事件处理函数
    // (type, event) => {}
    | WildcardHandler<Events>

  // 给 all 设置个默认值， 总体来说 all 必须是 Map 类型的
  all = all || new Map()

  return {
    /**
     * A Map of event names to registered handler functions.
     */
    all,

    /**
     * Register an event handler for the given type.
     * @param {string|symbol} type Type of event to listen for, or `'*'` for all events
     * @param {Function} handler Function to call in response to given event
     * @memberOf mitt
     */
    on<Key extends keyof Events>(type: Key, handler: GenericEventHandler) {
      // ! 强制断言，表示一定存在
      const handlers: Array<GenericEventHandler> | undefined = all!.get(type)
      if (handlers) {
        // 之前设置过就直接 push 进去
        handlers.push(handler)
      } else {
        // 没设置过就设置下
        // 注意：新设置时应该是数组
        // 为什么使用类型断言？
        // 因为要和 all 的类型保持一致
        // 为了和 all 的 类型保持一致为什么不是 EventHandlerList<Events[keyof Events]> | WildCardEventHandlerList<Events> ?
        // 因为这边是指定了类型的。
        // WildCardEventHandlerList<Events> 是给 type 为 '*' 时用的
        all!.set(type, [handler] as EventHandlerList<Events[keyof Events]>)
      }
    },
    /**
     * Remove an event handler for the given type.
     * If `handler` is omitted, all handlers of the given type are removed.
     * @param {string|symbol} type Type of event to unregister `handler` from, or `'*'`
     * @param {Function} [handler] Handler function to remove
     * @memberOf mitt
     */
    off<Key extends keyof Events>(type: Key, handler?: GenericEventHandler) {
      const handlers: Array<GenericEventHandler> | undefined = all!.get(type)

      // 容错处理
      if (handlers) {
        // 存在 handler 则从数组中删除
        if (handler) {
          // >>> 无符号右移 见 总结4
          // 写法很骚，'-1' >>> 0  => 4294967295
          // 存在必然能删， 不存在也删不着，很优雅
          handlers.splice(handlers.indexOf(handler) >>> 0, 1)

          // 不存在则重置 handlers (删除全部 handlers)
        } else {
          all!.set(type, [])
        }
      }
    },

    /**
     * Invoke all handlers for the given type.
     * If present, `'*'` handlers are invoked after type-matched handlers.
     *
     * Note: Manually firing '*' handlers is not supported.
     *
     * @param {string|symbol} type The event type to invoke
     * @param {Any} [evt] Any value (object is recommended and powerful), passed to each handler
     * @memberOf mitt
     */
    emit<Key extends keyof Events>(type: Key, evt?: Events[Key]) {
      let handlers = all!.get(type)
      if (handlers) {
        // 这里必须类型断言，因为这边是只传一个参数的
        // .slice 的作用，防止 handler 能修改 handlers (这个细节可能是常识了，需要注意)
        ;(handlers as EventHandlerList<Events[keyof Events]>)
          .slice()
          .map((handler) => {
            // ! 强制断言，表示一定存在
            handler(evt!)
          })
      }

      // 这里还是比较专业的，如果要我实现这个库的功能的话，我可能会忽略这个功能
      handlers = all!.get("*")
      if (handlers) {
        // 这里必须类型断言，因为这边是要传两个参数
        ;(handlers as WildCardEventHandlerList<Events>)
          .slice()
          .map((handler) => {
            // type 实际上指的是执行的 type
            // ! 强制断言，表示一定存在
            handler(type, evt!)
          })
      }
    },
  }
}
