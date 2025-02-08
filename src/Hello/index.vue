<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'

defineProps({
  enterAction: {
    type: Object,
    required: true
  }
})

// 添加响应式数据存储好友列表
const friendsList = ref([])

// 右键菜单状态管理
const contextMenu = ref({
  show: false,
  x: 0,
  y: 0,
  targetId: null
})

// 添加选中好友的状态
const selectedFriendId = ref(null)

// 添加 modal 状态控制
const showNewChatModal = ref(false)
const newFriendName = ref('')

// 添加 prompt text 状态
const promptText = ref('')

// 添加编辑状态
const isEditing = ref(false)
const editingFriend = ref(null)

// 添加好友说明状态
const friendDescription = ref('')

// 修改头像选项列表，增加更多分类
const avatarCategories = {
  people: {
    title: '人物',
    icons: [
      '👨', '👩', '🧑', '👶', '👦', '👧', '🧒', '👴', '👵', '🧓',
      '👨‍💼', '👩‍💼', '👨‍💻', '👩‍💻', '👨‍🎨', '👩‍🎨', '👨‍🏫', '👩‍🏫'
    ]
  },
  faces: {
    title: '表情',
    icons: [
      '😊', '😎', '🤓', '😇', '🥳', '😺', '😸', '😹', '😻', '😼',
      '🙂', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '🤪'
    ]
  },
  animals: {
    title: '动物',
    icons: [
      '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
      '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🦆', '🦅'
    ]
  },
  nature: {
    title: '自然',
    icons: [
      '🌸', '🌺', '🌹', '🌷', '🌼', '🌻', '🌞', '🌙', '⭐', '🌟',
      '🍀', '🌿', '🌱', '🌴', '🌳', '🌲', '🍁', '🍂', '🍃', '🌾'
    ]
  },
  food: {
    title: '美食',
    icons: [
      '🍎', '🍕', '🍔', '🍟', '🍖', '🍗', '🍜', '🍱', '🍣', '🍙',
      '🍞', '🥐', '🥨', '🥯', '🥖', '🧀', '🥗', '🥪', '🌮', '🌯'
    ]
  }
}

const currentCategory = ref('people')
const selectedAvatar = ref('👤')

// 添加窗口尺寸响应式变量
const windowSize = ref({
  width: window.innerWidth,
  height: window.innerHeight
})

// 更新窗口尺寸
function updateWindowSize() {
  windowSize.value = {
    width: window.innerWidth,
    height: window.innerHeight
  }
}

// 计算 modal 尺寸
function getModalSize() {
  const modalWidth = windowSize.value.width * 0.7  // 总宽度的70%
  const modalHeight = windowSize.value.height * 0.7  // 总高度的70%
  const leftMargin = windowSize.value.width * 0.15  // 左边距15%
  
  return {
    width: `${modalWidth}px`,
    height: `${modalHeight}px`,
    left: `${leftMargin}px`
  }
}

function addNewChat() {
  showNewChatModal.value = true
}

// 处理右键点击事件
function handleContextMenu(event: MouseEvent, friendId: number) {
  event.preventDefault()
  contextMenu.value = {
    show: true,
    x: event.clientX,
    y: event.clientY,
    targetId: friendId
  }
}

// 关闭右键菜单
function closeContextMenu() {
  contextMenu.value.show = false
}

// 删除好友
function deleteFriend(id: number) {
  friendsList.value = friendsList.value.filter(friend => friend.id !== id)
  closeContextMenu()
}

// 获取当前好友的置顶状态
function getFriendPinStatus(id: number) {
  return friendsList.value.find(friend => friend.id === id)?.isPinned || false
}

// 修改置顶功能
function pinFriend(id: number) {
  const index = friendsList.value.findIndex(friend => friend.id === id)
  if (index > -1) {
    const friend = friendsList.value[index]
    
    // 先从当前位置移除
    friendsList.value.splice(index, 1)
    
    // 切换置顶状态
    friend.isPinned = !friend.isPinned

    if (friend.isPinned) {
      // 置顶时直接放到顶部
      friendsList.value.unshift(friend)
    } else {
      // 取消置顶时，找到最后一个置顶项的位置
      const lastPinnedIndex = friendsList.value.findLastIndex(f => f.isPinned)
      // 将项目插入到最后一个置顶项后面
      friendsList.value.splice(lastPinnedIndex + 1, 0, friend)
    }
  }
  closeContextMenu()
}

// 修改处理好友点击事件
function handleFriendClick(friend: any) {
  // 设置选中状态
  selectedFriendId.value = friend.id

  const currentIndex = friendsList.value.findIndex(f => f.id === friend.id)
  if (currentIndex === -1) return

  // 先从当前位置移除
  friendsList.value.splice(currentIndex, 1)

  if (friend.isPinned) {
    // 如果已置顶，移到所有置顶好友的最上方
    friendsList.value.unshift(friend)
  } else {
    // 如果未置顶，移到所有置顶好友的下方
    const lastPinnedIndex = friendsList.value.findLastIndex(f => f.isPinned)
    friendsList.value.splice(lastPinnedIndex + 1, 0, friend)
  }
}

// 添加窗口大小变化监听
onMounted(() => {
  document.addEventListener('click', closeContextMenu)
  window.addEventListener('resize', updateWindowSize)
})

onUnmounted(() => {
  document.removeEventListener('click', closeContextMenu)
  window.removeEventListener('resize', updateWindowSize)
})

function closeModal() {
  showNewChatModal.value = false
  isEditing.value = false
  editingFriend.value = null
  newFriendName.value = ''
  selectedAvatar.value = '👤'
  friendDescription.value = ''  // 重置说明
  promptText.value = ''
  // 重置 API 和模型选择为默认值
  selectedApi.value = apiOptions[0].id
  selectedModel.value = apiOptions[0].models[0].id
}

function confirmAddChat() {
  const chatData = {
    id: isEditing.value ? editingFriend.value.id : Date.now(),
    name: newFriendName.value || `好友 ${friendsList.value.length + 1}`,
    avatar: selectedAvatar.value,
    description: friendDescription.value,  // 添加说明
    prompt: promptText.value,
    apiId: selectedApi.value,
    modelId: selectedModel.value,
    isPinned: isEditing.value ? editingFriend.value.isPinned : false
  }

  if (isEditing.value) {
    // 更新现有好友
    const index = friendsList.value.findIndex(f => f.id === editingFriend.value.id)
    if (index !== -1) {
      friendsList.value[index] = chatData
    }
  } else {
    // 添加新好友
    friendsList.value.push(chatData)
  }

  closeModal()
}

