'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const timeNow = new Date();
    await queryInterface.bulkInsert('Photos', [
      {
        title: 'Photo 1',
        caption: 'Photo 1 caption',
        image_url: 'http://image.com/photo1.png',
        createdAt: timeNow,
        updatedAt: timeNow,
        UserId: 1
      },
      {
        title: 'Photo 2',
        caption: 'Photo 2 caption',
        image_url: 'http://image.com/photo2.png',
        createdAt: timeNow,
        updatedAt: timeNow,
        UserId: 1
      },
      {
        title: 'Photo 3',
        caption: 'Photo 3 caption',
        image_url: 'http://image.com/photo3.png',
        createdAt: timeNow,
        updatedAt: timeNow,
        UserId: 1
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Photos', null, {});
  }
};
