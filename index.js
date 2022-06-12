const express = require('express')
const app = express()

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523"
    
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345"
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122"
  }
]

app.use(express.json())

app.get('/', (req, res) => {
  res.send('<h1>This is my phonebook</h1>')
})

app.get('/info', (req, res) => {
  let date = new Date()
  let info = `<p>Phonebook has info for ${persons.length} people</p>
  <p>${date}</p>`
  res.send(info)
})

app.get('/api/persons', (req, res) => {
  res.json(persons)
})

app.get('/api/persons/:id', (req,res) => {
  const id = Number(req.params.id)
  console.log('id', id)
  const person = persons.find( person => {
    console.log(person.id, typeof person.id, id, typeof id, person.id === id)
    return person.id === id
  })
  console.log('person:', person)

  if (person) {
    res.json(person)
  } else {
    res.status(404).end()
  }
})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  console.log('delete person with id', id)
  persons = persons.filter(person => person.id !== id)
  console.log('new persons', persons)
  res.status(204).end()
})

app.post('/api/persons', (req, res) => {
  const body = req.body
  console.log('body', body)

  if(!body.number) {
    return res.status(400).json({error: 'number is missing'})
  }
  if(!body.name) {
    return res.status(400).json({error: 'name is missing'})
  }

  if (persons.filter(person => person.name === body.name).length > 0) {
    return res.status(400).json({error: 'name is already in phonebook, name must be unique'})
  }

  const getRandomNumber = (min, max) => {
    return Math.floor(Math.random() *(max - min) + min)
  }
  const person = {
    name: body.name,
    number: body.number,
    id: getRandomNumber(2, 999999)
  }

  persons = persons.concat(person)

  res.json(person)
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})