const redis = require('redis')
require('dotenv').config()

const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT || 6379,
    connect_timeout: 30000,
    tls: process.env.REDIS_TLS === 'true' ? {} : undefined
  }
  
})
redisClient.on('connect', () => {
  console.log('Redis connected')
})

redisClient.on('error', (err) => {
  console.error('Redis error:', err)
})

;(async () => {
  try {
    await redisClient.connect()
    console.log('Redis client connected')
  } catch (err) {
    console.log('Redis client connection error:', err)
  }
})()

module.exports = redisClient