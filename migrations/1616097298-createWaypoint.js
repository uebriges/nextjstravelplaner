exports.up = async (sql) => {
  await sql`
	CREATE TABLE IF NOT EXISTS waypoint  (
		id int GENERATED ALWAYS AS IDENTITY,
		waypoint_name varchar(100),
		longitude varchar(50),
		latitude varchar(50),
		UNIQUE (longitude, latitude),
		PRIMARY KEY(id)
		)
		;`;
};

exports.down = async (sql) => {
  await sql`DROP TABLE IF EXISTS waypoint;`;
};
