import { ref } from 'vue'
import { sendChatMessage } from '../services/aiService'

export interface ChatMessage {
  id: number
  content: string
  reasoningContent?: string  // 添加推理内容字段
  isUser: boolean
  timestamp: number
  isStreaming?: boolean  // 添加流式状态标记
}

export function useChat() {
  const messages = ref<ChatMessage[]>([])
  const isLoading = ref(false)
  const currentAiMessage = ref<ChatMessage | null>(null)

  // 发送消息
  async function sendMessage(content: string) {
    try {
      // 添加用户消息
      const userMessage: ChatMessage = {
        id: Date.now(),
        content,
        isUser: true,
        timestamp: Date.now()
      }
      messages.value.push(userMessage)
      
      // 设置加载状态
      isLoading.value = true

      // 创建初始的 AI 消息，标记为正在流式传输
      currentAiMessage.value = {
        id: Date.now(),
        content: '',
        isUser: false,
        timestamp: Date.now(),
        isStreaming: true  // 标记为正在流式传输
      }
      messages.value.push(currentAiMessage.value)

      // 处理流式响应
      await sendChatMessage(
        content,
        'ep-20250206205559-pncbv',
        'f0d33fe4-43dc-4f68-953e-3775fad2217a',
        (chunk, isReasoning) => {
          if (currentAiMessage.value) {
            if (isReasoning) {
              // 处理推理内容
              currentAiMessage.value.reasoningContent = 
                (currentAiMessage.value.reasoningContent || '') + chunk
            } else {
              // 处理普通内容
              // 处理代码块
              if (chunk.includes('```')) {
                currentAiMessage.value.content += chunk.includes('\n') ? chunk : chunk + '\n'
                return
              }
              
              // 处理普通文本
              let newContent = currentAiMessage.value.content
              
              if (newContent.endsWith('\n') && chunk.startsWith('\n')) {
                newContent += chunk.slice(1)
              } else {
                newContent += chunk
              }
              
              currentAiMessage.value.content = newContent.replace(/\n{3,}/g, '\n\n')
            }
          }
        }
      )

      // 流式传输完成后，移除流式状态标记
      if (currentAiMessage.value) {
        currentAiMessage.value.isStreaming = false
      }

    } catch (error) {
      console.error('发送消息失败:', error)
      // 发生错误时也要移除流式状态
      if (currentAiMessage.value) {
        currentAiMessage.value.isStreaming = false
        currentAiMessage.value.content += '\n\n[消息发送失败]'
      }
    } finally {
      isLoading.value = false
      currentAiMessage.value = null
    }
  }

  // 清空消息历史
  function clearMessages() {
    messages.value = []
    currentAiMessage.value = null
    isLoading.value = false
  }

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages
  }
} 