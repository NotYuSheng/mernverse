const request = require('supertest');
const express = require('express');

const app = express();
app.get('/', (req, res) => {
  res.status(200).send('MERNverse backend is running');
});

describe('GET /', () => {
  it('should return backend status', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toBe('MERNverse backend is running');
  });
});
