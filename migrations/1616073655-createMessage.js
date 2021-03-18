exports.up = async (sql) => {
  await sql`
	CREATE TABLE IF NOT EXISTS message (
		id int GENERATED ALWAYS AS IDENTITY,
		message text,
		PRIMARY KEY(id));`;
};

exports.down = async (sql) => {
  await sql`DROP TABLE IF EXISTS message;`;
};
