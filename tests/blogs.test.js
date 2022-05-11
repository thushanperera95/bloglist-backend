const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./test_helper')
const bcrypt = require('bcrypt')

const api = supertest(app)

beforeEach(async () => {
  await User.deleteMany({})
  await Blog.deleteMany({})

  const passwordHash = await bcrypt.hash('secret', 10)
  const user = new User({ username: 'root', name: 'root', passwordHash })

  const savedUser = await user.save()

  // associate above test user to all initial blogs
  helper.initialBlogs.forEach(b => {
    b.user = savedUser._id
  })

  const savedBlogs = await Blog.insertMany(helper.initialBlogs)

  // associate initial blogs to test user
  savedUser.blogs = savedBlogs.map(blog => blog._id)
  savedUser.save()
})

describe('updating likes of a blog', () => {
  test('fails with status code 404, if a blog does not exist for the given id', async () => {

    const nonExistingId = await helper.nonExistingId()

    const response = await api
      .put(`/api/blogs/${nonExistingId}`)
      .expect(404)

    expect(response.body.error).toContain('unknown endpoint')
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

describe('adding comments to a blog', () => {
  test('fails with status code 400, if request does not contain a comment', async () => {

    const blogsInDb = await helper.blogsInDb()

    const response = await api
      .post(`/api/blogs/${blogsInDb[0].id}/comments`)
      .expect(400)

    expect(response.body.error).toContain('Must contain a comment')
  })

  test('succeeds with a single comment', async () => {
    const blogsInDb = await helper.blogsInDb()

    const blogToUpdate = blogsInDb[0]

    const response = await api
      .post(`/api/blogs/${blogToUpdate.id}/comments`)
      .send({ comment: 'test comment' })
      .expect(201)

    expect(response.body.comments[0]).toEqual('test comment')
  })

  test('succeeds with multiple comments', async () => {
    const blogsInDb = await helper.blogsInDb()

    const blogToUpdate = blogsInDb[0]

    let response = await api
      .post(`/api/blogs/${blogToUpdate.id}/comments`)
      .send({ comment: 'test comment' })
      .expect(201)

    response = await api
      .post(`/api/blogs/${blogToUpdate.id}/comments`)
      .send({ comment: 'test comment2' })
      .expect(201)

    expect(response.body.comments[0]).toEqual('test comment')
    expect(response.body.comments[1]).toEqual('test comment2')
  })
})

describe('deletion of a blog', () => {
  test('fails with status code 404, if a blog does not exist for the given id', async () => {
    const nonExistingId = await helper.nonExistingId()

    const token = await helper.getToken()

    const response = await api
      .delete(`/api/blogs/${nonExistingId}`)
      .set('Authorization', token)
      .expect(404)

    const blogsInDb = await helper.blogsInDb()
    expect(blogsInDb).toHaveLength(helper.initialBlogs.length)

    expect(response.body.error).toContain('unknown endpoint')
  })

  test('succeeds, if a blog exists for the given id', async () => {
    const blogsInDb = await helper.blogsInDb()

    const token = await helper.getToken()

    await api
      .delete(`/api/blogs/${blogsInDb[0].id}`)
      .set('Authorization', token)
      .expect(204)

    const blogsInDbPostDelete = await helper.blogsInDb()
    expect(blogsInDbPostDelete).toHaveLength(helper.initialBlogs.length - 1)
  })

  test('fails with status code 401, if an authorization token is not provided', async () => {
    const blogsInDb = await helper.blogsInDb()

    const response = await api
      .delete(`/api/blogs/${blogsInDb[0].id}`)
      .expect(401)

    const blogsInDbPostDelete = await helper.blogsInDb()
    expect(blogsInDbPostDelete).toHaveLength(helper.initialBlogs.length)

    expect(response.body.error).toContain('token missing or invalid')
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

  test('all retrieved blogs have ids and created user ids', async() => {
    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    response.body.forEach(async (blog) => {
      expect(blog.id).toBeDefined()
      expect(blog.user).toBeDefined()
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

    const token = await helper.getToken()

    await api
      .post('/api/blogs')
      .set('Authorization', token)
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

    const token = await helper.getToken()

    const response = await api
      .post('/api/blogs')
      .set('Authorization', token)
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

    const token = await helper.getToken()

    const response = await api
      .post('/api/blogs')
      .set('Authorization', token)
      .send(newBlog)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toContain('A blog must contain a title')
  })

  test('fails with status code 400, if it does not have a url', async () => {
    const newBlog = {
      title: 'Unit Test Title 2',
      author: 'Unit Test Author 2',
      likes: 10
    }

    const token = await helper.getToken()

    const response = await api
      .post('/api/blogs')
      .set('Authorization', token)
      .send(newBlog)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toContain('A blog must contain a url')
  })

  test('fails with status code 401, if an authorization token is not provided', async () => {
    const newBlog = {
      title: 'Unit Test Title',
      author: 'Unit Test Author',
      url: 'www.thisispartofunittest.com',
      likes: 50
    }

    const response = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    const blogsInDb = await helper.blogsInDb()
    expect(blogsInDb).toHaveLength(helper.initialBlogs.length)

    expect(response.body.error).toContain('token missing or invalid')
  })
})

afterAll(async () => {
  mongoose.connection.close()
})