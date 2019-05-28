CREATE TRIGGER trig ON notes AFTER INSERT AS UPDATE notes SET notes.tagsCount=notes.tagsCount+1 
/*
CREATE TRIGGER trig ON notes 
AFTER INSERT 
AS 
UPDATE notes SET tagsCount=tagsCount+1 
*/
