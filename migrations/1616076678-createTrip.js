exports.up = async (sql) => {
  await sql`
	CREATE TABLE IF NOT EXISTS trip (
		id int GENERATED ALWAYS AS IDENTITY,
		title varchar(50),
		start_date date,
		end_date date,
		notes varchar(50),
		session_id varchar(100),
		PRIMARY KEY(id));`;
};

exports.down = async (sql) => {
  await sql`DROP TABLE IF EXISTS trip;`;
};
