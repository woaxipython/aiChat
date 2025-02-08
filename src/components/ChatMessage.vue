<script setup lang="ts">
import { ref, computed, nextTick, watch, onMounted } from 'vue'
import { marked } from 'marked'
import type { ChatMessage } from '../composables/useChat'

// 配置 marked
marked.setOptions({
  gfm: true,
  breaks: true
})

const props = defineProps<{
  message: ChatMessage
}>()

// 状态管理
const isReasoningCollapsed = ref(false)
const reasoningContentRef = ref<HTMLElement | null>(null)
const markdownContentRef = ref<HTMLElement | null>(null)

// 监听内容变化
watch(() => props.message.reasoningContent, async () => {
  await nextTick()
  if (reasoningContentRef.value) {
    reasoningContentRef.value.scrollTop = reasoningContentRef.value.scrollHeight
  }
}, { immediate: true })

watch(() => props.message.content, async () => {
  await nextTick()
  if (markdownContentRef.value) {
    markdownContentRef.value.scrollTop = markdownContentRef.value.scrollHeight
  }
}, { immediate: true })

// 功能函数
function toggleReasoning() {
  isReasoningCollapsed.value = !isReasoningCollapsed.value
}

const formattedContent = computed(() => {
  if (!props.message.isUser) {
    return marked(props.message.content, {
      mangle: false,
      headerIds: false
    })
  }
  return props.message.content
})

async function copyText(format: 'text' | 'markdown') {
  const content = format === 'markdown' 
    ? `\`\`\`\n${props.message.content}\n\`\`\``
    : props.message.content
  await navigator.clipboard.writeText(content)
}

function downloadWord() {
  const content = props.message.content
  const blob = new Blob([content], { type: 'application/msword' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `chat-${new Date().toISOString()}.doc`
  a.click()
  URL.revokeObjectURL(url)
}

// 修改复制代码块的函数
async function copyCodeBlock(pre: HTMLElement) {
  const code = pre.querySelector('code')
  if (code) {
    try {
      await navigator.clipboard.writeText(code.textContent || '')
      const button = pre.querySelector('.code-copy-btn') as HTMLElement
      if (button) {
        button.classList.add('copied')
        setTimeout(() => {
          button.classList.remove('copied')
        }, 2000)
      }
    } catch (err) {
      console.error('复制失败:', err)
    }

  }
}

// 在 mounted 时添加复制按钮
onMounted(() => {
  nextTick(() => {
    const preElements = document.querySelectorAll('.markdown-content pre')
    preElements.forEach(pre => {
      const copyBtn = document.createElement('button')
      copyBtn.className = 'code-copy-btn'
      copyBtn.innerHTML = `
        <span class="copy-code-default-text">复制</span>
      `
      copyBtn.onclick = (e) => {
        e.stopPropagation()
        copyCodeBlock(pre as HTMLElement)
      }
      pre.appendChild(copyBtn)
    })
  })
})
</script>

<template>
  <div class="chat-message mb-4" :class="{ 'user-message': message.isUser }">
    <!-- 头像 -->
    <div class="message-avatar">
      <span v-if="message.isUser">👤</span>
      <span v-else>🤖</span>
    </div>
    <!-- 消息内容 -->
    <div class="message-content">
      <div class="message-bubble" :class="{ 'streaming': message.isStreaming }">
        <!-- 显示推理内容 -->
        <div v-if="!message.isUser && message.reasoningContent" 
             class="reasoning-wrapper">
          <div class="reasoning-header" @click="toggleReasoning">
            <span class="reasoning-title">推理过程</span>
            <button class="toggle-btn">
              <svg xmlns="http://www.w3.org/2000/svg" 
                   width="16" height="16" 
                   viewBox="0 0 24 24" 
                   fill="none" 
                   stroke="currentColor" 
                   stroke-width="2" 
                   stroke-linecap="round" 
                   stroke-linejoin="round"
                   :class="{ 'collapsed': isReasoningCollapsed }">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          </div>
          <div class="reasoning-content" 
               ref="reasoningContentRef"
               :class="{ 'collapsed': isReasoningCollapsed }">
            {{ message.reasoningContent }}
          </div>
        </div>
        
        <!-- 使用 v-html 渲染 Markdown -->
        <div v-if="!message.isUser" 
             class="markdown-content" 
             ref="markdownContentRef"
             v-html="formattedContent">
        </div>
        <div v-else>
          {{ message.content }}
        </div>
        
        <!-- 操作按钮组 (仅AI消息显示) -->
        <div v-if="!message.isUser" class="message-actions">
          <button class="action-btn" 
                  @click="copyText('text')" 
                  title="复制文本">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
          
          <button class="action-btn" 
                  @click="downloadWord" 
                  title="下载Word文档">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </button>
        </div>
      </div>
      <div class="message-time text-muted small">
        {{ new Date(message.timestamp).toLocaleTimeString() }}
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 基础样式 */
.chat-message {
  display: flex;
  gap: 12px;
  max-width: 80%;
}

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

/* 消息内容样式 */
.message-content {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4px;
  z-index: 1;
}

.message-content:hover {
  z-index: 2;
}

.message-bubble {
  position: relative;
  padding: 12px 16px;
  border-radius: 12px;
  background: #f8f9fa;
  white-space: pre-wrap;
}

.user-message .message-bubble {
  background: #007bff;
  color: white;
}

/* Markdown 样式 */
.markdown-content {
  line-height: 1.5;
  margin: 0;
}

/* 段落样式 */
.markdown-content :deep(p) {
  margin: 0;
}

/* 列表样式 */
.markdown-content :deep(ol,ul) {
  margin: 0;
}

/* 标题样式 */
.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  margin: 0;
}

/* 表格样式 */
.markdown-content :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 0.5em 0;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  border: 1px solid #dfe2e5;
  padding: 0.4em 0.8em;
  line-height: 1.4;
}

