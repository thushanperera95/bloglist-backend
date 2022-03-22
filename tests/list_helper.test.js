const listHelper = require('../utils/list_helper')

const testData = [
  {
    _id: '5a422a851b54a676234d17f7',
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
    __v: 0
  },
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    __v: 0
  },
  {
    _id: '5a422b3a1b54a676234d17f9',
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
    __v: 0
  },
  {
    _id: '5a422b891b54a676234d17fa',
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10,
    __v: 0
  },
  {
    _id: '5a422ba71b54a676234d17fb',
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    likes: 0,
    __v: 0
  },
  {
    _id: '5a422bc61b54a676234d17fc',
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2,
    __v: 0
  },
  {
    _id: '5a422bc61b54a676235d17fc',
    title: 'Test Title',
    author: 'Test Author',
    url: 'http://www.google.com',
    likes: 12,
    __v: 0
  },
  {
    _id: '6a422bc61b54a676235d17fc',
    title: 'Test Title2',
    author: 'Test Author2',
    url: 'http://www.google.com',
    likes: 12,
    __v: 0
  },
  {
    _id: '6a422bc61b54a676235d17fc',
    title: 'Test Title2',
    author: 'Test Author2',
    url: 'http://www.google.com',
    likes: 12,
    __v: 0
  },
  {
    _id: '6a422bc61b54a676235d17fc',
    title: 'Test Title2',
    author: 'Test Author2',
    url: 'http://www.google.com',
    likes: 12,
    __v: 0
  }
]

describe('total likes', () => {
  test('when list has only one blog, equals the likes of that', () => {
    const result = listHelper.totalLikes([].concat(testData[0]))
    expect(result).toBe(7)
  })

  test('when list has many blogs, equals the total of likes in those blogs', () => {
    expect(listHelper.totalLikes(testData)).toBe(84)
  })

  test('when list is empty, equals zero', () => {
    expect(listHelper.totalLikes([])).toBe(0)
  })
})

describe('favorite blog', () => {
  test('when list has only one blog, equals that blog', () => {
    const result = listHelper.favoriteBlog([].concat(testData[0]))
    expect(result).toEqual(testData[0])
  })

  test('when list has many blogs, equals first blog with highest likes', () => {
    expect(listHelper.favoriteBlog(testData)).toEqual(testData[2])
  })

  test('when list is empty, equals null', () => {
    expect(listHelper.favoriteBlog([])).toEqual(null)
  })
})

describe('most blogs', () => {
  test('when list has only one blog, equals that blog', () => {
    const result = listHelper.mostBlogs([].concat(testData[0]))
    expect(result).toEqual({ author: 'Michael Chan', blogs: 1 })
  })

  test('when list has many blogs, equals first blog with highest likes', () => {
    expect(listHelper.mostBlogs(testData)).toEqual({ author: 'Robert C. Martin', blogs: 3 })
  })

  test('when list is empty, equals null', () => {
    expect(listHelper.mostBlogs([])).toEqual(null)
  })
})

describe('most likes', () => {
  test('when list has only one blog, equals that blog', () => {
    const result = listHelper.mostLikes([].concat(testData[0]))
    expect(result).toEqual({ author: 'Michael Chan', likes: 7 })
  })

  test('when list has many blogs, equals first blog with highest likes', () => {
    expect(listHelper.mostLikes(testData)).toEqual({ author: 'Test Author2', likes: 36 })
  })

  test('when list is empty, equals null', () => {
    expect(listHelper.mostLikes([])).toEqual(null)
  })
})