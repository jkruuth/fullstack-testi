require('dotenv').config()
const { request, response } = require('express')
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const Note = require('./models/note')

const app = express()

app.use(express.static('build'))
app.use(express.json())
app.use(cors())

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

app.use(requestLogger)

/* let notes = [
    {
      id: 1,
      content: "HTML is easy",
      date: "2020-01-10T17:30:31.098Z",
      important: true
    },
    {
      id: 2,
      content: "Browser can execute only Javascript",
      date: "2020-01-10T18:39:34.091Z",
      important: false
    },
    {
      id: 3,
      content: "GET and POST are the most important methods of HTTP protocol",
      date: "2020-01-10T19:20:14.298Z",
      important: true
    }
  ] */

  app.get('/api/notes', (request, response) => {
    Note.find({}).then(notes => {
      response.json(notes)
    })
  })

  app.get('/', (req, res) => {
    res.send('<h1>Hello World!</h1>')
  })
  
  /* app.get('/api/notes', (req, res) => {
    res.json(notes)
  }) */
  
  app.get('/api/notes/:id', (request, response, next) => {
      Note.findById(request.params.id).then(note => {
        if (note) {
          response.json(note)
        } else {
          response.status(404).end()
        }
      })
      .catch(error => next(error))
  })

  app.delete('/api/notes/:id', (request, response, next) => {
      Note.findByIdAndRemove(request.params.id).then(result => {
        response.status(204).end()
      })
      .catch(error => next(error))
  })

  const generateId = () => {
      const maxId = notes.length > 0
      ? Math.max(...notes.map(n => n.id))
      : 0
    return maxId + 1
  }

  app.post('/api/notes', (request, response) => {
    const body = request.body
  
    if (body.content === undefined) {
      return response.status(400).json({ error: 'content missing' })
    }
  
    const note = new Note({
      content: body.content,
      important: body.important || false,
      date: new Date(),
    })
  
    note.save().then(savedNote => {
      response.json(savedNote)
    })
  })

  app.put('/api/notes/:id', (request, response, next) => {
    const body = request.body

    const note = {
      content: body.content,
      important: body.important,
    }

    Note.findByIdAndUpdate(request.params.id, note, { new: true })
      .then(updatedNote => {
        response.json(updatedNote)
      })
      .catch(error => next(error))
  })

  const unknownEndpoint = (request, response) => {
    response.status.send({ error: 'Unknown endpoint' })
  }

  // olemattomien osoitteiden käsittely
  app.use(unknownEndpoint)


  // virheellisten pyyntöjen käsittely
  const errorHandler = (error, request, response, next) => {
    console.log(error.message)

    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id '})
    }

    next(error)
  }

  app.use(errorHandler)

  const PORT = process.env.PORT
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })