<script lang="ts" setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useNavigation } from '../composables/useNavigation'
import { useFriends } from '../composables/useFriends'
import { useContextMenu } from '../composables/useContextMenu'
import { useMessageInput } from '../composables/useMessageInput'
import { useChat } from '../composables/useChat'
import ChatMessage from '../components/ChatMessage.vue'
import '../styles/friends.css'

// Props 定义
defineProps({
  enterAction: {
    type: Object,
    required: true
  }
})

// 组合式函数
const { isChatActive, isApiActive, toggleNavigation } = useNavigation()
const {
  friendsList,
  selectedFriendId,
  loadFriendsList,
  addFriend,
  handleFriendClick,
  deleteFriend,
  pinFriend,
  editFriend
} = useFriends()
const {
  contextMenu,
  handleContextMenu,
  closeContextMenu
} = useContextMenu()

const { messages, isLoading, sendMessage } = useChat()
const { messageText, handleKeydown } = useMessageInput(sendMessage)

// 添加对聊天容器的引用
const chatContainerRef = ref<HTMLElement | null>(null)

// 监听消息列表变化
watch(() => messages.value, async () => {
  await nextTick()
  if (chatContainerRef.value) {
    chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight
  }
}, { deep: true })

// 生命周期钩子
onMounted(() => {
  document.addEventListener('click', closeContextMenu)
  loadFriendsList()
})

onUnmounted(() => {
  document.removeEventListener('click', closeContextMenu)
})
</script>

