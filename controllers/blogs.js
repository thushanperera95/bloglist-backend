const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
require('express-async-errors')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogsRouter.post('/', async (request, response, next) => {
  if (!request.body.title) {
    next({
      name: 'ValidationError',
      message: 'A blog must contain a title',
    })
    return
  }

  if (!request.body.url) {
    next({
      name: 'ValidationError',
      message: 'A blog must contain a url',
    })
    return
  }

  const blog = new Blog(request.body)

  const savedBlog = await blog.save()
  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response, next) => {
  const removedBlog = await Blog.findByIdAndRemove(request.params.id)

  if (removedBlog) {
    response.status(204).end()
  } else {
    next()
  }
})

blogsRouter.put('/:id', async (request, response, next) => {
  const { likes } = request.body

  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    { likes },
    { new: true })

  if (updatedBlog) {
    response.status(200).json(updatedBlog)
  } else {
    next()
  }
})

module.exports = blogsRouter