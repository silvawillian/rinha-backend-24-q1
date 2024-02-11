// src/index.js
import express, { type Express, type Request, type Response } from 'express'
import dotenvFlow from 'dotenv-flow'

import clientes from './routes/clientes'

dotenvFlow.config()

const app: Express = express()
const port = process.env.PORT ?? 3000

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server')
})

app.use('/clientes', clientes)

const server = app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`)
})

export default server
