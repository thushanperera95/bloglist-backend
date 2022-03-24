const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
require('express-async-errors')

usersRouter.get('/', async (request, response) => {
  const users = await User
    .find({}).populate('blogs', { url: 1, title: 1, author: 1 })

  response.json(users)
})

usersRouter.post('/', async (request, response, next) => {
  const { username, name, password } = request.body

  const existingUser = await User.findOne({ username })
  if (existingUser) {
    next({
      name: 'DuplicateEntryError',
      message: 'username must be unique'
    })
    return
  }
  else if (!username || username.length < 3) {
    next({
      name: 'ValidationError',
      message: 'username must be at least 3 characters long'
    })
    return
  }
  else if (!password || password.length < 3) {
    next({
      name: 'ValidationError',
      message: 'password must be at least 3 characters long'
    })
    return
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash
  })

  const savedUser = await user.save()

  response.status(201).json(savedUser)
})

module.exports = usersRouter