// 添加头像选择区域的展开状态
const isAvatarGridVisible = ref(false)

// 切换头像选择区域的显示状态
function toggleAvatarGrid() {
  isAvatarGridVisible.value = !isAvatarGridVisible.value
}

// 选择头像并关闭下拉面板
function selectAvatar(avatar: string) {
  selectedAvatar.value = avatar
  isAvatarGridVisible.value = false
}

// 点击外部关闭下拉面板
onMounted(() => {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.closest('.avatar-selector')) {
      isAvatarGridVisible.value = false
    }
  })
})

// 修改 API 选项列表，为每个 API 添加对应的模型选项
const apiOptions = [
  { 
    id: 'v3', 
    name: 'V3', 
    description: '标准 API 接口',
    models: [
      { id: 'gpt-3.5', name: 'GPT-3.5', description: '响应快速，成本较低' },
      { id: 'gpt-4', name: 'GPT-4', description: '更强大的理解和创造能力' }
    ]
  },
  { 
    id: 'silicon', 
    name: '硅基流动', 
    description: '高性能计算接口',
    models: [
      { id: 'claude', name: 'Claude', description: '擅长长文本处理和分析' },
      { id: 'gemini', name: 'Gemini', description: '谷歌最新AI模型' }
    ]
  },
  { 
    id: 'douyin', 
    name: '抖音', 
    description: '短视频 API',
    models: [
      { id: 'bytedance', name: 'ByteDance', description: '字节跳动AI模型' }
    ]
  },
  { 
    id: 'deepseek', 
    name: 'DeepSeek', 
    description: '深度学习接口',
    models: [
      { id: 'deepseek-chat', name: 'DeepSeek Chat', description: '对话模型' },
      { id: 'deepseek-coder', name: 'DeepSeek Coder', description: '代码模型' }
    ]
  }
]

// API 相关状态和方法
const selectedApi = ref(apiOptions[0].id)
const isApiDropdownVisible = ref(false)

function getAvailableModels() {
  const currentApi = apiOptions.find(api => api.id === selectedApi.value)
  return currentApi?.models || []
}

function selectApi(apiId: string) {
  selectedApi.value = apiId
  isApiDropdownVisible.value = false
  
  const availableModels = getAvailableModels()
  if (availableModels.length > 0) {
    selectedModel.value = availableModels[0].id
  }
}

function getSelectedApiName() {
  return apiOptions.find(api => api.id === selectedApi.value)?.name || ''
}

// 模型相关状态和方法
const selectedModel = ref(apiOptions[0].models[0].id)
const isModelDropdownVisible = ref(false)

function selectModel(modelId: string) {
  selectedModel.value = modelId
  isModelDropdownVisible.value = false
}

function getSelectedModelName() {
  const availableModels = getAvailableModels()
  if (availableModels.length === 0) {
    return '无可用模型'
  }
  return availableModels.find(model => model.id === selectedModel.value)?.name || ''
}

// API 编辑相关状态
const showApiEditModal = ref(false)
const editingApi = ref<{
  id: string
  name: string
  url: string
  key: string
  models: Array<{ id: string; name: string; description: string }>
} | null>(null)

// 添加模型名称错误状态
const modelNameError = ref('')

// 添加 API 编辑错误状态
const apiEditError = ref('')

// 修改编辑 API 的处理函数
function handleEditApi(apiId: string, event: Event) {
  event.stopPropagation()  // 阻止事件冒泡
  
  // 移除所有激活的 tooltips
  const tooltips = document.querySelectorAll('.tooltip')
  tooltips.forEach(tooltip => tooltip.remove())
  
  const api = apiOptions.find(api => api.id === apiId)
  if (api) {
    editingApi.value = {
      id: api.id,
      name: api.name,
      url: api.url || '',
      key: api.key || '',
      models: [...api.models]
    }
    showApiEditModal.value = true
  }
}

// 添加模型相关函数
function removeModel(modelId: string) {
  if (editingApi.value) {
    editingApi.value.models = editingApi.value.models.filter(model => model.id !== modelId)
  }
}

// 添加新模型的状态
const showNewModelForm = ref(false)
const newModel = ref({
  name: '',
  description: ''
})

// 添加新模型标识的状态管理
const newModelIds = ref<string[]>([])

// 添加新模型按钮点击事件
function addNewModel() {
  showNewModelForm.value = true
}

// 修改保存新模型的函数，添加非空验证
function saveNewModel() {
  // 重置错误状态
  modelNameError.value = ''
  
  // 验证名称非空
  if (!editingApi.value || !newModel.value.name.trim()) {
    modelNameError.value = '模型名称不能为空'
    return
  }
  
  // 验证说明非空
  if (!newModel.value.description.trim()) {
    modelNameError.value = '模型说明不能为空'
    return
  }

  // 检查模型名称是否已存在
  const isNameExists = editingApi.value.models.some(
    model => model.name.toLowerCase() === newModel.value.name.toLowerCase()
  )
  
  if (isNameExists) {
    modelNameError.value = '该模型名称已存在'
    setTimeout(() => {
      modelNameError.value = ''
    }, 3000)
    return
  }

  const newModelId = `model-${Date.now()}`
  editingApi.value.models.push({
    id: newModelId,
    name: newModel.value.name.trim(),
    description: newModel.value.description.trim()
  })
  
  newModelIds.value.push(newModelId)
  
  // 重置表单和错误状态
  newModel.value = {
    name: '',
    description: ''
  }
  modelNameError.value = ''
  showNewModelForm.value = false
}

// 取消添加新模型
function cancelNewModel() {
  showNewModelForm.value = false
  newModel.value = {
    name: '',
    description: ''
  }
}

