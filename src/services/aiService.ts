import type { Friend } from '../types'

// 基础请求参数接口
interface ChatRequest {
  message: string
  modelName: string
  apiId: string
}

// 基础响应结果接口
interface ChatResponse {
  content: string
}

interface OpenAIMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface OpenAIRequest {
  model: string
  messages: OpenAIMessage[]
  temperature: number
  max_tokens: number
  stream: boolean
}

interface OpenAIResponse {
  choices: {
    delta: {
      content?: string
      reasoning_content?: string
    }
  }[]
}

// 基础AI请求服务
export async function sendChatMessage(
  message: string,
  model: string,
  api: string,
  onChunk: (chunk: string, isReasoning?: boolean) => void
): Promise<ChatResponse> {
  try {
    const requestBody: OpenAIRequest = {
      model: model,
      messages: [
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      stream: true
    }

    // const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${api}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`请求失败: ${response.status}, ${JSON.stringify(errorData)}`)
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()
    let fullContent = ''

    if (reader) {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6)) as OpenAIResponse
              
              // 处理推理内容
              const reasoningContent = data.choices[0]?.delta?.reasoning_content
              if (reasoningContent) {
                onChunk(reasoningContent, true)
              }
              
              // 处理普通内容
              const content = data.choices[0]?.delta?.content
              if (content) {
                fullContent += content
                onChunk(content, false)
              }
            } catch (e) {
              console.error('解析流式数据失败:', e)
            }
          }
        }
      }
    }

    return {
      content: fullContent
    }
  } catch (error) {
    console.error('发送消息失败:', error)
    throw error
  }
} 