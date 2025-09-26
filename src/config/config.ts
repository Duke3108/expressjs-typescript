export default {
  development: {
    username: "duke",
    password: "Khuutientuoc123",
    database: "expressts",
    host: "localhost",
    dialect: "postgres",
    logging: false,
    timezone: "+7:00",
  },
  production: {
    username: "duke",
    password: "Khuutientuoc123",
    database: "expressts",
    host: "localhost",
    dialect: "postgres",
    logging: false,
    timezone: "+7:00",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};
