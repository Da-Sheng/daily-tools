/**
 * 流式通信服务 - 处理与流式API的通信
 */

// 根据环境确定代理API的URL
const AGENTS_API_BASE_URL =
  process.env.REACT_APP_AGENTS_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://icy-glade-7be0.dashengzs1314.workers.dev'
    : 'http://localhost:4111');

const AGENTS_API_URL = `${AGENTS_API_BASE_URL}/api/agents/codeReviewAgent/stream`;

// 消息接口
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// 流式请求参数接口
export interface StreamRequestParams {
  messages: Message[];
  runId: string;
  maxRetries: number;
  maxSteps: number;
  temperature: number;
  topP: number;
  runtimeContext: Record<string, any>;
}

/**
 * 发送流式消息
 * @param userMessage 用户消息
 * @param onChunk 每块内容的回调
 * @param onComplete 完成后的回调
 * @param onError 错误回调
 * @param messageHistory 可选的消息历史记录
 */
export const sendStreamMessage = async (
  userMessage: string,
  onChunk: (text: string) => void = text => {
    /* 默认空实现 */
  },
  onComplete?: (fullText: string) => void,
  onError?: (error: Error) => void,
  messageHistory?: Message[]
): Promise<void> => {
  try {
    let messages: Message[] = [];

    // 如果有消息历史，则使用它
    if (messageHistory && messageHistory.length > 0) {
      // 复制现有历史记录以避免修改原始数组
      messages = [...messageHistory];

      // 检查最后一条消息是否与当前用户消息相同
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role !== 'user' || lastMessage.content !== userMessage) {
        // 添加新的用户消息
        messages.push({
          role: 'user',
          content: userMessage,
        });
      }
    } else {
      // 初始化新的消息数组
      messages = [
        {
          role: 'system',
          content: '你是一个专业的代码评审助手，擅长分析代码质量、性能和安全性，并提供改进建议。',
        },
        {
          role: 'user',
          content: userMessage,
        },
      ];
    }

    // 构建请求参数
    const requestParams: StreamRequestParams = {
      messages,
      runId: 'codeReviewAgent',
      maxRetries: 2,
      maxSteps: 5,
      temperature: 0.5,
      topP: 1,
      runtimeContext: {},
    };

    console.log('API URL:', AGENTS_API_URL);
    console.log('请求参数:', JSON.stringify(requestParams, null, 2));

    // 发送请求
    const response = await fetch(AGENTS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestParams),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API错误: ${response.status} ${errorText}`);
    }

    // 处理流式响应
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('无法获取响应流');
    }

    let fullText = '';
    const decoder = new TextDecoder();
    let buffer = ''; // 用于存储未完成的行

    console.log('开始处理流式响应...');

    // 使用do-while循环替代while(true)
    let done = false;
    do {
      const result = await reader.read();
      done = result.done;
      if (!done) {
        const chunkText = decoder.decode(result.value, { stream: true });

        // 简化调试日志
        if (chunkText.length < 100) {
          console.log('收到数据块:', chunkText);
        } else {
          console.log(`收到数据块(${chunkText.length}个字符)`);
        }

        buffer += chunkText;

        // 处理特定格式的响应
        // 确保我们处理完整的行
        if (buffer.indexOf('\n') !== -1) {
          const lines = buffer.split('\n');
          // 保留最后一个可能不完整的行
          buffer = lines.pop() || '';

          // 收集当前批次中的所有有效内容
          let newContent = '';

          for (const line of lines) {
            // 跳过空行
            if (!line.trim()) continue;

            // 尝试解析行内容
            const extractedText = extractTextFromLine(line);

            if (extractedText !== null) {
              // 直接累积新内容
              newContent += extractedText;
            }
          }

          // 如果当前批次有新内容，则添加到全文中并触发回调
          if (newContent) {
            fullText += newContent;
            onChunk(fullText);
          }
        }
      }
    } while (!done);

    // 处理结束时可能剩余的缓冲区内容
    if (buffer.trim()) {
      console.log('处理剩余缓冲区:', buffer);

      const extractedText = extractTextFromLine(buffer);
      if (extractedText !== null) {
        fullText += extractedText;
        onChunk(fullText);
      }
    }

    console.log('流式响应处理完成');

    // 完成回调
    if (onComplete) {
      onComplete(fullText);
    }
  } catch (error) {
    console.error('流式通信错误:', error);
    if (onError && error instanceof Error) {
      onError(error);
    }
  }
};

/**
 * 从响应行中提取文本内容
 * @param line 响应行
 * @returns 提取的文本，如果无法提取则返回null
 */
function extractTextFromLine(line: string): string | null {
  // 跳过空行
  if (!line.trim()) return null;

  let extractedText = null;

  // 1. 标准格式: 0:"xxx"
  const standardMatch = line.match(/^0:"(.*?)"$/);
  if (standardMatch && standardMatch[1] !== undefined) {
    try {
      extractedText = JSON.parse(`"${standardMatch[1]}"`);
    } catch (e) {
      extractedText = standardMatch[1]
        .replace(/\\"/g, '"')
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '\t')
        .replace(/\\\\/g, '\\');
    }
    return extractedText;
  }

  // 2. 简单键值格式: 0:xxx
  const simpleMatch = line.match(/^0:(.*?)$/);
  if (simpleMatch && simpleMatch[1]) {
    return simpleMatch[1];
  }

  // 3. 特殊消息ID格式
  if (line.startsWith('f:{')) {
    try {
      const data = JSON.parse(line.substring(2));
      if (data.messageId) {
        console.log('收到消息ID:', data.messageId);
      }
    } catch (e) {
      // 忽略解析错误
    }
    return null; // 不包含实际文本内容
  }

  // 4. 如果是裸文本（不符合上述任何格式）
  if (!line.match(/^[a-zA-Z0-9_]+:/)) {
    return line;
  }

  return null;
}

/**
 * 模拟流式响应 (本地开发/测试用)
 * @param userMessage 用户消息
 * @param onChunk 每块内容的回调
 * @param onComplete 完成回调
 * @param onError 错误回调
 */
export const simulateStreamResponse = async (
  userMessage: string,
  onChunk: (text: string) => void = text => {
    /* 默认空实现 */
  },
  onComplete?: (fullText: string) => void,
  onError?: (error: Error) => void
): Promise<void> => {
  try {
    // 简单的响应映射
    const responses: Record<string, string> = {
      default:
        '我已收到您的消息，正在分析中...\n\n这段代码看起来不错，但有以下几点建议：\n1. 考虑添加更多的注释\n2. 可以优化错误处理逻辑\n3. 建议增加单元测试覆盖率',
    };

    // 根据用户消息选择响应或使用默认响应
    const fullResponse = responses[userMessage] || responses.default;

    // 模拟真实API的累积效果
    let accumulated = '';

    // 按字符或词语逐步累积显示
    const words = fullResponse.split(/(?<=\s)|(?=\s)/); // 在空格处分割，但保留空格

    for (let i = 0; i < words.length; i++) {
      // 添加新词到累积文本
      accumulated += words[i];

      // 等待一小段时间模拟真实打字速度
      await new Promise(resolve => setTimeout(resolve, 100));

      // 发送累积的文本
      onChunk(accumulated);
    }

    // 完成回调
    if (onComplete) {
      onComplete(fullResponse);
    }
  } catch (error) {
    console.error('模拟流式响应错误:', error);
    if (onError && error instanceof Error) {
      onError(error);
    }
  }
};