// 修改保存 API 编辑的函数
async function saveApiEdit() {
  try {
    // 重置错误状态
    apiEditError.value = ''
    
    if (!editingApi.value) {
      throw new Error('无效的 API 数据')
    }
    
    // 验证所有必填字段
    const requiredFields = [
      { field: 'name', label: 'API 名称' },
      { field: 'url', label: 'API 地址' },
      { field: 'key', label: 'API Key' }
    ]
    
    for (const { field, label } of requiredFields) {
      if (!editingApi.value[field]?.trim()) {
        apiEditError.value = `${label}不能为空`
        return
      }
    }
    
    // 准备更新的 API 数据
    const updatedApi = {
      id: editingApi.value.id,
      name: editingApi.value.name.trim(),
      description: editingApi.value.description?.trim() || '',
      url: editingApi.value.url.trim(),
      key: editingApi.value.key.trim(),
      models: editingApi.value.models,
      updatedAt: new Date().toISOString()
    }
    
    // 查找现有 API 的索引
    const apiIndex = apiOptions.findIndex(api => api.id === updatedApi.id)
    
    // 更新或添加 API
    if (apiIndex !== -1) {
      // 更新现有 API
      apiOptions[apiIndex] = updatedApi
    } else {
      // 添加新 API
      apiOptions.push(updatedApi)
    }
    
    // 更新选中的模型（如果需要）
    if (selectedApi.value === updatedApi.id) {
      const availableModels = updatedApi.models
      if (availableModels.length > 0 && !availableModels.find(m => m.id === selectedModel.value)) {
        selectedModel.value = availableModels[0].id
      }
    }
    
    // 显示成功提示
    const message = apiIndex !== -1 ? 'API 更新成功' : 'API 添加成功'
    showSuccessMessage(message)
    
    // 关闭编辑弹窗
    closeApiEditModal()
  } catch (error) {
    console.error('保存 API 失败:', error)
    apiEditError.value = error.message || '保存失败，请重试'
  }
}

// 添加成功提示函数
function showSuccessMessage(message: string) {
  // 可以使用 toast 或其他提示组件
  console.log(message)
}

// 修改关闭编辑弹窗函数
function closeApiEditModal() {
  showApiEditModal.value = false
  editingApi.value = null
  apiEditError.value = ''
}

// 添加 API 的处理函数
function handleAddApi() {
  // 创建一个新的空 API 对象
  editingApi.value = {
    id: `api-${Date.now()}`,
    name: '',
    url: '',
    key: '',
    models: []
  }
  showApiEditModal.value = true
  isApiDropdownVisible.value = false
}

// 添加测试相关状态和方法
const isApiTesting = ref(false)
const testResult = ref<{
  success: boolean
  message: string
} | null>(null)

// 测试 API 连接
async function testApiConnection() {
  if (!editingApi.value) return
  
  isApiTesting.value = true
  testResult.value = null
  
  try {
    // TODO: 实现实际的 API 测试逻辑
    await new Promise(resolve => setTimeout(resolve, 1500)) // 模拟请求
    
    // 模拟测试成功
    testResult.value = {
      success: true,
      message: '连接成功！API 响应正常。'
    }
  } catch (error) {
    testResult.value = {
      success: false,
      message: '连接失败：' + (error.message || '未知错误')
    }
  } finally {
    isApiTesting.value = false
    
    // 3秒后清除测试结果
    setTimeout(() => {
      testResult.value = null
    }, 3000)
  }
}

// 添加模型测试相关状态
const modelTesting = ref<{ [key: string]: boolean }>({})
const modelTestResults = ref<{ [key: string]: { success: boolean; message: string } }>({})

// 修改测试模型连接函数
async function testModelConnection(modelId: string, event: Event) {
  event.stopPropagation()
  
  // 移除所有激活的 tooltips
  const tooltips = document.querySelectorAll('.tooltip')
  tooltips.forEach(tooltip => tooltip.remove())
  
  // 移除当前按钮的 title 属性
  const button = event.target as HTMLElement
  button.title = ''
  
  if (!editingApi.value) return
  
  modelTesting.value[modelId] = true
  modelTestResults.value[modelId] = null
  
  try {
    // ... rest of the testing logic ...
  } catch (error) {
    // ... error handling ...
  } finally {
    modelTesting.value[modelId] = false
    
    setTimeout(() => {
      modelTestResults.value[modelId] = null
    }, 3000)
  }
}

// 添加生成 prompt 相关状态
const isGenerating = ref(false)

// 生成 prompt 的函数
async function generatePrompt() {
  if (isGenerating.value) return
  
  isGenerating.value = true
  try {
    // TODO: 实现生成 prompt 的逻辑
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟请求
    promptText.value = `你现在扮演一个名为"${newFriendName.value || '助手'}"的AI助手。
你应该：
1. 以友好和专业的态度回答问题
2. 提供准确和有见地的回答
3. 在适当的时候使用表情符号增加互动的趣味性
4. 保持对话的连贯性和上下文的理解`
  } catch (error) {
    console.error('生成 prompt 失败:', error)
  } finally {
    isGenerating.value = false
  }
}

// 修改右键菜单点击处理函数
function handleEditFriend(friendId: number) {
  const friend = friendsList.value.find(f => f.id === friendId)
  if (!friend) return

  // 设置编辑状态和数据
  isEditing.value = true
  editingFriend.value = friend
  
  // 预填表单数据
  newFriendName.value = friend.name
  selectedAvatar.value = friend.avatar
  friendDescription.value = friend.description || ''  // 添加说明
  promptText.value = friend.prompt || ''
  
  // 如果有存储的 API 和模型选择
  if (friend.apiId) {
    selectedApi.value = friend.apiId
    if (friend.modelId) {
      selectedModel.value = friend.modelId
    }
  }
  
  showNewChatModal.value = true
  closeContextMenu()
}

// 添加获取 API 名称的函数
function getApiName(apiId: string) {
  return apiOptions.find(api => api.id === apiId)?.name || ''
}

// 添加获取模型名称的函数
function getModelName(apiId: string, modelId: string) {
  const api = apiOptions.find(api => api.id === apiId)
  return api?.models.find(model => model.id === modelId)?.name || ''
}

// 添加拖动相关状态
const isDragging = ref(false)
const dragStartPos = ref({ x: 0, y: 0 })
const modalPos = ref({ x: 0, y: 0 })

