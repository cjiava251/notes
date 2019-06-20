exports.up=function(knex,Promise) {
  return knex.raw('CREATE TRIGGER update_tags_count AFTER INSERT ON tags BEGIN UPDATE notes SET tagsCount=tagsCount+1; END');
};

exports.down = function (knex, Promise) {
  return knex.raw('DROP TRIGGER IF EXISTS update_tags_count');
};
