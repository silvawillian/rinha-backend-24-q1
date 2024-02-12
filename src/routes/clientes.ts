/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'

import db from '../database'
const router = express.Router()

interface Cliente {
  id: number
  nome: string
  limite: number
  saldo: number
}

interface Transacao {
  id: number
  tipo: 'c' | 'd'
  descricao: string
  valor: number
  cliente_id: Cliente['id']
  realizada_em: Date
}

router.get('/:id/extrato', async (req, res) => {
  const { id } = req.params

  const clienteQuery = db<Cliente[]>`
    SELECT * FROM clientes c WHERE c.id = ${id}
  `

  const transacoesQuery = db<Transacao[]>`
    SELECT * FROM transacoes t WHERE t.cliente_id = ${id}
  `

  const [[cliente], transacoes] = await Promise.all([
    clienteQuery,
    transacoesQuery
  ])

  if (cliente === undefined) {
    return res.status(404).send({ msg: `cliente ${id} nao encontrado!` })
  }

  console.log(transacoes)

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

router.post('/:id/transacoes', async (req, res) => {
  const { body } = req
  const { id } = req.params

  const [cliente] = await db<Cliente[]>`
    SELECT * FROM clientes c WHERE c.id = ${id}
  `

  if (cliente === undefined) {
    return res.status(404).send({ msg: `cliente ${id} nao encontrado!` })
  }

  const transacao = {
    cliente_id: id,
    tipo: body.tipo,
    descricao: body.descricao,
    realizada_em: new Date(),
    valor: body.valor
  }

  let novoSaldo = 0

  if (body.tipo === 'c') {
    novoSaldo = cliente.saldo + body.valor
    await db`UPDATE clientes SET saldo = ${novoSaldo} WHERE id = ${id}`
  }

  if (body.tipo === 'd') {
    novoSaldo = cliente.saldo - body.valor
    console.log(novoSaldo)
    if (novoSaldo + cliente.limite < 0) {
      return res
        .status(422)
        .send({ msg: 'Operação não permitida, saldo insuficiente...' })
    }
  }

  await db`INSERT INTO transacoes (cliente_id, tipo, descricao, realizada_em, valor) VALUES (${transacao.cliente_id}, ${transacao.tipo}, ${transacao.descricao}, ${transacao.realizada_em}, ${transacao.valor})`
  await db`UPDATE clientes SET saldo = ${novoSaldo} WHERE id = ${id}`

  return res.status(200).send({
    limite: cliente.limite,
    saldo: novoSaldo
  })
})

export default router
