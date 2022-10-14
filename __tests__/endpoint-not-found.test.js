const request = require('supertest');
const app = require('../app');

test('wrong endpoint test', async () => {
    const { body } = await request(app)
        .get('/wrongendpoint')
        .expect(404);
    expect(body).toEqual({ message: 'Oops... nothing here' });
});