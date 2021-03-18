exports.up = async (sql) => {
  await sql`
	CREATE TABLE IF NOT EXISTS location  (
		id int,
		trip_id int,
		notes varchar(50),
		means_of_transport varchar(50),
		visa_information text,
		favorite boolean,
		coordinates varchar(50),
		PRIMARY KEY(id),
		CONSTRAINT fk_trip_id
			FOREIGN KEY (trip_id)
				REFERENCES trip(id))
		;`;
};

exports.down = async (sql) => {
  await sql`DROP TABLE IF EXISTS location;`;
};
