// Update with your config settings.

module.exports = {

  development: {
    client: 'sqlite3',
    connection: {
      filename: './db/users_db.sqlite3'
    }
  },
  /*
    staging: {
      client: 'postgresql',
      connection: {
        database: 'my_db',
        user:     'username',
        password: 'password'
      },
      pool: {
        min: 2,
        max: 10
      },
      migrations: {
        tableName: 'knex_migrations'
      }
    },
  */
  production: {
    client: 'sqlite3',
    connection: process.env.DATABASE_URL,
    migrations: {
      tableName: 'knex_migrations'
    }
  }
  ,
  onUpdateNotesCountTrigger: () => 'CREATE TRIGGER update_notes_count AFTER INSERT ON notes UPDATE users SET notesCount=notesCount+1',
  onUpdateTagsCountTrigger: () => 'CREATE TRIGGER update_tags_count AFTER INSERT ON notes UPDATE notes SET tagsCount=tagsCount+1'
};
