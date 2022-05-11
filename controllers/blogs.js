const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const { userExtractor } = require('../utils/middleware')
require('express-async-errors')
require('dotenv').config()

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.post('/', userExtractor, async (request, response, next) => {
  const user = await User.findById(request.user.id)

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

  const blog = new Blog({
    title: request.body.title,
    author: request.body.author,
    url: request.body.url,
    likes: request.body.likes,
    user: user._id,
  })

  const savedBlog = await blog.save()
  const enrichedSavedBlog = await savedBlog.populate('user', {
    username: 1,
    name: 1,
  })

  user.blogs = user.blogs.concat(enrichedSavedBlog._id)
  await user.save()

  response.status(201).json(enrichedSavedBlog)
})

blogsRouter.post('/:id/comments', async (request, response, next) => {
  const blog = await Blog.findById(request.params.id)
  const { comment } = request.body

  if (!comment) {
    next({
      name: 'ValidationError',
      message: 'Must contain a comment',
    })
    return
  }

  blog.comments.push(comment)

  const savedBlog = await blog.save()
  const enrichedSavedBlog = await savedBlog.populate('user', {
    username: 1,
    name: 1,
  })

  response.status(201).json(enrichedSavedBlog)
}
)

blogsRouter.delete('/:id', userExtractor, async (request, response, next) => {
  const blogToRemove = await Blog.findById(request.params.id)
  if (!blogToRemove) {
    next()
    return
  } else if (
    blogToRemove.user &&
    blogToRemove.user.toString() !== request.user?.id.toString()
  ) {
    return response
      .status(403)
      .json({ error: 'you do not have permission to delete this blog' })
  }

  await Blog.remove(blogToRemove)
  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response, next) => {
  const { likes } = request.body

  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    { likes },
    { new: true }
  )

  const enrichedSavedBlog = await updatedBlog.populate('user', {
    username: 1,
    name: 1,
  })

  if (enrichedSavedBlog) {
    response.status(200).json(enrichedSavedBlog)
  } else {
    next()
  }
})

module.exports = blogsRouter
