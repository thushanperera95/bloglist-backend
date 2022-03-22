const Blog = require('../models/blog')

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

module.exports = {
  initialBlogs,
  nonExistingId,
  blogsInDb
}