exports.up = function (knex, Promise) {
  return knex.raw('CREATE TRIGGER update_notes_count AFTER INSERT ON notes BEGIN UPDATE users SET notesCount=notesCount+1; END');
};

exports.down = function (knex, Promise) {
  return knex.raw('DROP TRIGGER IF EXISTS update_notes_count');
};
