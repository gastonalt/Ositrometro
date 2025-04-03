const { VercelRequest, VercelResponse } = require('@vercel/node');
const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env['REDIS_URL'] || 'URL_NO_ENCONTRADA',
  token: process.env['REDIS_TOKEN'] || 'TOKEN_NO_ENCONTRADO'
});

module.exports = async function handler(req, res) {
  const { method } = req;

  try {
    console.log('REDIS_URL:', process.env['REDIS_URL']);
    console.log('REDIS_TOKEN:', process.env['REDIS_TOKEN']);
    console.log('Método:', method);
    console.log('Body:', req.body);

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
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};