// 开始拖动
function startDrag(e) {
  // 只允许从标题栏拖动
  if (!e.target.closest('.modal-header')) return
  
  isDragging.value = true
  dragStartPos.value = {
    x: e.clientX - modalPos.value.x,
    y: e.clientY - modalPos.value.y
  }
  
  // 添加拖动时的样式
  document.body.style.userSelect = 'none'
}

// 拖动中
function doDrag(e) {
  if (!isDragging.value) return
  
  modalPos.value = {
    x: e.clientX - dragStartPos.value.x,
    y: e.clientY - dragStartPos.value.y
  }
}

// 结束拖动
function stopDrag() {
  isDragging.value = false
  document.body.style.userSelect = ''
}

// 在组件卸载时清理
onUnmounted(() => {
  document.body.style.userSelect = ''
})

// 添加拖拽调整宽度相关状态
const isResizing = ref(false)
const sidebarWidth = ref(300) // 默认宽度
const minWidth = 200 // 最小宽度
const maxWidth = 500 // 最大宽度

// 开始调整宽度
function startResize(e) {
  isResizing.value = true
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
  
  // 添加全局鼠标事件监听
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
}

// 调整宽度过程
function handleResize(e) {
  if (!isResizing.value) return
  
  let newWidth = e.clientX
  
  // 限制最小和最大宽度
  newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth))
  
  sidebarWidth.value = newWidth
}

// 结束调整
function stopResize() {
  isResizing.value = false
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
  
  // 移除全局事件监听
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
}

// 在组件卸载时清理
onUnmounted(() => {
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
})
</script>

