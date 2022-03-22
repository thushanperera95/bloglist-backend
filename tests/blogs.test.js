const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const helper = require('./test_helper')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
})

describe('updating likes of a blog', () => {
  test('fails with status code 404, if a blog does not exist for the given id', async () => {

    const nonExistingId = await helper.nonExistingId()

    await api
      .put(`/api/blogs/${nonExistingId}`)
      .expect(404)
  })

  test('succeeds, if a blog exists for the given id', async () => {
    const blogsInDb = await helper.blogsInDb()

    const blogToUpdate = blogsInDb[0]
    blogToUpdate.likes = 100

    const response = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(blogToUpdate)
      .expect(200)

    expect(response.body.likes).toEqual(100)
  })
})

describe('deletion of a blog', () => {
  test('fails with status code 404, if a blog does not exist for the given id', async () => {

    const nonExistingId = await helper.nonExistingId()

    await api
      .delete(`/api/blogs/${nonExistingId}`)
      .expect(404)

    const blogsInDb = await helper.blogsInDb()
    expect(blogsInDb).toHaveLength(helper.initialBlogs.length)
  })

  test('succeeds, if a blog exists for the given id', async () => {
    const blogsInDb = await helper.blogsInDb()
    await api
      .delete(`/api/blogs/${blogsInDb[0].id}`)
      .expect(204)

    const blogsInDbPostDelete = await helper.blogsInDb()
    expect(blogsInDbPostDelete).toHaveLength(helper.initialBlogs.length - 1)
  })
})

describe('when there is initially some blogs saved', () => {
  test('all blogs can be retrieved', async() => {
    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('all retrieved blogs have ids', async() => {
    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    response.body.forEach(async (blog) => {
      expect(blog.id).toBeDefined()
    })
  })
})

describe('addition of a new blog', () => {
  test('succeeds with valid data', async () => {
    const newBlog = {
      title: 'Unit Test Title',
      author: 'Unit Test Author',
      url: 'www.thisispartofunittest.com',
      likes: 50
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsInDb = await helper.blogsInDb()
    expect(blogsInDb).toHaveLength(helper.initialBlogs.length + 1)

    const blogsUrl = blogsInDb.map(r => r.url)
    expect(blogsUrl).toContain('www.thisispartofunittest.com')
  })

  test('defaults blog number of likes to zero, if not specified in the request', async () => {
    const newBlog = {
      title: 'Unit Test Title 2',
      author: 'Unit Test Author 2',
      url: 'www.thisispartofunittest2.com'
    }

    const response = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    expect(response.body.likes).toEqual(0)
  })

  test('fails with status code 400, if it does not have a title', async () => {
    const newBlog = {
      author: 'Unit Test Author 2',
      url: 'www.thisispartofunittest2.com',
      likes: 10
    }

    const response = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toEqual('A blog must contain a title')
  })

  test('fails with status code 400, if it does not have a url', async () => {
    const newBlog = {
      title: 'Unit Test Title 2',
      author: 'Unit Test Author 2',
      likes: 10
    }

    const response = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toEqual('A blog must contain a url')
  })
})

afterAll(async () => {
  await Blog.deleteMany({})
  mongoose.connection.close()
})