
exports.up = function (knex, Promise) {
  return knex.schema
    .createTable('users', table => {
      table.increments('id');
      table.string('userName');
      table.string('password');
      table.string('familyName');
      table.string('name');
      table.string('patronymic');
      table.date('birthday');
      table.string('email');
      table.string('mobileNumber');
      table.integer('notesCount');
    })
    .createTable('notes', table => {
      table.increments('id');
      table.integer('userId');
      table.foreign('userId').references('users.id');
      table.string('noteName');
      table.text('noteText');
      table.integer('likesCount');
      table.integer('tagsCount');
    })
    .createTable('tags', table => {
      table.string('tagText');
      table.integer('noteId');
      table.foreign('noteId').references('notes.id');
      table.string('userId');
      table.foreign('userId').references('users.id');
    })
    .createTable('likes', table => {
      table.integer('noteId');
      table.foreign('noteId').references('notes.id');
      table.string('userId');
      table.foreign('userId').references('users.id');
    })
};

exports.down = function (knex, Promise) {
  return knex.schema
    .dropTable('users')
    .dropTable('notes')
    .dropTable('tags')
    .dropTable('likes');
};