<template>
  <div class="d-flex" style="height: 100%;">
    <!-- 左侧固定宽度为 4rem -->
    <div class="card flex-shrink-0 border-0" style="width: 4rem; height: 100%;">
      <div class="badge bg-white border-0">
        <div class="card-body p-0 scrollable flex-fill h-100">
          <div class="nav flex-column nav-pills">
            <button class="m-1 p-2 btn btn-outline-info border-0 active" v-tooltip="'聊天室'">
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"
                  class="icon icon-tabler icons-tabler-outline icon-tabler-brand-hipchat m-0">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path
                    d="M17.802 17.292s.077 -.055 .2 -.149c1.843 -1.425 3 -3.49 3 -5.789c0 -4.286 -4.03 -7.764 -9 -7.764c-4.97 0 -9 3.478 -9 7.764c0 4.288 4.03 7.646 9 7.646c.424 0 1.12 -.028 2.088 -.084c1.262 .82 3.104 1.493 4.716 1.493c.499 0 .734 -.41 .414 -.828c-.486 -.596 -1.156 -1.551 -1.416 -2.29z" />
                  <path d="M7.5 13.5c2.5 2.5 6.5 2.5 9 0" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- 右侧占据剩余空间 -->
    <div class="card flex-fill h-100">
      <div class="row g-0 flex-fill h-100">
        <!-- 修改好友列表容器 -->
        <div class="col-3 border-0 position-relative" 
             :style="{ width: `${sidebarWidth}px`, flex: 'none' }">
          <!-- 添加一个额外的边框容器 -->
          <div class="friend-list-container border-end">
            <!-- 现有的好友列表内容 -->
            <div class="d-flex w-100 border-0 border-bottom p-2 card-header d-none d-md-block">
              <div class="d-flex justify-content-between w-100">
                <button class="btn btn-outline-secondary border-0 py-2"  v-tooltip="'点击选择机器人'">
                  <span>
                    <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="1"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-brand-github-copilot m-0"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 18v-5.5c0 -.667 .167 -1.333 .5 -2" /><path d="M12 7.5c0 -1 -.01 -4.07 -4 -3.5c-3.5 .5 -4 2.5 -4 3.5c0 1.5 0 4 3 4c4 0 5 -2.5 5 -4z" /><path d="M4 12c-1.333 .667 -2 1.333 -2 2c0 1 0 3 1.5 4c3 2 6.5 3 8.5 3s5.499 -1 8.5 -3c1.5 -1 1.5 -3 1.5 -4c0 -.667 -.667 -1.333 -2 -2" /><path d="M20 18v-5.5c0 -.667 -.167 -1.333 -.5 -2" /><path d="M12 7.5l0 -.297l.01 -.269l.027 -.298l.013 -.105l.033 -.215c.014 -.073 .029 -.146 .046 -.22l.06 -.223c.336 -1.118 1.262 -2.237 3.808 -1.873c2.838 .405 3.703 1.797 3.93 2.842l.036 .204c0 .033 .01 .066 .013 .098l.016 .185l0 .171l0 .49l-.015 .394l-.02 .271c-.122 1.366 -.655 2.845 -2.962 2.845c-3.256 0 -4.524 -1.656 -4.883 -3.081l-.053 -.242a3.865 3.865 0 0 1 -.036 -.235l-.021 -.227a3.518 3.518 0 0 1 -.007 -.215z" /><path d="M10 15v2" /><path d="M14 15v2" /></svg>
                  </span>
                </button>
                <button @click="addNewChat" class="btn btn-outline-warning border-0 py-2 addChat" v-tooltip="'新增聊天'">
                  <span>
                    <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="1"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-message-circle-plus m-0"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12.007 19.98a9.869 9.869 0 0 1 -4.307 -.98l-4.7 1l1.3 -3.9c-2.324 -3.437 -1.426 -7.872 2.1 -10.374c3.526 -2.501 8.59 -2.296 11.845 .48c1.992 1.7 2.93 4.04 2.747 6.34" /><path d="M16 19h6" /><path d="M19 16v6" /></svg>
                  </span>
                </button>
              </div>

            </div>
            <div class="card-body p-0">
              <div class="d-flex flex-column">
                <!-- 添加好友列表渲染 -->
                <div v-for="friend in friendsList" 
                     :key="friend.id" 
                     @click="handleFriendClick(friend)"
                     @contextmenu="(e) => handleContextMenu(e, friend.id)"
                     :class="[
                       'd-flex align-items-start p-2 border-bottom cursor-pointer hover-bg-light',
                       { 'selected-friend': selectedFriendId === friend.id }
                     ]">
                  <!-- 左侧头像 -->
                  <span class="me-2 friend-avatar">{{ friend.avatar }}</span>
                  
                  <!-- 中间名称和模型信息 -->
                  <div class="friend-info">
                    <!-- 名称和说明在同一行 -->
                    <div class="friend-header">
                      <span class="friend-name">{{ friend.name }}</span>
                      <span v-if="friend.description" class="friend-description">
                        {{ friend.description }}
                      </span>
                    </div>
                    <!-- API和模型信息 -->
                    <div class="friend-model-info" v-if="friend.apiId">
                      <span class="api-name">{{ getApiName(friend.apiId) }}</span>
                      <span class="separator">/</span>
                      <span class="model-name">{{ getModelName(friend.apiId, friend.modelId) }}</span>
                    </div>
                  </div>
                  
                  <!-- 右侧置顶图标 -->
                  <span v-if="friend.isPinned" class="pin-icon ms-auto">⬆️</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 调整手柄 -->
          <div class="resize-handle"
               @mousedown="startResize"
               :class="{ 'active': isResizing }">
          </div>
        </div>
        
        <!-- 右侧内容区域 -->
        <div class="col">
          <!-- ... other content ... -->
        </div>
      </div>
    </div>
  </div>

  <!-- 右键菜单 -->
  <div v-if="contextMenu.show" 
       class="context-menu" 
       :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }">
    <div class="context-menu-item" @click="handleEditFriend(contextMenu.targetId)">
      <span>编辑</span>
    </div>
    <div class="context-menu-item" @click="deleteFriend(contextMenu.targetId)">
      <span>删除</span>
    </div>
    <div class="context-menu-item" @click="pinFriend(contextMenu.targetId)">
      <span>{{ getFriendPinStatus(contextMenu.targetId) ? '取消置顶' : '置顶' }}</span>
    </div>
  </div>

  <!-- 新增好友弹窗 -->
  
  <div v-if="showNewChatModal" 
       class="modal-overlay" 
       @click="closeModal"
       @mousemove="doDrag"
       @mouseup="stopDrag"
       @mouseleave="stopDrag">
    <div class="modal-container" 
         @click.stop
         @mousedown="startDrag"
         :style="{
           ...getModalSize(),
           transform: `translate(${modalPos.x}px, ${modalPos.y}px)`,
           cursor: isDragging ? 'move' : 'default'
         }">
      <div class="modal-content">
        <div class="modal-header" :class="{ 'dragging': isDragging }">
          <h5 class="modal-title">{{ isEditing ? '编辑好友' : '新增好友' }}</h5>
          <button class="btn-close" @click="closeModal"></button>
        </div>
        <div class="modal-body">
          <!-- 头像选择部分 -->
          <div class="mb-3">
            <div class="avatar-selector">
              <label class="form-label">选择头像</label>
              <div class="avatar-select-button" @click="toggleAvatarGrid">
                <span class="selected-avatar">{{ selectedAvatar }}</span>
                <span class="toggle-icon" :class="{ 'expanded': isAvatarGridVisible }">▼</span>
              </div>
              <!-- 头像选择下拉面板 -->
              <div class="avatar-dropdown" v-if="isAvatarGridVisible">
                <div class="category-tabs">
                  <button v-for="(category, key) in avatarCategories" 
                          :key="key"
                          class="category-tab"
                          :class="{ 'active': currentCategory === key }"
                          @click="currentCategory = key">
                    {{ category.title }}
                  </button>
                </div>
                <div class="avatar-grid">
                  <button v-for="avatar in avatarCategories[currentCategory].icons" 
                          :key="avatar"
                          class="avatar-option"
                          :class="{ 'selected': avatar === selectedAvatar }"
                          @click="selectAvatar(avatar)">
                    {{ avatar }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 名称输入部分 -->
          <div class="mb-3">
            <label class="form-label">好友名称</label>
            <div class="input-group">
              <input type="text" 
                     class="form-control" 
                     v-model="newFriendName"
                     placeholder="请输入好友名称">
              <button class="btn btn-outline-primary generate-prompt-btn" 
                      @click="generatePrompt"
                      v-tooltip="'生成 Prompt'">
                <span v-if="isGenerating" class="spinner-border spinner-border-sm"></span>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- API 和大模型选择部分 -->
          <div class="mb-3">
            <div class="selectors-container">
              <!-- API 选择器 -->
              <div class="selector-group">
                <label class="form-label">选择接口</label>
                <div class="api-selector">
                  <div class="api-select-button" @click="isApiDropdownVisible = !isApiDropdownVisible">
                    <span>{{ getSelectedApiName() }}</span>
                    <span class="toggle-icon" :class="{ 'expanded': isApiDropdownVisible }">▼</span>
                  </div>
                  <!-- API 下拉选项 -->
                  <div v-if="isApiDropdownVisible" class="api-dropdown">
                    <div v-for="api in apiOptions" 
                         :key="api.id"
                         class="api-option"
                         :class="{ 'selected': selectedApi === api.id }"
                         @click="selectApi(api.id)">
                      <div class="api-option-content">
                        <span class="api-name">{{ api.name }}</span>
                        <span class="api-description">{{ api.description }}</span>
                      </div>
                      <div class="api-option-actions" @click.stop>
                        <button class="edit-button" 
                                @click="handleEditApi(api.id, $event)"
                                @mouseenter="$event.target.title = '编辑 API'"
                                @mouseleave="$event.target.title = ''">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                        <span v-if="selectedApi === api.id" class="api-check">✓</span>
                      </div>
                    </div>
                    <!-- 添加 API 选项 -->
                    <div class="api-option add-api-option" @click.stop="handleAddApi">
                      <div class="api-option-content">
                        <span class="api-name">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="add-icon">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                          添加 API
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 大模型选择器 -->
              <div class="selector-group">
                <label class="form-label">选择模型</label>
                <div class="model-selector">
                  <div class="model-select-button" @click="isModelDropdownVisible = !isModelDropdownVisible">
                    <span>{{ getSelectedModelName() || '无可用模型' }}</span>
                    <span class="toggle-icon" :class="{ 'expanded': isModelDropdownVisible }">▼</span>
                  </div>
                  <!-- 大模型下拉选项 -->
                  <div v-if="isModelDropdownVisible" class="model-dropdown">
                    <div v-if="getAvailableModels().length > 0">
                      <div v-for="model in getAvailableModels()" 
                           :key="model.id"
                           class="model-item">
                        <div class="model-info">
                          <div class="model-header">
                            <span class="model-name">{{ model.name }}</span>
                            <span v-if="newModelIds.includes(model.id)" class="new-badge"></span>
                          </div>
                          <span class="model-description">{{ model.description }}</span>
                          <!-- 添加测试结果显示 -->
                          <div v-if="modelTestResults[model.id]" 
                               class="model-test-result mt-1" 
                               :class="{ 'success': modelTestResults[model.id].success, 'error': !modelTestResults[model.id].success }">
                            {{ modelTestResults[model.id].message }}
                          </div>
                        </div>
                        <div class="model-actions">
                          <!-- 添加测试按钮 -->
                          <button class="btn-icon test-model-btn" 
                                  @click="testModelConnection(model.id, $event)"
                                  :disabled="modelTesting[model.id]"
                                  @mouseenter="$event.target.title = '测试模型连接'"
                                  @mouseleave="$event.target.title = ''">
                            <span v-if="modelTesting[model.id]" class="spinner-border spinner-border-sm"></span>
                            <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
                              <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
                              <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
                              <line x1="12" y1="20" x2="12" y2="20"></line>
                            </svg>
                          </button>
                          <!-- 删除按钮 -->
                          <button class="btn-icon" @click="removeModel(model.id)">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div v-else class="no-models-message">
                      暂无可用模型
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 添加好友说明输入框 -->
          <div class="mb-3">
            <label class="form-label">好友说明</label>
            <input type="text" 
                   class="form-control"
                   v-model.trim="friendDescription"
                   placeholder="请输入好友说明（选填）">
          </div>

          <!-- 移动到这里：Prompt Text 输入框 -->
          <div class="mb-3">
            <label class="form-label">Prompt Text</label>
            <textarea class="form-control prompt-textarea"
                      v-model="promptText"
                      placeholder="请输入或生成 Prompt"
                      rows="3"></textarea>
            <div class="form-text text-muted">
              提示：点击好友名称旁的闪电按钮可以自动生成 Prompt
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">取消</button>
          <button class="btn btn-primary" @click="confirmAddChat">确定</button>
        </div>
      </div>
    </div>
  </div>

  <!-- API 编辑弹窗 -->
  <div v-if="showApiEditModal" class="modal-overlay" @click="closeApiEditModal">
    <div class="modal-container api-edit-modal" @click.stop>
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">编辑 API</h5>
          <button class="btn-close" @click="closeApiEditModal"></button>
        </div>
        <div class="modal-body custom-scrollbar">
          <!-- 错误提示 -->
          <div v-if="apiEditError" class="alert alert-danger mb-3">
            {{ apiEditError }}
          </div>
          
          <!-- API 名称 -->
          <div class="mb-3">
            <label class="form-label">API 名称</label>
            <input type="text" 
                   class="form-control"
                   :class="{ 'is-invalid': apiEditError && !editingApi.name.trim() }" 
                   v-model.trim="editingApi.name"
                   placeholder="请输入 API 名称">
          </div>
          
          <!-- API 地址 -->
          <div class="mb-3">
            <label class="form-label">API 地址</label>
            <div class="input-group">
              <input type="text" 
                     class="form-control"
                     :class="{ 'is-invalid': apiEditError && !editingApi.url.trim() }" 
                     v-model.trim="editingApi.url"
                     placeholder="请输入 API 地址">
              <button class="btn btn-outline-primary test-api-btn" 
                      @click="testApiConnection"
                      :disabled="isApiTesting || !editingApi.url">
                <span v-if="isApiTesting" class="spinner-border spinner-border-sm me-1"></span>
                {{ isApiTesting ? '测试中...' : '测试连接' }}
              </button>
            </div>
          </div>
          
          <!-- API Key -->
          <div class="mb-3">
            <label class="form-label">API Key</label>
            <input type="password" 
                   class="form-control"
                   :class="{ 'is-invalid': apiEditError && !editingApi.key.trim() }" 
                   v-model.trim="editingApi.key"
                   placeholder="请输入 API Key">
          </div>
          
          <!-- API 描述 -->
          <div class="mb-3">
            <label class="form-label">API 描述</label>
            <textarea 
                      class="form-control"
                      v-model="editingApi.description"
                      placeholder="请输入 API 描述">
            </textarea>
          </div>
          
          <!-- 可用模型 -->
          <div class="mb-3">
            <label class="form-label">可用模型</label>
            <div class="models-list">
              <div v-for="model in editingApi.models" 
                   :key="model.id" 
                   class="model-item">
                <div class="model-info">
                  <div class="model-header">
                    <span class="model-name">{{ model.name }}</span>
                    <span v-if="newModelIds.includes(model.id)" class="new-badge"></span>
                  </div>
                  <span class="model-description">{{ model.description }}</span>
                </div>
                <div class="model-actions">
                  <!-- 添加测试按钮 -->
                  <button class="btn-icon test-model-btn" 
                          @click="testModelConnection(model.id, $event)"
                          :disabled="modelTesting[model.id]"
                          @mouseenter="$event.target.title = '测试模型连接'"
                          @mouseleave="$event.target.title = ''">
                    <span v-if="modelTesting[model.id]" class="spinner-border spinner-border-sm"></span>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
                      <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
                      <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
                      <line x1="12" y1="20" x2="12" y2="20"></line>
                    </svg>
                  </button>
                  <!-- 删除按钮 -->
                  <button class="btn-icon" @click="removeModel(model.id)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- 新模型表单 -->
              <div v-if="showNewModelForm" class="new-model-form">
                <div class="mb-2">
                  <label class="form-label">模型名称</label>
                  <input type="text" 
                         class="form-control"
                         :class="{ 'is-invalid': modelNameError }" 
                         v-model.trim="newModel.name"
                         placeholder="请输入模型名称">
                  <div v-if="modelNameError" class="invalid-feedback">
                    {{ modelNameError }}
                  </div>
                </div>
                <div class="mb-2">
                  <label class="form-label">模型说明</label>
                  <input type="text" 
                         class="form-control"
                         :class="{ 'is-invalid': modelNameError && !newModel.description.trim() }" 
                         v-model.trim="newModel.description"
                         placeholder="请输入模型说明">
                  <div v-if="modelNameError && !newModel.description.trim()" class="invalid-feedback">
                    模型说明不能为空
                  </div>
                </div>
                <div class="form-actions">
                  <button class="btn btn-sm btn-secondary" @click="cancelNewModel">取消</button>
                  <button class="btn btn-sm btn-primary" @click="saveNewModel">保存</button>
                </div>
              </div>

              <!-- 添加新模型按钮 -->
              <button v-if="!showNewModelForm" 
                      class="btn btn-outline-secondary w-100 mt-2" 
                      @click="addNewModel">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="me-2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                添加新模型
              </button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" 
                  @click="closeApiEditModal"
                  :disabled="isApiTesting">
            取消
          </button>
          <button class="btn btn-primary" 
                  @click="saveApiEdit"
                  :disabled="isApiTesting || !editingApi?.name || !editingApi?.url || !editingApi?.key">
            {{ editingApi?.id ? '更新' : '添加' }}
          </button>
        </div>
      </div>
    </div>
  </div>

</template>


<style>
.hello {
  padding: 10px 28px;
}

.cursor-pointer {
  cursor: pointer;
}

.hover-bg-light:hover:not(.selected-friend) {
  background-color: rgba(0, 0, 0, 0.03);
}

.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 4px 0;
  min-width: 120px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  z-index: 1000;
}

