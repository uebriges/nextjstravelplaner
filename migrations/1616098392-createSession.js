exports.up = async (sql) => {
  await sql`
	CREATE TABLE IF NOT EXISTS session  (
		id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    token VARCHAR(100),
		expiry_timestamp TIMESTAMP NOT NULL DEFAULT NOW() + INTERVAL '24 hours',
		user_id INTEGER REFERENCES users (id) ON DELETE CASCADE
		);`;
};

exports.down = async (sql) => {
  await sql`DROP TABLE IF EXISTS session;`;
};
