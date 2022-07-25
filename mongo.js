/**
 * Display all of the entries in the phonebook in MongoDB
 * command: node mongo.js <yourpassword>
 * Save new entry to the phonebook in the database
 * command: node mongo.js <yourpassword> Anna 040-1234556
 * OR (whitespace characters must be enclosed in quotes)
 * command: node mongo.js <yourpassword> "Ada Lovelace" 040-1231236
 */

const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://tk-fullstack:${password}@cluster0.nipkw.mongodb.net/?retryWrites=true&w=majority`

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3) {
  console.log('Display all of the entries in the phonebook:')
  Person.find({}).then(result => {
    result.forEach(person => {
      console.log(person.name, person.number)
    })
    mongoose.connection.close()
  })
}

if (process.argv.length === 5) {
  const person = new Person({
    name: process.argv[3],
    number: process.argv[4]
  })
  person.save().then(() => {
    console.log(`added ${process.argv[3]} number ${process.argv[4]} to phonebook`)
    mongoose.connection.close()
  })
}