.context-menu-item {
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.context-menu-item:hover {
  background-color: #f5f5f5;
}

.pin-icon {
  font-size: 12px;
  opacity: 0.7;
}

.selected-friend {
  background-color: rgba(0, 0, 0, 0.05);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(2px);
}

.modal-container {
  position: fixed;
  top: 15vh;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  animation: modal-in 0.3s ease-out;
  overflow: hidden;
  display: flex;
  padding: 20px;
  background: linear-gradient(to bottom, #f8f9fa, white);
}

.modal-content {
  width: 100%;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #eee;
  background-color: rgba(248, 249, 250, 0.8);
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  background-color: white;
}

.modal-footer {
  padding: 1.25rem 1.5rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  background-color: rgba(248, 249, 250, 0.8);
}

.avatar-selector {
  position: relative;
  width: 100%;
}

.avatar-select-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.avatar-select-button:hover {
  border-color: #adb5bd;
  background-color: #f8f9fa;
}

.selected-avatar {
  font-size: 20px;
}

.avatar-dropdown {
  position: absolute;
  top: calc(100% + 1px);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 0 0 6px 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1060;
  animation: dropdown-in 0.2s ease-out;
}

.category-tabs {
  padding: 6px;
  border-bottom: 1px solid #eee;
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.category-tab {
  padding: 4px 8px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background-color: #f8f9fa;
  color: #495057;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.category-tab:hover {
  background-color: #e9ecef;
  border-color: #ced4da;
}

.category-tab.active {
  background-color: #0d6efd;
  color: white;
  border-color: #0d6efd;
}

.avatar-grid {
  padding: 8px;
  max-height: 200px;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(18, 1fr);
  gap: 2px 2px;
  grid-auto-rows: min-content;
}

.avatar-option {
  width: 28px;
  height: 28px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s ease;
}

.avatar-option:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.avatar-option.selected {
  border-color: #0d6efd;
  background-color: #e7f1ff;
  transform: scale(1.1);
}

@keyframes dropdown-in {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.toggle-icon {
  margin-left: auto;
  font-size: 12px;
  transition: transform 0.3s ease;
}

.toggle-icon.expanded {
  transform: rotate(180deg);
}

.avatar-option {
  width: 40px;
  height: 40px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.avatar-option.selected {
  border-color: #0d6efd;
  background-color: #e7f1ff;
}

@keyframes modal-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.btn-close {
  padding: 0.5rem;
  font-size: 1.5rem;
  line-height: 1;
  color: #666;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-close:hover {
  color: #333;
  transform: rotate(90deg);
}

.form-label {
  font-weight: 500;
  color: #444;
  margin-bottom: 0.5rem;
}

.form-control {
  border-radius: 6px;
  border-color: #ddd;
  padding: 0.625rem 1rem;
  transition: all 0.2s;
}

.form-control:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.15);
}

.selectors-container {
  display: flex;
  gap: 1rem;
}

.selector-group {
  flex: 1;
}

.api-selector,
.model-selector {
  position: relative;
  width: 100%;
}

.api-select-button,
.model-select-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.api-select-button:hover,
.model-select-button:hover {
  background-color: #f8f9fa;
}

/* 删除旧的选择器样式 */
.selector-row,
.selector-divider {
  display: none;
}

.api-dropdown,
.model-dropdown {
  position: absolute;
  top: calc(100% + 1px);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 0 0 6px 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1060;
  animation: dropdown-in 0.2s ease-out;
}

.api-option,
.model-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.api-option:hover,
.model-option:hover {
  background-color: #f8f9fa;
}

.api-option.selected,
.model-option.selected {
  background-color: #e7f1ff;
}

.api-option-content,
.model-option-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.api-name,
.model-name {
  font-weight: 500;
  color: #333;
}

.api-description,
.model-description {
  font-size: 12px;
  color: #6c757d;
}

.api-check,
.model-check {
  color: #0d6efd;
  font-weight: bold;
}

.api-select-button:has(+ .api-dropdown),
.model-select-button:has(+ .model-dropdown) {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  background-color: #f8f9fa;
}

.api-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.api-option-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.edit-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border: none;
  background: transparent;
  color: #6c757d;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  opacity: 0;  /* 默认隐藏 */
}

.api-option:hover .edit-button {
  opacity: 1;  /* 鼠标悬停时显示 */
}

.edit-button:hover {
  background-color: rgba(108, 117, 125, 0.1);
  color: #495057;
}

/* 确保编辑按钮不会影响选中状态的勾选图标 */
.api-check {
  margin-left: 4px;
}

.api-edit-modal {
  max-width: 500px;
  width: 90%;
}

.models-list {
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 8px;
}

.model-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  border: 1px solid #eee;
  border-radius: 4px;
  margin-bottom: 8px;
}

.model-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.btn-icon {
  padding: 4px;
  border: none;
  background: transparent;
  color: #6c757d;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.btn-icon:hover {
  background-color: rgba(108, 117, 125, 0.1);
  color: #dc3545;
}

.add-api-option {
  border-top: 1px solid #dee2e6;
  margin-top: 4px;
  padding-top: 12px;
}

.add-api-option .api-name {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #0d6efd;
}

.add-api-option:hover {
  background-color: #e7f1ff !important;
}

.add-icon {
  stroke: currentColor;
}

.new-model-form {
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 12px;
  margin-top: 8px;
  background-color: #f8f9fa;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 14px;
}

.input-group {
  display: flex;
  gap: 8px;
}

.test-api-btn {
  white-space: nowrap;
  min-width: 100px;
}

.test-api-btn:disabled {
  cursor: not-allowed;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
  border-width: 0.15em;
}

.test-result {
  font-size: 14px;
  padding: 6px 12px;
  border-radius: 4px;
  animation: fade-in 0.3s ease-out;
}

.test-result.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.test-result.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.model-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.new-badge {
  width: 8px;
  height: 8px;
  background-color: #28a745;
  border-radius: 50%;
  display: inline-block;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.7);
  }
  
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 6px rgba(40, 167, 69, 0);
  }
  
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(40, 167, 69, 0);
  }
}

