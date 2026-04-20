"use strict";

const bcrypt = require("bcryptjs");

module.exports = {
  async up(queryInterface) {
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);

    await queryInterface.bulkInsert(
      "Users",
      [
        {
          name: "Admin",
          email: "admin@pdr.com",
          password: hashedPassword,
          role: "admin",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {},
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("Users", { email: "admin@pdr.com" }, {});
  },
};