.markdown-content :deep(th) {
  font-weight: 600;
  background: #f6f8fa;
}

.markdown-content :deep(tr:nth-child(2n)) {
  background: #fafbfc;
}

.markdown-content :deep(pre) {
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
  margin: 0.5em 0;
  border: 1px solid #e1e4e8;
  position: relative;  /* 为复制按钮定位 */
}

.markdown-content :deep(pre code) {
  font-family: 'Fira Code', Consolas, Monaco, monospace;
  font-size: 0.9em;
  line-height: 1.5;
  display: block;
}

.markdown-content :deep(code):not(pre code) {
  background: #f6f8fa;
  color: #d63384;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-size: 0.9em;
  font-family: 'Fira Code', Consolas, Monaco, monospace;
}

/* 代码块复制按钮 */
.markdown-content :deep(.code-copy-btn) {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  font-size: 0.75rem;  /* 减小字体大小 */
  line-height: 1;
  color: #070707;
  background-color: transparent;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s ease;
  text-align: center;
  padding: 2px 6px;  /* 减小内边距 */
  min-width: auto;  /* 移除最小宽度限制 */
  border: none;
  outline: none;
  height: auto;  /* 移除固定高度 */
  display: inline-flex;  /* 使用 inline-flex 布局 */
  align-items: center;
  justify-content: center;
}

/* 复制按钮文字切换 */
.markdown-content :deep(.code-copy-btn .copied-text) {
  display: none;
}

.markdown-content :deep(.code-copy-btn.copied .copy-code-default-text) {
  display: none;
}

.markdown-content :deep(.code-copy-btn.copied .copied-text) {
  display: inline;
  color: #28a745;
}

/* 鼠标悬停时显示按钮 */
.markdown-content :deep(pre:hover .code-copy-btn) {
  opacity: 1;
  background-color: rgba(240, 240, 240, 0.9);
}

/* 按钮悬停效果 */
.markdown-content :deep(.code-copy-btn:hover) {
  color: #000000;
  background-color: rgba(255, 255, 255, 0.9);
}

/* 按钮点击效果 */
.markdown-content :deep(.code-copy-btn:active) {
  transform: scale(0.95);  /* 缩小点击效果 */
}

/* 推理内容样式 */
.reasoning-wrapper {
  margin-bottom: 12px;
  background: rgba(0, 123, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(0, 123, 255, 0.1);
}

.reasoning-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  cursor: pointer;
  user-select: none;
  border-bottom: 1px solid rgba(0, 123, 255, 0.1);
  transition: background-color 0.2s ease;
}

.reasoning-content {
  padding: 12px;
  font-size: 0.9em;
  color: #666;
  line-height: 1.5;
  max-height: 300px;
  overflow-y: auto;
  transition: all 0.3s ease;
}

.reasoning-content.collapsed {
  max-height: 0;
  padding: 0 12px;
  overflow: hidden;
}

/* 加载动画 */
.message-bubble.streaming::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #007bff, transparent);
  animation: loading 1s infinite;
  display: none;
}

:not(.user-message) .message-bubble.streaming::after {
  display: block;
}

@keyframes loading {
  0% { transform: translateX(0%); }
  40% { transform: translateX(2%); }
  100% { transform: translateX(0%); }
}

/* 操作按钮容器 */
.message-actions {
  position: absolute;
  bottom: -40px;
  right: 0;
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.2s ease;
  display: flex;
  gap: 8px;
  padding: 6px;
  background: white;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

/* 鼠标悬停时显示按钮 */
.message-bubble:hover .message-actions {
  opacity: 1;
  transform: translateY(0);
}

/* 按钮样式 */
.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: #6c757d;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #f8f9fa;
  color: #007bff;
}
</style> 