/* 自定义滚动条样式 */
.custom-scrollbar {
  scrollbar-width: thin;  /* Firefox */
  scrollbar-color: #adb5bd transparent;  /* Firefox */
}

/* Webkit (Chrome, Safari, Edge) 滚动条样式 */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #adb5bd;
  border-radius: 3px;
  transition: background-color 0.2s;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #6c757d;
}

/* 修改 modal-body 的最大高度 */
.api-edit-modal .modal-body {
  max-height: 70vh;  /* 设置最大高度为视窗高度的 70% */
  overflow-y: auto;  /* 启用垂直滚动 */
}

.is-invalid {
  border-color: #dc3545 !important;
}

.is-invalid:focus {
  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;
}

.invalid-feedback {
  display: block;
  width: 100%;
  margin-top: 0.25rem;
  font-size: 0.875em;
  color: #dc3545;
  animation: fade-in 0.2s ease-out;
}

.model-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.test-model-btn {
  color: #0d6efd;
}

.test-model-btn:hover {
  background-color: rgba(13, 110, 253, 0.1);
  color: #0a58ca;
}

.test-model-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.model-test-result {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  animation: fade-in 0.2s ease-out;
}

.model-test-result.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.model-test-result.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.alert {
  padding: 0.75rem 1.25rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  animation: fade-in 0.2s ease-out;
}

