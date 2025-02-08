import { ref } from 'vue'

export function useContextMenu() {
  const contextMenu = ref({
    show: false,
    x: 0,
    y: 0,
    targetId: null as number | null
  })
  
  function handleContextMenu(event: MouseEvent, friendId: number) {
    event.preventDefault()
    contextMenu.value = {
      show: true,
      x: event.clientX,
      y: event.clientY,
      targetId: friendId
    }
  }
  
  function closeContextMenu() {
    contextMenu.value.show = false
  }
  
  return {
    contextMenu,
    handleContextMenu,
    closeContextMenu
  }
} 