const logger = require('./logger')
const morgan = require('morgan')
const jwt = require('jsonwebtoken')

const morganNonPost = morgan('tiny')
const morganPost = morgan(
  ':method :url :status :res[content-length] - :response-time ms :jsonbody'
)

morgan.token('jsonbody', function (req) {
  return JSON.stringify(req.body)
})

const requestLogger = (request, response, next) => {
  if (request.method === 'POST') {
    morganPost(request, response, next)
  } else {
    morganNonPost(request, response, next)
  }
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'DuplicateEntryError') {
    return response.status(409).send({ error: error.message })
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  next(error)
}

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')

  let token = null
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    token = authorization.substring(7)
  }

  request.token = token

  next()
}

const userExtractor = (request, response, next) => {
  // eslint-disable-next-line no-undef
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  request.user = decodedToken

  next()
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor
}