exports.up = async (sql) => {
  await sql`
	CREATE TABLE IF NOT EXISTS friendship  (
		user_id int,
		friend_id int,
		active date,
		conversation_id int,
		PRIMARY KEY(friend_id, user_id),
		CONSTRAINT fk_user_id
			FOREIGN KEY (user_id)
				REFERENCES users(id))
		;`;
};

exports.down = async (sql) => {
  await sql`DROP TABLE IF EXISTS friendship;`;
};
