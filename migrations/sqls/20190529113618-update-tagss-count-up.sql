CREATE TRIGGER Update_Tags_Count ON users AFTER INSERT AS UPDATE notes SET tagsCount=tagsCount+1;
/* Replace with your SQL commands */
