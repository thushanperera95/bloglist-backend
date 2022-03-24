const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const initialBlogs = [
  {
    title: 'Test Title',
    author: 'Test Author',
    url: 'www.test.com',
    likes: 10
  },
  {
    title: 'Test Title 2',
    author: 'Test Author 2',
    url: 'www.testtest.com',
    likes: 3
  }
]

const nonExistingId = async () => {
  const blog = new Blog({ title: 'fakeblog' })
  await blog.save()
  await blog.remove()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

const getToken = async (prefix = 'Bearer ') => {
  const user = await User.findOne({})

  const userForToken = { username: user.username , id: user._id }

  // eslint-disable-next-line no-undef
  const token = jwt.sign(userForToken, process.env.SECRET, { expiresIn: 60*60 })

  return `${prefix}${token}`
}

module.exports = {
  initialBlogs,
  nonExistingId,
  blogsInDb,
  usersInDb,
  getToken
}