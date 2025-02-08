import { ref } from 'vue'

export function useNavigation() {
  const isChatActive = ref(true)
  const isApiActive = ref(false)

  function toggleNavigation(target: 'chat' | 'api', callback?: () => void) {
    // 如果点击当前激活的按钮，则切换其状态
    if (target === 'chat' && isChatActive.value) {
      isChatActive.value = false
      return
    }
    if (target === 'api' && isApiActive.value) {
      isApiActive.value = false
      return
    }

    // 重置所有状态
    isChatActive.value = false
    isApiActive.value = false

    // 激活目标按钮并执行回调
    if (target === 'chat') {
      isChatActive.value = true
      callback?.()
    } else if (target === 'api') {
      isApiActive.value = true
    }
  }

  return {
    isChatActive,
    isApiActive,
    toggleNavigation
  }
} 