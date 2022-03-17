const logger = require('./logger')
const morgan = require('morgan')

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
  }

  next(error)
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler
}