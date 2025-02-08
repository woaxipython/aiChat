<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useFriends } from '../composables/useFriends'
import { useContextMenu } from '../composables/useContextMenu'
import '../styles/friends.css'

// Props 定义
defineProps({
  enterAction: {
    type: Object,
    required: true
  }
})

// 状态管理
const isChatActive = ref(true)

// 使用组合式函数
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

// 聊天容器相关方法
function toggleChat() {
  isChatActive.value = !isChatActive.value
  if (isChatActive.value) {
    loadFriendsList()
  }
}

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
  <div class="d-flex" style="height: 100%;overflow: hidden;">
    <!-- 左侧固定宽度为 4rem -->
    <div class="card flex-shrink-0 border-0" style="width: 4rem; height: 100%;">
      <div class="badge bg-white border-0">
        <div class="card-body p-0 scrollable flex-fill h-100">
          <div class="nav flex-column nav-pills">
            <button class="m-1 p-2 btn btn-outline-info border-0" :class="{ 'active': isChatActive }" v-tooltip="'对话'"
              id="chat-button" @click="toggleChat">
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
    <div class="card flex-fill h-100" id="chat-container" :class="{ 'd-none': !isChatActive }">
      <div class="row g-0 flex-fill h-100">
        <!-- 修改好友列表容器 -->
        <div class="col-3 border-0 border-end position-relative  h-100 scrollable overflow-auto">
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
        </div>

        <!-- 右侧内容区域 -->
        <div class="col-9">
          <div class="card-body">
            <div class="chat h-100">
              <div class="chat-bubbles bg bg-blue w-100 scrollable">
              </div>
            </div>
          </div>
          <div class="card-body chat-input-wrapper">
            <div class="chat h-100">
              <div class="chat-input">
                <div class="chat-input-container">
                  <textarea 
                    class="form-control chat-textarea" 
                    placeholder="请输入消息..."
                    rows="3"
                  ></textarea>
                  <div class="chat-input-actions">
                    <button class="btn btn-primary">发送</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 添加右键菜单 -->
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

.chat-input-wrapper {
  position: fixed;
  bottom: 0;
  right: 0;
  width: 75%; /* col-9 的宽度 */
  background: white;
  border-top: 1px solid #dee2e6;
  padding: 16px;
  height: 160px; /* 固定高度 */
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

/* 确保聊天气泡区域不被输入框遮挡 */
.chat-bubbles {
  margin-bottom: 160px; /* 与输入框高度相同 */
}
</style>