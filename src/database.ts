import postgres from 'postgres'

const sql = postgres('postgres://admin:123@localhost:5432/rinha', {
  host: '',
  port: 5432,
  database: '',
  username: '',
  password: ''
})

export default sql
