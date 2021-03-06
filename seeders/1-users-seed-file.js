const bcrypt = require('bcryptjs');
const faker = require('faker');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const users = [{
      id          : 1,
      email       : 'root@example.com',
      password    : bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
      account     : 'root1',
      name        : faker.name.findName(),
      avatar      : `https://loremflickr.com/300/300/portrait/?lock=${Math.random() * 100}`,
      introduction: faker.lorem.word(160),
      cover       : `https://loremflickr.com/600/300/cover/?lock=${Math.random() * 100}`,
      role        : 'admin',
      createdAt   : new Date(),
      updatedAt   : new Date(),
    }];
    [11, 21, 31, 41, 51].forEach((e) => {
      users.push({
        id          : e,
        email       : `user${e}@example.com`,
        password    : bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
        account     : `user${e}`,
        name        : faker.name.findName(),
        avatar      : `https://loremflickr.com/300/300/portrait/?lock=${Math.random() * 100}`,
        introduction: faker.lorem.word(160),
        cover       : `https://loremflickr.com/600/300/cover/?lock=${Math.random() * 100}`,
        role        : 'user',
        createdAt   : new Date(),
        updatedAt   : new Date(),
      });
    });
    await queryInterface.bulkInsert('Users', users, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {});
  },
};
