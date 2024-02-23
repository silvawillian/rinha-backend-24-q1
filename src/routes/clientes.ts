/* eslint-disable @typescript-eslint/strict-boolean-expressions */
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

  const [cliente] = await db<Cliente[]>`
    SELECT * FROM clientes c WHERE c.id = ${id};
  `

  if (cliente === undefined) {
    return res.status(404).send({ msg: `cliente ${id} nao encontrado!` })
  }

  const transacoes = await db<Transacao[]>`
    SELECT * FROM transacoes t WHERE t.cliente_id = ${id} ORDER BY id DESC LIMIT 10;
  `

  return res.status(200).send({
    saldo: {
      total: cliente.saldo,
      data_extrato: new Date().toISOString(),
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

let validationNumber = 0
/* 
router.post('/:id/transacoes', async (req, res) => {
  const { body } = req
  const { id } = req.params

  validationNumber++

  console.log({
    validationNumber,
    body
  })

  const transacao = {
    cliente_id: id,
    tipo: body.tipo,
    descricao: body.descricao,
    realizada_em: new Date().toISOString(),
    valor: body.valor
  }

  if (
    transacao.descricao === null ||
    transacao.descricao.trim() === '' ||
    transacao.descricao.length > 10 ||
    !Number.isInteger(transacao.valor) ||
    (transacao.tipo !== 'c' && transacao.tipo !== 'd')
  ) {
    return res.status(422).send({})
  }

  const [cliente] = await db<Cliente[]>`
    SELECT * FROM clientes c WHERE c.id = ${id}
  `

  if (cliente === undefined) {
    return res.status(404).send({ msg: `cliente ${id} nao encontrado!` })
  }

  const novoSaldo = transacao.tipo === 'd' ? -transacao.valor : transacao.valor
  const updatedUserAccount = {
    limite: cliente.limite,
    saldo: cliente.saldo + novoSaldo
  }

  if (
    updatedUserAccount.saldo < -updatedUserAccount.limite ||
    novoSaldo % 1 !== 0
  ) {
    return res
      .status(422)
      .send({ msg: 'Operação não permitida, saldo insuficiente...' })
  }

  const updatedCliente = await db.begin(async (db) => {
    await db`
      INSERT INTO transacoes (cliente_id, tipo, descricao, realizada_em, valor) VALUES (${transacao.cliente_id}, ${transacao.tipo}, ${transacao.descricao}, ${transacao.realizada_em}, ${transacao.valor}) RETURNING *;
    `
    const [cliente] = await db`
      UPDATE clientes SET saldo = ${novoSaldo} WHERE id = ${id} RETURNING limite, saldo;
    `

    return cliente
  })

  console.log({
    validationNumber,
    id,
    updatedUserAccount
  })

  return res.status(200).send(updatedUserAccount)
})
 */

router.post('/:id/transacoes', async (req, res) => {
  const { body } = req
  const { id } = req.params

  if (!['d', 'c'].includes(body.tipo as string)) {
    return res.status(422).send({})
  }

  if (!body.descricao || body.descricao.length > 10) {
    return res.status(422).send({})
  }

  const [cliente] = await db<Cliente[]>`
    SELECT * FROM clientes c WHERE c.id = ${id}
  `

  if (!cliente) {
    return res.status(404).send({ msg: `cliente ${id} nao encontrado!` })
  }

  const valor = body.tipo === 'd' ? -body.valor : body.valor

  const updatedCliente = {
    limite: cliente.limite,
    saldo: cliente.saldo + valor
  }

  if (updatedCliente.saldo < -updatedCliente.limite || valor % 1 !== 0) {
    return res.status(422).send({})
  }

  await db.begin(async (db) => {
    await db`
      INSERT INTO transacoes (cliente_id, valor, tipo, descricao, realizada_em)
      VALUES (${id}, ${body.valor}, ${body.tipo}, ${
      body.descricao ?? ''
    }, ${new Date().toISOString()})
    `

    await db`
      UPDATE clientes SET saldo = ${updatedCliente.saldo} WHERE id = ${id}
    `
  })

  return res.status(200).send(updatedCliente)
})
export default router
