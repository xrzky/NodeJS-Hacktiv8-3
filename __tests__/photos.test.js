const request = require('supertest');
const app = require('../app');
const { sequelize } = require('../models/index');
const { queryInterface } = sequelize;
const { hash } = require('../helpers/hash');
const { sign } = require('../helpers/jwt');

const user = {
    username: 'luki',
    email: 'luki@mail.com',
    password: 'password',
    createdAt: new Date(),
    updatedAt: new Date()
};
const userToken = sign({ id: 1, email: user.email });
const userNotExistsToken = sign({ id: 99, email: 'notexists@gmail.com' });

const defaultPhoto = {
    title: 'Default Photo',
    caption: 'Default Photo caption',
    image_url: 'http://image.com/defaultphoto.png',
    createdAt: new Date(),
    updatedAt: new Date(),
    UserId: 1
};

const createPhoto = {
    title: 'Buat photo baru',
    image_url: 'http://image.com/createphoto.png'
}

beforeAll(async () => {
    await queryInterface.bulkDelete('Photos', null, {
        truncate: true,
        restartIdentity: true,
        cascade: true
    });
    await queryInterface.bulkDelete('Users', null, {
        truncate: true,
        restartIdentity: true,
        cascade: true
    });
    const hashedUser = { ...user };
    hashedUser.password = hash(hashedUser.password);
    await queryInterface.bulkInsert('Users', [hashedUser]);
    await queryInterface.bulkInsert('Photos', [defaultPhoto]);
});

afterAll(async () => {
    sequelize.close();
});

//GET ALL PHOTOS
describe('GET /photos', () => {
    test('should return HTTP status code 200', async () => {
        const { body } = await request(app)
            .get('/photos')
            .set('Authorization', `Bearer ${userToken}`)
            .expect(200);
        expect(body.length).toBe(1);
        expect(body[0]).toEqual({
            id: 1,
            title: defaultPhoto.title,
            caption: defaultPhoto.caption,
            image_url: defaultPhoto.image_url,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            UserId: 1
        });
    });
    test('should return HTTP status code 401 when no authorization', async () => {
        const { body } = await request(app)
            .get('/photos')
            .expect(401);
        expect(body.message).toMatch(/unauthorized/i);
    });
    test('should return HTTP status code 401 when no token provided', async () => {
        const { body } = await request(app)
            .get('/photos')
            .set('Authorization', 'Bearer ')
            .expect(401);
        expect(body.message).toMatch(/invalid token/i);
    });
    test('should return HTTP status code 401 when no token provided', async () => {
        const { body } = await request(app)
            .get('/photos')
            .set('Authorization', 'Bearer wrong.token.input')
            .expect(401);
        expect(body.message).toMatch(/invalid token/i);
    });
    test('should return HTTP status code 401 when user does not exist', async () => {
        const { body } = await request(app)
            .get('/photos')
            .set('Authorization', `Bearer ${userNotExistsToken}`)
            .expect(401);
        expect(body.message).toMatch(/unauthorized/i);
    });
});

