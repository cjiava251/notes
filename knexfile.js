module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './db/users_db.sqlite3'
    }
  },
  production: {
    client: 'sqlite3',
    connection: process.env.DATABASE_URL,
    migrations: {
      tableName: 'knex_migrations'
    }
  },
  useNullAsDefault: true
};
