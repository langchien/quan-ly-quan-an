import { useEffect, useMemo, useRef } from 'react'
import { socket } from '@/lib/socket'

/**
 * Mapping tên socket event → kiểu payload tương ứng (client-side).
 *
 * Đảm bảo đồng bộ với `SocketEventPayloads` bên server.
 * Payload phía client dùng kiểu generic (`unknown`) vì đã được
 * serialize qua JSON — consumer sẽ cast về type cụ thể khi cần.
 */
export interface ClientSocketEventPayloads {
  'new-order': unknown[]
  'update-order': unknown
  'payment': unknown[]
}

export type ClientSocketEventName = keyof ClientSocketEventPayloads

type EventHandler<TEvent extends ClientSocketEventName> = (
  payload: ClientSocketEventPayloads[TEvent]
) => void

/**
 * Hook lắng nghe một socket event và tự cleanup khi unmount.
 *
 * @param event  - Tên event cần listen (type-safe)
 * @param handler - Callback xử lý khi nhận event
 *
 * @example
 * ```tsx
 * useSocketEvent('new-order', (orders) => {
 *   queryClient.invalidateQueries({ queryKey: adminOrdersQueryKey })
 * })
 * ```
 *
 * Handler được wrap trong ref để tránh re-subscribe mỗi khi
 * callback thay đổi reference (closure mới mỗi render).
 */
export function useSocketEvent<TEvent extends ClientSocketEventName>(
  event: TEvent,
  handler: EventHandler<TEvent>
) {
  // Dùng ref để luôn gọi handler mới nhất mà không cần re-subscribe
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    const eventName: ClientSocketEventName = event
    const listener = (payload: unknown) => {
      handlerRef.current(payload as ClientSocketEventPayloads[TEvent])
    }

    socket.on(eventName, listener)
    return () => {
      socket.off(eventName, listener)
    }
  }, [event])
}

/**
 * Hook tiện ích: lắng nghe nhiều socket events cùng lúc.
 *
 * @param handlers - Object mapping event name → handler
 *
 * @example
 * ```tsx
 * useSocketEvents({
 *   'new-order': () => refetch(),
 *   'update-order': () => refetch(),
 *   'payment': () => refetch(),
 * })
 * ```
 *
 * Danh sách events được theo dõi qua sorted key string.
 * Khi consumer thêm/bớt event, hook tự re-subscribe.
 */
export function useSocketEvents(
  handlers: Partial<{ [TEvent in ClientSocketEventName]: EventHandler<TEvent> }>
) {
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  // Theo dõi danh sách event keys — re-subscribe khi keys thay đổi
  const eventKeys = useMemo(
    () =>
      (Object.keys(handlers) as ClientSocketEventName[])
        .filter(k => handlers[k] !== undefined)
        .sort()
        .join(','),
    [handlers]
  )

  useEffect(() => {
    if (!eventKeys) return

    const activeEvents = eventKeys.split(',') as ClientSocketEventName[]
    const listeners: Array<{ event: ClientSocketEventName; listener: (payload: unknown) => void }> = []

    for (const event of activeEvents) {
      const listener = (payload: unknown) => {
        const currentHandler = handlersRef.current[event]
        if (currentHandler) {
          ;(currentHandler as (data: unknown) => void)(payload)
        }
      }
      socket.on(event, listener)
      listeners.push({ event, listener })
    }

    return () => {
      for (const { event, listener } of listeners) {
        socket.off(event, listener)
      }
    }
  }, [eventKeys])
}