<template>
  <div class="d-flex" style="height: 100%;">
    <!-- 左侧导航栏 -->
    <nav class="card flex-shrink-0 border-0" style="width: 4rem; height: 100%;">
      <div class="badge bg-white border-0 h-100">
        <div class="card-body p-0 scrollable flex-fill h-100">
          <div class="nav flex-column nav-pills h-100">
            <!-- 聊天按钮 -->
            <button class="m-1 p-2 btn btn-outline-info border-0" :class="{ 'active': isChatActive }" v-tooltip="'对话'"
              @click="toggleNavigation('chat', loadFriendsList)">
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

            <!-- API按钮 -->
            <button class="m-1 p-2 btn btn-outline-warning border-0 mt-auto" :class="{ 'active': isApiActive }" v-tooltip="'API设置'"
              @click="toggleNavigation('api')">
              <span>
                <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="1"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-api m-0"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 13h5" /><path d="M12 16v-8h3a2 2 0 0 1 2 2v1a2 2 0 0 1 -2 2h-3" /><path d="M20 8v8" /><path d="M9 16v-5.5a2.5 2.5 0 0 0 -5 0v5.5" /></svg>
              </span>
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主内容区域 -->
    <main class="card flex-fill h-100" :class="{ 'd-none': !isChatActive }">
      <div class="row g-0 flex-fill h-100">
        <!-- 好友列表 -->
        <aside class="col-2 border-0 border-end position-relative h-100 scrollable overflow-auto">
          <div class="friend-list-container">
            <!-- 现有的好友列表内容 -->
            <div class="d-flex w-100 border-0 border-bottom p-2 card-header d-none d-md-block">
              <div class="d-flex w-100 ">
                <button class="btn btn-outline-secondary border-0 py-2" v-tooltip="'点击选择机器人'">
                  <span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"
                      class="icon icon-tabler icons-tabler-outline icon-tabler-brand-github-copilot m-0">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M4 18v-5.5c0 -.667 .167 -1.333 .5 -2" />
                      <path d="M12 7.5c0 -1 -.01 -4.07 -4 -3.5c-3.5 .5 -4 2.5 -4 3.5c0 1.5 0 4 3 4c4 0 5 -2.5 5 -4z" />
                      <path
                        d="M4 12c-1.333 .667 -2 1.333 -2 2c0 1 0 3 1.5 4c3 2 6.5 3 8.5 3s5.499 -1 8.5 -3c1.5 -1 1.5 -3 1.5 -4c0 -.667 -.667 -1.333 -2 -2" />
                      <path d="M20 18v-5.5c0 -.667 -.167 -1.333 -.5 -2" />
                      <path
                        d="M12 7.5l0 -.297l.01 -.269l.027 -.298l.013 -.105l.033 -.215c.014 -.073 .029 -.146 .046 -.22l.06 -.223c.336 -1.118 1.262 -2.237 3.808 -1.873c2.838 .405 3.703 1.797 3.93 2.842l.036 .204c0 .033 .01 .066 .013 .098l.016 .185l0 .171l0 .49l-.015 .394l-.02 .271c-.122 1.366 -.655 2.845 -2.962 2.845c-3.256 0 -4.524 -1.656 -4.883 -3.081l-.053 -.242a3.865 3.865 0 0 1 -.036 -.235l-.021 -.227a3.518 3.518 0 0 1 -.007 -.215z" />
                      <path d="M10 15v2" />
                      <path d="M14 15v2" />
                    </svg>
                  </span>
                </button>

                <button class="btn btn-outline-warning border-0 py-2 ms-auto" v-tooltip="'新增好友'"
                  @click="addFriend('好友')">
                  <span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"
                      class="icon icon-tabler icons-tabler-outline icon-tabler-message-circle-plus m-0">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path
                        d="M12.007 19.98a9.869 9.869 0 0 1 -4.307 -.98l-4.7 1l1.3 -3.9c-2.324 -3.437 -1.426 -7.872 2.1 -10.374c3.526 -2.501 8.59 -2.296 11.845 .48c1.992 1.7 2.93 4.04 2.747 6.34" />
                      <path d="M16 19h6" />
                      <path d="M19 16v6" />
                    </svg>
                  </span>
                </button>
              </div>

            </div>
            <div class="card-body p-0 h-100">
              <div class="d-flex flex-column">
                <div v-for="friend in friendsList" :key="friend.id" @click="handleFriendClick(friend)"
                  @contextmenu="(e) => handleContextMenu(e, friend.id)" :class="[
                    'd-flex align-items-start p-2 cursor-pointer hover-bg-light border-bottom',
                    { 'selected-friend': selectedFriendId === friend.id }
                  ]">
                  <!-- 左侧头像 -->
                  <span class="me-2 friend-avatar"></span>

                  <!-- 中间名称和说明信息 -->
                  <div class="friend-info">
                    <!-- 修改为上下布局 -->
                    <div class="friend-header flex-column">
                      <span class="friend-name">{{ friend.name }}</span>
                      <span v-if="friend.description" class="friend-description text-muted">
                        {{ friend.description }}
                      </span>
                    </div>
                  </div>

                  <!-- 添加置顶图标显示 -->
                  <span v-if="friend.isPinned" class="pin-icon ms-auto">⬆️</span>
                </div>
              </div>
            </div>

          </div>
        </aside>
        <!-- 聊天区域 -->
        <section class="col-10 d-flex flex-column h-100">
          <div class="chat-main d-flex flex-grow-1">
            <!-- 聊天内容区域 -->
            <div class="chat-content flex-grow-1 overflow-auto" ref="chatContainerRef">
              <div class="chat-bubbles p-4">
                <ChatMessage 
                  v-for="message in messages"
                  :key="message.id"
                  :message="message"
                />
              </div>
            </div>
            <!-- 历史记录侧边栏 -->
            <div class="history-container">
              <div class="card-header">
                <span class="text-muted">话题记录</span>
              </div>
              <div class="card-body px-0">
                <div
                  class="chat-history-item btn btn-outline-secondary border-0 border-bottom w-100 justify-content-start">
                  <div class="d-block">
                    这是一段聊天记录
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 输入框区域 -->
          <div class="chat-input-wrapper">
            <div class="chat-input-container">
              <!-- 创建一个选项卡 -->
              <div class="chat-input-container-header p-2 d-flex">
                <div>
                  <span class="btn btn-outline-secondary border-0 p-1 pe-2 border-end shadow-none" v-tooltip="'新话题'">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"
                      class="icon icon-tabler icons-tabler-outline icon-tabler-file-diff m-0">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                      <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
                      <path d="M12 10l0 4" />
                      <path d="M10 12l4 0" />
                      <path d="M10 17l4 0" />
                    </svg>
                  </span>
                </div>
                <div>
                  <span class="btn btn-outline-secondary border-0 p-1 pe-2 border-end shadow-none" v-tooltip="'设置'">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"
                      class="icon icon-tabler icons-tabler-outline icon-tabler-adjustments-alt m-0">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M4 8h4v4h-4z" />
                      <path d="M6 4l0 4" />
                      <path d="M6 12l0 8" />
                      <path d="M10 14h4v4h-4z" />
                      <path d="M12 4l0 10" />
                      <path d="M12 18l0 2" />
                      <path d="M16 5h4v4h-4z" />
                      <path d="M18 4l0 1" />
                      <path d="M18 9l0 11" />
                    </svg>
                  </span>
                  <span class="btn btn-outline-secondary border-0 p-1 ps-2 border-end shadow-none" v-tooltip="'历史'">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"
                      class="icon icon-tabler icons-tabler-outline icon-tabler-history m-0">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M12 8l0 4l2 2" />
                      <path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5" />
                    </svg>
                  </span>

                </div>
                <div class="ms-auto d-flex">
                  <div class="pe-2 ps-5 align-self-center">
                    <select name="" id="" class="border-0 form-select py-0 text-muted shadow-none"
                      v-tooltip="'选择转发API'">
                      <option value="1">硅基流动</option>
                      <option value="2">V3</option>
                      <option value="3">clude2.5</option>

                    </select>
                  </div>
                  <div class="ps-2 border-start align-self-center" v-tooltip="'选择大模型'">
                    <select name="" id="" class="border-0 form-select py-0 text-muted shadow-none">
                      <option value="1">clude3.5</option>
                      <option value="2">clude3.0</option>
                      <option value="3">clude2.5</option>
                    </select>
                  </div>
                </div>
              </div>


              <textarea
                v-model="messageText"
                class="form-control border-0 flex-grow-1 mb-1"
                placeholder="输入消息..."
                rows="3"
                @keydown="handleKeydown"
                :disabled="isLoading"
              ></textarea>
            </div>
          </div>
        </section>
      </div>
    </main>

    <!-- 右键菜单 -->
    <div v-if="contextMenu.show" class="context-menu" :style="{
      left: contextMenu.x + 'px',
      top: contextMenu.y + 'px'
    }">
      <div class="context-menu-item" @click="pinFriend(contextMenu.targetId)">
        置顶
      </div>
      <div class="context-menu-item" @click="editFriend(contextMenu.targetId)">
        编辑
      </div>
      <div class="context-menu-item" @click="deleteFriend(contextMenu.targetId)">
        删除
      </div>
    </div>
  </div>
