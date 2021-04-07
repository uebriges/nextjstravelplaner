exports.up = async (sql) => {
  // Used table name 'users' instead of 'user' because 'user' didn't work (Syntax error at 'user')
  await sql`
	CREATE TABLE IF NOT EXISTS users (
		id int GENERATED ALWAYS AS IDENTITY,
		first_name varchar(40),
		last_name varchar(40),
		email text,
		home_coordinates varchar(50),
		currently_traveling boolean,
		user_name varchar(50),
		password_hash varchar(100),
		PRIMARY KEY(id));`;
};

exports.down = async (sql) => {
  await sql`DROP TABLE IF EXISTS users;`;
};
