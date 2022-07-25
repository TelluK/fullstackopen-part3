require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')

// morgan is HTTP request logger middleware for node.js
const morgan = require('morgan')

const Person = require('./models/person')

app.use(express.json())

// tiny is minimal output -> :method :url :status :res[content-length] - :response-time ms
// app.use(morgan('tiny'))

// create new token for morgan to use
morgan.token('body', (req) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.use(cors())

// express will first check if the build directory contains a file corresponding to the request's address
app.use(express.static('build'))

app.get('/', (req, res) => {
  res.send('<h1>This is my phonebook</h1>')
})

app.get('/info', (req, res, next) => {
  let date = new Date()
  Person.find({}).then(persons =>  {
    let info = `<p>Phonebook has info for ${persons.length} people</p>
    <p>${date}</p>`
    res.send(info)
  })
    .catch(error => next(error))
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then(people => res.json(people))
})

app.get('/api/persons/:id', (req, res, next) => {
  // console.log(req.body)
  // console.log('id', req.params.id)

  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person)
      } else {
        res.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  // console.log('delete person with id', req.params.id)
  Person.findByIdAndRemove(req.params.id)
    .then( () => {
      res.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
  const body = req.body
  // console.log('body', body)

  if(body.number === undefined) {
    return res.status(400).json({ error: 'number is missing' })
  }
  if(body.name === undefined) {
    return res.status(400).json({ error: 'name is missing' })
  }

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save()
    .then(savedPerson => {
      res.json(savedPerson)
      console.log(`added ${body.name} number ${body.number} to phonebook`)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body
  // console.log("req.body", body)

  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then(updatedPerson => {
      // console.log('updatedPerson:', updatedPerson)
      if (updatedPerson) {
        res.json(updatedPerson)
      } else {
        res.status(404).end()
      }
    })
    .catch(error => {
      console.log('error:', error)
      next(error)
    })
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
  console.log('in errorHandler, error.name: ', error.name)
  console.error(error.message)

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  }
  if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }

  next(error)
}

// this has to be the last loaded middleware
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})