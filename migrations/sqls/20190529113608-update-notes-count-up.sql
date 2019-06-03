CREATE TRIGGER Update_Notes_Count ON notes AFTER INSERT AS UPDATE users SET notesCount=notesCount+1;
/* Replace with your SQL commands */
