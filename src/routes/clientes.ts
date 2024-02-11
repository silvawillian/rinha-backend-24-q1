/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'

import db from '../database'
const router = express.Router()

router.get('/:id/extrato', async (req, res) => {
  const { id } = req.params

  const clienteQuery = db`
    SELECT * FROM clientes c WHERE c.id = ${id}
  `

  const transacoesQuery = db`
    SELECT * FROM transacoes t WHERE t.id = ${id}
  `

  const [[cliente], transacoes] = await Promise.all([
    clienteQuery,
    transacoesQuery
  ])

  console.log(cliente)
  console.log(transacoes)

  if (cliente.length === 0) return res.status(404).send({})

  console.log(cliente)

  return res.status(200).send({
    saldo: {
      total: cliente.saldo,
      data_extrato: new Date(),
      limite: cliente.limite
    },
    ultimas_transacoes: transacoes.map((t) => ({
      valor: t.valor,
      tipo: t.tipo,
      descricao: t.descricao,
      realizada_em: t.realizada_em
    }))
  })
})

router.post('/:id/transacoes', (req, res) => {
  console.log(req.params.id)

  res.status(200).send({
    limite: 10000,
    saldo: -9098
  })
})

export default router
