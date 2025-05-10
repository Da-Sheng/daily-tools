import { NextApiRequest, NextApiResponse } from 'next';

/**
 * GraphQL API 代理
 * 注意：此路由当前未被使用，因为前端直接连接到外部 GraphQL 服务器
 * 保留此文件是为了将来可能需要的中间层处理
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // 转发到外部 GraphQL 服务器
    const response = await fetch('https://api.nizbarkwt.online/graphql', {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('GraphQL代理错误:', error);
    return res.status(500).json({
      errors: [{ message: '服务器内部错误' }],
    });
  }
}