.alert-danger {
  color: #721c24;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
}

.no-models-message {
  padding: 12px;
  text-align: center;
  color: #6c757d;
  font-size: 14px;
  background-color: #f8f9fa;
  border-radius: 4px;
  margin: 8px;
}

/* 当没有可用模型时的按钮样式 */
.model-select-button.no-models {
  color: #6c757d;
  cursor: not-allowed;
  background-color: #f8f9fa;
}

.generate-prompt-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  min-width: 40px;
  color: #0d6efd;
  transition: all 0.2s;
}

.generate-prompt-btn:hover {
  background-color: rgba(13, 110, 253, 0.1);
  color: #0a58ca;
}

.generate-prompt-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.generate-prompt-btn svg {
  transition: transform 0.2s;
}

.generate-prompt-btn:hover svg {
  transform: scale(1.1);
}

.prompt-textarea {
  resize: vertical;
  min-height: 100px;
  font-size: 14px;
  line-height: 1.5;
  font-family: system-ui, -apple-system, sans-serif;
}

.prompt-textarea:focus {
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

.form-text {
  font-size: 12px;
  margin-top: 4px;
}

.friend-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.friend-name {
  font-weight: 500;
  color: #333;
}

.friend-model-info {
  font-size: 12px;
  color: #6c757d;
  display: flex;
  align-items: center;
  gap: 4px;
}

.friend-model-info .separator {
  color: #adb5bd;
}

.friend-avatar {
  font-size: 24px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.api-name, .model-name {
  color: #0d6efd;
  font-weight: 500;
}

.friend-description {
  font-size: 12px;
  color: #6c757d;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 调整好友列表项布局 */
.friend-info {
  min-width: 0;  /* 允许内容收缩 */
  flex: 1;       /* 占据剩余空间 */
}

/* 确保右侧内容不会挤压左侧 */
.ms-auto {
  margin-left: auto !important;
  flex-shrink: 0;  /* 防止收缩 */
}

/* 添加拖动相关样式 */
.modal-header {
  cursor: move;
  user-select: none;
}

.modal-header.dragging {
  cursor: grabbing;
}

.modal-container {
  position: fixed;
  transition: none; /* 移除过渡效果以实现平滑拖动 */
}

/* 拖动时的视觉反馈 */
.modal-container:active {
  opacity: 0.98;
}

/* 确保内容区域不可拖动 */
.modal-body {
  cursor: default;
}

/* 修改好友信息布局样式 */
.friend-header {
  display: flex;
  align-items: center;
  justify-content: space-between; /* 修改为两端对齐 */
  gap: 8px;
  min-width: 0;
}

.friend-name {
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  flex-shrink: 0; /* 防止名称被压缩 */
}

.friend-description {
  font-size: 12px;
  color: #6c757d;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: right; /* 添加右对齐 */
  max-width: 200px;
  margin-left: auto; /* 推到右侧 */
}

/* 调整好友信息容器 */
.friend-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;  /* 允许内容收缩 */
  flex: 1;       /* 占据剩余空间 */
}

/* 确保右侧图标不会被挤压 */
.pin-icon {
  flex-shrink: 0;
  margin-left: 8px;
}

/* 添加边框容器样式 */
.friend-list-container {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 调整手柄样式 */
.resize-handle {
  position: absolute;
  top: 0;
  right: -3px;
  width: 6px;
  height: 100%;
  cursor: col-resize;
  background-color: transparent;
  transition: background-color 0.2s;
  z-index: 1; /* 确保手柄在边框之上 */
}

.resize-handle:hover,
.resize-handle.active {
  background-color: rgba(13, 110, 253, 0.1);
}

/* 调整中的视觉反馈 */
.resize-handle.active::after {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  width: 2px;
  height: 100%;
  background-color: #0d6efd;
  transform: translateX(-50%);
}
</style>