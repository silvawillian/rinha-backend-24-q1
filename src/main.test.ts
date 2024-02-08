import request from 'supertest'
import app from './main'

describe('GET /', () => {
  it('should return status 200 and the correct response', async () => {
    const response = await request(app).get('/')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ message: 'Example response' })
  })
})
