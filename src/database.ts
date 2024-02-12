import postgres from 'postgres'

const sql = postgres('postgres://admin:123@db:5432/rinha', {
  host: 'db',
  port: 5432,
  database: 'rinha',
  username: 'admin',
  password: '123'
})

export default sql
