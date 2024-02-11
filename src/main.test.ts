import request from 'supertest'
import server from './main'

describe('GET /', () => {
  afterAll(async () => {
    // Do something after all tests, e.g., stop the server
    server.close()
  })

  it('should return status 200 and the correct response', async () => {
    const response = await request(server).get('/')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ message: 'Example response' })
  })
})
