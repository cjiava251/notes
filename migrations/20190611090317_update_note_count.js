const { onUpdateNotesCountTrigger } =require('../knexfile');
exports.up = function(knex) {
  knex.raw(onUpdateNotesCountTrigger());
};
exports.down = function(knex) {

};
