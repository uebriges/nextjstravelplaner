exports.up = async (sql) => {
  await sql`
	CREATE TABLE IF NOT EXISTS trip_waypoint  (
		trip_id int,
		waypoint_id int,
		notes text,
		means_of_transport varchar(50),
		visa_information text,
		order_number int,
		UNIQUE (trip_id, waypoint_id),
		CONSTRAINT fk_trip_id
			FOREIGN KEY (trip_id)
				REFERENCES trip(id),
		CONSTRAINT fk_waypoint_id
			FOREIGN KEY (waypoint_id)
				REFERENCES waypoint(id)
		)
		;`;
};

exports.down = async (sql) => {
  await sql`DROP TABLE IF EXISTS trip_waypoint;`;
};
