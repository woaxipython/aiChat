import { ref } from 'vue'

export function useMessageInput(onSend: (message: string) => void) {
  const messageText = ref('')

  // 处理键盘事件
  function handleKeydown(event: KeyboardEvent) {
    // 如果是单独的回车键（非shift+enter）
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault() // 阻止默认的换行行为
      
      // 如果消息不为空，则发送
      if (messageText.value.trim()) {
        onSend(messageText.value)
        messageText.value = '' // 清空输入框
      }
    }
  }

  return {
    messageText,
    handleKeydown
  }
} 