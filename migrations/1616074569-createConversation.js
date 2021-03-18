exports.up = async (sql) => {
  await sql`
	CREATE TABLE IF NOT EXISTS conversation (
		id int GENERATED ALWAYS AS IDENTITY,
		message_id int,
		PRIMARY KEY(id),
		CONSTRAINT fk_message_id
			FOREIGN KEY (id)
				REFERENCES message(id));`;
};

exports.down = async (sql) => {
  await sql`DROP TABLE IF EXISTS conversation;`;
};
