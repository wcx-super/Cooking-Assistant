import { httpPost, httpGet, httpPut } from '@/utils/request'
import { fetchEventSource } from '@microsoft/fetch-event-source'

// 对话类型
export interface Conversation {
  id: string
  title: string
  created_at: string
  updated_at: string
}

// 消息类型
export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
  thinking?: boolean
}

// 创建对话请求
export interface CreateConversationRequest {
  title?: string
}

// 发送消息请求
export interface SendMessageRequest {
  conversation_id: string
  content: string
}

/**
 * 获取对话列表
 */
export const getConversations = async (): Promise<Conversation[]> => {
  const response = await httpGet<Conversation[]>('/conversations')
  if (response?.data) {
    return response.data
  }
  return []
}

/**
 * 创建新对话
 */
export const createConversation = async (
  data?: CreateConversationRequest
): Promise<Conversation> => {
  const response = await httpPost<Conversation>('/conversations', data || {})
  if (response?.data) {
    return response.data
  }
  throw new Error(response?.msg || '创建对话失败')
}

/**
 * 获取对话消息
 */
export const getMessages = async (conversationId: string): Promise<Message[]> => {
  const response = await httpGet<Message[]>(`/conversations/${conversationId}/messages`)
  if (response?.data) {
    return response.data
  }
  return []
}

/**
 * 发送消息
 */
export const sendMessage = async (
  data: SendMessageRequest
): Promise<Message> => {
  const response = await httpPost<Message>('/conversations/messages', data)
  if (response?.data) {
    return response.data
  }
  throw new Error(response?.msg || '发送消息失败')
}

/**
 * 删除对话
 */
export const deleteConversation = async (conversationId: string): Promise<void> => {
  await httpPost(`/conversations/${conversationId}/delete`, {})
}

/**
 * 更新对话标题
 */
export const updateConversationTitle = async (
  conversationId: string,
  title: string
): Promise<Conversation> => {
  const response = await httpPut<Conversation>(
    `/conversations/${conversationId}`,
    { title }
  )
  if (response?.data) {
    return response.data
  }
  throw new Error(response?.msg || '更新标题失败')
}

/**
 * 流式事件类型
 */
export interface StreamEvent {
  type: 'thinking' | 'sources' | 'token' | 'done' | 'error'
  data: any
}

/**
 * 流式消息回调
 */
export interface StreamCallbacks {
  onThinking?: (data: { status: string; message: string }) => void
  onSources?: (data: { sources: any[]; count: number }) => void
  onToken?: (token: string) => void
  onDone?: (data: { message_id: string; metadata: any }) => void
  onError?: (error: { code: number; msg: string }) => void
}

/**
 * 流式发送消息
 */
export const sendMessageStream = async (
  data: SendMessageRequest,
  callbacks: StreamCallbacks
): Promise<void> => {
  const token = localStorage.getItem('access_token')
  if (!token) {
    throw new Error('未登录')
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  const url = `${apiUrl}/api/conversations/messages/stream`

  // 调试日志
  console.log('🔐 SSE Token:', token ? `${token.substring(0, 20)}...` : 'null')
  console.log('🌐 SSE URL:', url)
  console.log('📦 SSE Data:', data)

  // 使用 AbortController 支持取消
  const ctrl = new AbortController()

  try {
    await fetchEventSource(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
      signal: ctrl.signal,
      // 页面切到后台时保持连接；默认会断开并在切回时重新发送，导致同一问题被重复提交
      openWhenHidden: true,
      
      async onopen(response) {
        if (response.ok) {
          console.log('✅ SSE 连接成功')
          return // 连接成功
        }
        
        // 处理错误响应
        console.error('❌ SSE 连接失败:', response.status, response.statusText)
        let errorMsg = `HTTP 错误: ${response.status}`
        
        try {
          // 尝试读取响应体
          const errorData = await response.json()
          console.error('📄 错误详情:', errorData)
          errorMsg = errorData.detail || errorData.msg || errorMsg
        } catch (e) {
          // 无法解析响应体
          console.error('⚠️ 无法解析错误响应体')
        }
        
        if (response.status === 401) {
          throw new Error(`未授权: ${errorMsg}`)
        } else if (response.status === 404) {
          throw new Error(`对话不存在: ${errorMsg}`)
        } else {
          throw new Error(errorMsg)
        }
      },
      
      onmessage(event) {
        // 解析 SSE 事件
        const eventType = event.event || 'message'
        
        try {
          const eventData = JSON.parse(event.data)
          
          switch (eventType) {
            case 'thinking':
              callbacks.onThinking?.(eventData)
              break
            
            case 'sources':
              callbacks.onSources?.(eventData)
              break
            
            case 'token':
              callbacks.onToken?.(eventData.token)
              break
            
            case 'done':
              callbacks.onDone?.(eventData)
              // 不要立即 abort，让 SSE 连接自然关闭
              // 后端 generator 结束后会自动关闭连接
              break
            
            case 'error':
              callbacks.onError?.(eventData)
              // 错误时也不强制关闭，让连接自然结束
              break
          }
        } catch (e) {
          console.error('Failed to parse event data:', e)
        }
      },
      
      onerror(err) {
        console.error('SSE error:', err)
        callbacks.onError?.({
          code: 500,
          msg: '连接错误',
        })
        throw err // 重连
      },
    })
  } catch (error: any) {
    // 如果不是主动取消，则抛出错误
    if (error.name !== 'AbortError') {
      throw error
    }
  }
}

