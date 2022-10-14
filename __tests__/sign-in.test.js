const request = require('supertest');
const app = require('../app');
const { sequelize } = require('../models/index');
const { queryInterface } = sequelize;
const { hash } = require('../helpers/hash');
const { sign, verify } = require('../helpers/jwt');

const user = {
    username: 'luki',
    email: 'luki@mail.com',
    password: 'password',
    createdAt: new Date(),
    updatedAt: new Date()
};

beforeAll(async () => {
    await queryInterface.bulkDelete('Users', null, {
        truncate: true,
        restartIdentity: true,
        cascade: true
    });
    const hashedUser = { ...user };
    hashedUser.password = hash(hashedUser.password);
    await queryInterface.bulkInsert('Users', [hashedUser]);
});

afterAll(async () => {
    sequelize.close();
});

describe('POST /sign-in', () => {
    test('should return HTTP code 200 and JWT when sign in success', async () => {
        const { body } = await request(app)
            .post('/sign-in')
            .send({ email: user.email, password: user.password })
            .expect(200);
        expect(body).toEqual({ token: expect.any(String) });
        const claim = verify(body.token);
        expect(claim).toEqual({ id: 1, email: user.email, iat: expect.any(Number) });
    });
    test('should return HTTP code 401 when sign without email', async () => {
        const { body } = await request(app)
            .post('/sign-in')
            .send({ password: user.password })
            .expect(401);
        expect(body.message).toMatch(/wrong email\/password/i);
    });
    test('should return HTTP code 401 when sign with empty string email', async () => {
        const { body } = await request(app)
            .post('/sign-in')
            .send({ email: '', password: user.password })
            .expect(401);
        expect(body.message).toMatch(/wrong email\/password/i);
    });
    test('should return HTTP code 401 when sign with wrong email', async () => {
        const { body } = await request(app)
            .post('/sign-in')
            .send({ email: 'wrong@mail.com', password: user.password })
            .expect(401);
        expect(body.message).toMatch(/wrong email\/password/i);
    });

    test('should return HTTP code 401 when sign without password', async () => {
        const { body } = await request(app)
            .post('/sign-in')
            .send({ email: user.email })
            .expect(401);
        expect(body.message).toMatch(/wrong email\/password/i);
    });
    test('should return HTTP code 401 when sign with empty string password', async () => {
        const { body } = await request(app)
            .post('/sign-in')
            .send({ email: user.email , password: '' })
            .expect(401);
        expect(body.message).toMatch(/wrong email\/password/i);
    });
    test('should return HTTP code 401 when sign with wrong password', async () => {
        const { body } = await request(app)
            .post('/sign-in')
            .send({ email: user.email , password: 'wrongpassword' })
            .expect(401);
        expect(body.message).toMatch(/wrong email\/password/i);
    });
});