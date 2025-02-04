// const redis = require('redis')
// require('dotenv').config()

// 1 
// const redisClient = redis.createClient({
//   socket: {
//     host: process.env.REDIS_HOST,
//     port: process.env.REDIS_PORT || 6379,
//     connect_timeout: 50000,
//     tls: process.env.REDIS_TLS === 'true' ? {} : undefined
//   }
// })

// 2
// const redisClient = redis.createClient({
//   socket: {
//     host: process.env.REDIS_HOST,
//     port: process.env.REDIS_PORT || 6379,
//     connect_timeout: 10000,
//     tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
//     retry_strategy: function(options) {  // 添加重連策略
//       if (options.error && options.error.code === 'ECONNREFUSED') {
//         return new Error('Redis connection refused');
//       }
//       if (options.total_retry_time > 20000) {  // 總重連時間限制
//         return null;
//       }
//       return Math.min(options.attempt * 500, 3000);  // 每次重連間隔增加
//     }
//   }
// })

// redisClient.on('connect', () => {
//   console.log('Redis connected')
// })

// redisClient.on('error', (err) => {
//   console.error('Redis error:', err)
// })
// // 新增
// redisClient.on('ready', () => {
//   console.log('Redis ready');
// })

// redisClient.on('reconnecting', () => {
//   console.log('Redis reconnecting...');
// })

// redisClient.on('end', () => {
//   console.log('Redis connection ended');
// })
// //
// ;(async () => {
//   try {
//     await redisClient.connect()
//     console.log('Redis client connected')
//   } catch (err) {
//     console.log('Redis client connection error:', err)
//   }
// })()

// module.exports = redisClient