// GET PHOTOS BY ID
describe('GET /photos/:id', () => {
    test('should return HTTP code 200 when find photo by id success', async () => {
        const { body } = await request(app)
            .get('/photos/1')
            .set('Authorization', `Bearer ${userToken}`)
            .expect(200)
        expect(body).toEqual({
            id: 1,
            title: defaultPhoto.title,
            caption: defaultPhoto.caption,
            image_url: defaultPhoto.image_url,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            User: expect.objectContaining({
                id: 1,
                username: user.username,
                email: user.email
            })
        });
    });
    test('should return HTTP status code 401 when no authorization', async () => {
        const { body } = await request(app)
            .get('/photos/1')
            .expect(401);
        expect(body.message).toMatch(/unauthorized/i);
    });
    test('should return HTTP status code 401 when no token provided', async () => {
        const { body } = await request(app)
            .get('/photos/1')
            .set('Authorization', 'Bearer ')
            .expect(401);
        expect(body.message).toMatch(/invalid token/i);
    });
    test('should return HTTP status code 401 when no token provided', async () => {
        const { body } = await request(app)
            .get('/photos/1')
            .set('Authorization', 'Bearer wrong.token.input')
            .expect(401);
        expect(body.message).toMatch(/invalid token/i);
    });
    test('should return HTTP status code 401 when user does not exist', async () => {
        const { body } = await request(app)
            .get('/photos/1')
            .set('Authorization', `Bearer ${userNotExistsToken}`)
            .expect(401);
        expect(body.message).toMatch(/unauthorized/i);
    });
    test('should return HTTP status code 404 when data not found', async () => {
        const { body } = await request(app)
            .get('/photos/99')
            .set('Authorization', `Bearer ${userToken}`)
            .expect(404);
        expect(body.message).toMatch(/data not found/i);
    });
});

// CREATE PHOTOS
describe('POST /photos', () => {
    test('should return HTTP code 200 when create photos success', async () => {
        const { body } = await request(app)
            .post('/photos')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                title: createPhoto.title,
                image_url: createPhoto.image_url
            })
            .expect(201);
        expect(body).toEqual({
            id: 2,
            title: createPhoto.title,
            caption: "BUAT PHOTO BARU http://image.com/createphoto.png",
            image_url: createPhoto.image_url,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            UserId: 1
        })
    });
    test('should return HTTP code 400 when create photos without title', async () => {
        const { body } = await request(app)
            .post('/photos')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ image_url: createPhoto.image_url })
            .expect(400);
        expect(body.message).toEqual(expect.arrayContaining(['Title cannot be omitted']));
    });
    test('should return HTTP code 400 when create photos with empty string username', async () => {
        const { body } = await request(app)
            .post('/photos')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ title: '', image_url: createPhoto.image_url })
            .expect(400);
        expect(body.message).toEqual(expect.arrayContaining(['Title cannot be an empty string']));
    });
    test('should return HTTP code 400 when create photos without image url', async () => {
        const { body } = await request(app)
            .post('/photos')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ title: createPhoto.title })
            .expect(400);
        expect(body.message).toEqual(expect.arrayContaining(['Image URL cannot be omitted']));
    });
    test('should return HTTP code 400 when create photos with empty string image url', async () => {
        const { body } = await request(app)
            .post('/photos')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ title: createPhoto.title, image_url: '' })
            .expect(400);
        expect(body.message).toEqual(expect.arrayContaining(['Image URL cannot be an empty string']));
    });
    test('should return HTTP code 400 when create photos with wrong image url', async () => {
        const { body } = await request(app)
            .post('/photos')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ title: createPhoto.title, image_url: 'wrongformatimage' })
            .expect(400);
        expect(body.message).toEqual(expect.arrayContaining(['Wrong URL format']));
    });
    test('should return HTTP status code 401 when no authorization', async () => {
        const { body } = await request(app)
            .post('/photos')
            .expect(401);
        expect(body.message).toMatch(/unauthorized/i);
    });
    test('should return HTTP status code 401 when no token provided', async () => {
        const { body } = await request(app)
            .post('/photos')
            .set('Authorization', 'Bearer ')
            .expect(401);
        expect(body.message).toMatch(/invalid token/i);
    });
    test('should return HTTP status code 401 when no token provided', async () => {
        const { body } = await request(app)
            .post('/photos')
            .set('Authorization', 'Bearer wrong.token.input')
            .expect(401);
        expect(body.message).toMatch(/invalid token/i);
    });
    test('should return HTTP status code 401 when user does not exist', async () => {
        const { body } = await request(app)
            .post('/photos')
            .set('Authorization', `Bearer ${userNotExistsToken}`)
            .expect(401);
        expect(body.message).toMatch(/unauthorized/i);
    });
});