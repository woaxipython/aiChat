import { ref, onMounted, onUnmounted } from 'vue'
import { Modal } from 'bootstrap'

export function useModal(modalId: string) {
  const modalRef = ref<Modal | null>(null)

  onMounted(() => {
    const modalElement = document.getElementById(modalId)
    if (modalElement) {
      modalRef.value = new Modal(modalElement)
    }
  })

  onUnmounted(() => {
    modalRef.value?.dispose()
  })

  const showModal = () => modalRef.value?.show()
  const hideModal = () => modalRef.value?.hide()

  return {
    modalRef,
    showModal,
    hideModal
  }
} 