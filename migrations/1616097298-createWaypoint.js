exports.up = async (sql) => {
  await sql`
	CREATE TABLE IF NOT EXISTS waypoint  (
		id int GENERATED ALWAYS AS IDENTITY,
		trip_id int,
		waypoint_name varchar(100),
		notes varchar(50),
		means_of_transport varchar(50),
		visa_information text,
		favorite boolean,
		coordinates varchar(50),
		order_number int,
		UNIQUE (trip_id, coordinates),
		PRIMARY KEY(id),
		CONSTRAINT fk_trip_id
			FOREIGN KEY (trip_id)
				REFERENCES trip(id))
		;`;
};

exports.down = async (sql) => {
  await sql`DROP TABLE IF EXISTS waypoint;`;
};
