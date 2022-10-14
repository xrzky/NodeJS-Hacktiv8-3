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

const userTest = {
    username: 'rizki',
    email: 'rizki@mail.com',
    password: 'password'
}

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

describe('POST /sign-up', () => {
    test('should return HTTP code 201 when sign up success', async () => {
        const { body } = await request(app)
            .post('/sign-up')
            .send({ username: userTest.username, email: userTest.email, password: userTest.password })
            .expect(201);
        expect(body).toEqual({ id: 2, email: userTest.email });
    });
    test('should return HTTP code 400 when sign up without username', async () => {
        const { body } = await request(app)
            .post('/sign-up')
            .send({ email: userTest.email, password: user.password })
            .expect(400);
        expect(body.message).toEqual(expect.arrayContaining(['Username cannot be omitted']));
    });
    test('should return HTTP code 400 when sign up with empty string username', async () => {
        const { body } = await request(app)
            .post('/sign-up')
            .send({ username: '', email: userTest.email, password: user.password })
            .expect(400);
        expect(body.message).toEqual(expect.arrayContaining(['Username cannot be an empty string']));
    });
    test('should return HTTP code 400 when sign up without email', async () => {
        const { body } = await request(app)
            .post('/sign-up')
            .send({ username: userTest.username, password: user.password })
            .expect(400);
        expect(body.message).toEqual(expect.arrayContaining(['Email cannot be omitted']));
    });
    test('should return HTTP code 400 when sign up with empty string email', async () => {
        const { body } = await request(app)
            .post('/sign-up')
            .send({ username: userTest.username, email: '', password: user.password })
            .expect(400);
        expect(body.message).toEqual(expect.arrayContaining(['Email cannot be an empty string']));
    });
    test('should return HTTP code 400 when sign up with wrong email', async () => {
        const { body } = await request(app)
            .post('/sign-up')
            .send({ username: userTest.username, email: 'wrongformatemail', password: user.password })
            .expect(400);
        expect(body.message).toEqual(expect.arrayContaining(['Wrong email format']));
    });
    test('should return HTTP code 400 when sign up with already existed email', async () => {
        const { body } = await request(app)
            .post('/sign-up')
            .send({ username: userTest.username, email: user.email, password: user.password })
            .expect(400);
        expect(body.message).toMatch(/bad request/i);
    });
    test('should return HTTP code 400 when sign up without password', async () => {
        const { body } = await request(app)
            .post('/sign-up')
            .send({ username: userTest.username, email: userTest.email })
            .expect(400);
        expect(body.message).toEqual(expect.arrayContaining(['Password cannot be omitted']));
    });
    test('should return HTTP code 400 when sign up with empty string password', async () => {
        const { body } = await request(app)
            .post('/sign-up')
            .send({ username: userTest.username, email: userTest.email, password: '' })
            .expect(400);
        expect(body.message).toEqual(expect.arrayContaining(['Password cannot be an empty string']));
    });
});