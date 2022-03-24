const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')
const helper = require('./test_helper')
const bcrypt = require('bcrypt')

const api = supertest(app)

beforeEach(async () => {
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('secret', 10)
  const user = new User({ username: 'root', name: 'rootname', passwordHash })

  await user.save()
})

describe('when there is initially one user in the database', () => {
  test('success when logging in with the correct credentials', async () => {
    const login = { username: 'root', password: 'secret' }

    const response = await api
      .post('/api/login')
      .send(login)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const expectedToken = await helper.getToken('')
    expect(response.body.token).toContain(expectedToken)
    expect(response.body.username).toContain('root')
    expect(response.body.name).toContain('rootname')
  })

  test('fails with status code 401, if username is not provided', async () => {
    const login = { password: 'secret' }

    const response = await api
      .post('/api/login')
      .send(login)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toContain('invalid username or password')
  })

  test('fails with status code 401, if password is not provided', async () => {
    const login = { username: 'root' }

    const response = await api
      .post('/api/login')
      .send(login)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toContain('invalid username or password')
  })

  test('fails with status code 401, if password is invalid', async () => {
    const login = { username: 'root', password: 'notsecret' }

    const response = await api
      .post('/api/login')
      .send(login)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toContain('invalid username or password')
  })
})

afterAll(async () => {
  mongoose.connection.close()
})