import { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env['REDIS_URL'], // Estas variables vienen de Vercel
  token: process.env['REDIS_TOKEN']
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        const mediciones = await redis.lrange('historial', 0, -1);
        res.status(200).json(mediciones || []);
        break;
      case 'POST':
        const medicion = req.body;
        await redis.lpush('historial', medicion);
        res.status(201).json(medicion);
        break;
      case 'DELETE':
        const { index } = req.body;
        const item = await redis.lindex('historial', index);
        if (item) {
          await redis.lrem('historial', 1, item);
        }
        res.status(204).end();
        break;
      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error en la API:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}