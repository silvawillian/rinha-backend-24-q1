import postgres from 'postgres'

const sql = postgres('postgres://admin:123@db:5432/rinha', {
  host: 'localhost',
  port: 5432,
  database: 'rinha',
  username: 'admin',
  password: '123',
  idle_timeout: 20,
  max_lifetime: 15 * 20
})

export default sql
