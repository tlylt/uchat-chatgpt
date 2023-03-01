// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { ChatGPTAPI } from 'chatgpt';
import KeyvRedis from '@keyv/redis';
import Keyv from 'keyv';
require('dotenv-safe').config();

type Data = any;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  const store = new KeyvRedis(redisUrl);
  const messageStore = new Keyv({ store, namespace: 'chatgpt-demo' });
  const api = new ChatGPTAPI({
    apiKey: process.env.OPENAI_API_KEY || '', // Your OpenAI API Key
    messageStore,
  });

  if (req.body.message === '') {
    res.status(200).json({
      message: 'Please type something',
    });
    return;
  }

  let openAiRes;
  if (
    req.body.conversationId &&
    req.body.conversationId !== '' &&
    req.body.parentMessageId &&
    req.body.parentMessageId !== ''
  ) {
    const opts = {
      conversationId: req.body.conversationId,
      parentMessageId: req.body.parentMessageId,
    };
    openAiRes = await api.sendMessage(req.body.message, opts);
  } else {
    openAiRes = await api.sendMessage(req.body.message);
  }

  res.status(200).json({
    message: openAiRes.text,
    conversationId: openAiRes.conversationId,
    messageId: openAiRes.id,
  });
}