</template>


<style>
/* 基础样式 */
.hello {
  padding: 10px 28px;
}

/* 添加好友头像样式 */
.friend-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #6c757d;
  position: relative;
}

.friend-avatar::after {
  content: '👤';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* 修改好友信息样式 */
.friend-info {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.friend-header {
  display: flex;
  flex-direction: column;
  /* 改为纵向排列 */
  gap: 4px;
  /* 减小间距 */
}

.friend-name {
  font-weight: 500;
  color: #212529;
  line-height: 1.2;
  /* 添加行高 */
}

.friend-description {
  font-size: 0.875em;
  color: #6c757d;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
  /* 添加行高 */
}

/* 添加右键菜单样式 */
.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 4px 0;
  min-width: 120px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
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

/* 添加选中状态样式 */
.selected-friend {
  background-color: rgba(0, 0, 0, 0.05);
}

.cursor-pointer {
  cursor: pointer;
}

.hover-bg-light:hover:not(.selected-friend) {
  background-color: rgba(0, 0, 0, 0.03);
}

/* 移除 app 滚动条 */
.app {
  overflow: hidden;
}

/* 聊天主体区域样式 */
.chat-main {
  height: calc(100vh - 160px);
  /* 减去输入框高度 */
  position: relative;
}

/* 聊天内容区域样式 */
.chat-content {
  width: 70%;
  /* 或者其他合适的宽度比例 */
  padding: 20px;
  border-right: 1px solid #dee2e6;
}

/* 历史记录侧边栏样式 */
.history-container {
  width: 20%;
  /* 或者其他合适的宽度比例 */
  background: white;
  padding: 16px;
  overflow-y: auto;
}

.chat-bubbles {
  height: 100%;
}

/* 修改输入框样式 */
.chat-input-wrapper {
  height: 10rem;
  background: white;
  border-top: 1px solid #dee2e6;
}


.chat-input-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chat-textarea {
  flex: 1;
  resize: none;
  border-radius: 6px;
  min-height: 80px;
}

.chat-input-actions {
  padding-top: 8px;
  display: flex;
  justify-content: flex-end;
}

/* 聊天消息容器 */
.chat-bubbles {
  display: flex;
  flex-direction: column;
}

/* 单条消息样式 */
.chat-message {
  display: flex;
  gap: 12px;
  max-width: 80%;
}

/* 用户消息靠右 */
.chat-message.user-message {
  flex-direction: row-reverse;
  align-self: flex-end;
}

/* 头像样式 */
.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* 消息内容区域 */
.message-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* 消息气泡 */
.message-bubble {
  padding: 12px 16px;
  border-radius: 12px;
  background: #f8f9fa;
  white-space: pre-wrap;
}

/* 用户消息气泡样式 */
.user-message .message-bubble {
  background: #007bff;
  color: white;
}

/* 时间戳样式 */
.message-time {
  font-size: 12px;
  margin-top: 4px;
}

.user-message .message-time {
  text-align: right;
}

/* 加载状态样式 */
.chat-message.loading .message-bubble {
  position: relative;
  overflow: hidden;
}

.chat-message.loading .message-bubble::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #007bff, transparent);
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
</style>