exports.up = async (sql) => {
  await sql`
	CREATE TABLE IF NOT EXISTS user_waypoint_favorite  (
		user_id int,
		waypoint_id int,
		UNIQUE (user_id, waypoint_id),
		CONSTRAINT fk_user_id
			FOREIGN KEY (user_id)
				REFERENCES users(id),
		CONSTRAINT fk_waypoint_id
			FOREIGN KEY (waypoint_id)
				REFERENCES waypoint(id)
		)
		;`;
};

exports.down = async (sql) => {
  await sql`DROP TABLE IF EXISTS user_waypoint_favorite;`;
};
