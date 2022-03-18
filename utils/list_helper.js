const flow = require('lodash/fp/flow')
const groupBy = require('lodash/fp/groupBy')
const mapValues = require('lodash/fp/map')
const maxBy = require('lodash/fp/maxBy')
const head = require('lodash/fp/head')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  const reducer = (sum, item) => {
    return sum + item.likes
  }

  return blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
  const reducer = (a, b) => {
    return a.likes < b.likes ? b : a
  }

  if (blogs.length === 0) {
    return null
  }

  const result = blogs.reduce(reducer, { likes: 0 })

  return result.length >= 1 ? result[0] : result
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return null
  }

  const result = flow(
    groupBy('author'),
    mapValues(group => ({ author: head(group).author, blogs: Object.values(group).length  })),
    maxBy('blogs')
  )(blogs)

  return result
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return null
  }

  const result = flow(
    groupBy('author'),
    mapValues(group => ({ author: head(group).author, likes: totalLikes(group) })),
    maxBy('likes')
  )(blogs)

  return result
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}