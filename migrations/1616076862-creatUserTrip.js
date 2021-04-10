exports.up = async (sql) => {
  await sql`
	CREATE TABLE IF NOT EXISTS user_trip  (
		trip_id int,
		user_id int,
		PRIMARY KEY(trip_id, user_id),
		CONSTRAINT fk_trip_id
			FOREIGN KEY (trip_id)
				REFERENCES trip(id),
		CONSTRAINT fk_user_id
			FOREIGN KEY (user_id)
				REFERENCES users(id))
		;`;
};

exports.down = async (sql) => {
  await sql`DROP TABLE IF EXISTS user_trip;`;
};
