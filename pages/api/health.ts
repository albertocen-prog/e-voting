import type { NextApiResponse } from 'next';

export default async function handler(
  res: NextApiResponse
) {
  return res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
}
