/** @jsxImportSource @emotion/react */
import { useMutation, useQuery } from '@apollo/client';
import {
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import { useEffect, useState } from 'react';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
  resetServerContext,
} from 'react-beautiful-dnd';
import { CoordinatesType } from '../../pages/travelplaner';
import {
  deleteWaypoint,
  getCurrentWaypoints,
  updateWaypoints,
} from '../../utils/graphqlQueries';

type WaypointsListType = {
  generateTurnByTurnRoute: () => void;
  sessionToken: string;
};

export default function WaypointsList(props: WaypointsListType) {
  // Retrieve current waypoints from DB
  const waypointsFromDB = useQuery(getCurrentWaypoints, {
    variables: { token: props.sessionToken },
  });

  // Delete waypoint from DB
  const [deleteWaypointFunction] = useMutation(deleteWaypoint);

  // Update waypoints in DB
  const [updateWaypointsFunction] = useMutation(updateWaypoints, {
    refetchQueries: [
      {
        query: getCurrentWaypoints,
        variables: { token: props.sessionToken },
      },
    ],
    awaitRefetchQueries: true,
  });

  // Store the moved waypoint and it's updated long/lat and waypoint name
  const [waypoints, setWaypoints] = useState(
    waypointsFromDB.data ? waypointsFromDB.data.waypoints : null,
  );

  useEffect(() => {
    if (waypointsFromDB.data && waypointsFromDB.data.waypoints !== null) {
      const waypointsArray: CoordinatesType[] | undefined = Array.from(
        waypointsFromDB.data.waypoints,
      );
      waypointsArray.sort((a, b) => {
        return (a.orderNumber as number) - (b.orderNumber as number);
      });
      setWaypoints(waypointsArray);
      props.generateTurnByTurnRoute();
    }
  }, [waypointsFromDB.data]);

  resetServerContext();

  async function onDragEnd(result: DropResult) {
    const { destination, source } = result;
    const pointsTemp = [...waypointsFromDB.data.waypoints];

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    const pointToBeMoved = pointsTemp.splice(source.index, 1);
    pointsTemp.splice(destination.index, 0, pointToBeMoved[0]);

    // Update the order numbers
    const newlyOrderedPoints = pointsTemp.map((point, index) => {
      point = { ...point, orderNumber: index + 1 };
      return point;
    });

    await updateWaypointsFunction({
      variables: {
        waypoints: newlyOrderedPoints,
      },
    });

    waypointsFromDB.refetch();
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="1">
        {/* provided is served by Droppable */}
        {(provided) => {
          return (
            <div>
              <List
                dense={false}
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {waypoints
                  ? waypoints.map(
                    (waypoint: CoordinatesType, index: number) => {
                      return (
                        <Draggable
                          key={
                            'Draggable' +
                            waypoint.latitude +
                            waypoint.longitude +
                            waypoint.id
                          }
                          draggableId={
                            'Id' + waypoint.latitude + waypoint.longitude
                          }
                          index={index}
                        >
                          {(providedDraggable) => {
                            return (
                              <ListItem
                                key={
                                  waypoint.longitude
                                    ? waypoints.longitude
                                    : 0 +
                                    (waypoint.latitude
                                      ? waypoint.latitude
                                      : 0)
                                }
                                {...providedDraggable.draggableProps}
                                {...providedDraggable.dragHandleProps}
                                ref={providedDraggable.innerRef}
                              >
                                <ListItemIcon>
                                  <MenuIcon />
                                </ListItemIcon>
                                <ListItemText
                                  primary={waypoint.waypointName}
                                />
                                <ListItemSecondaryAction>
                                  <IconButton
                                    key={
                                      'IconButton' +
                                      waypoint.longitude +
                                      waypoint.latitude
                                    }
                                    edge="end"
                                    aria-label="delete"
                                    onClick={async () => {
                                      const route = Array.from(
                                        waypointsFromDB.data.waypoints,
                                      );
                                      route.splice(index, 1);
                                      await deleteWaypointFunction({
                                        variables: {
                                          waypointId: waypoint.id,
                                        },
                                      });
                                      setWaypoints(route);
                                      props.generateTurnByTurnRoute();
                                      waypointsFromDB.refetch();
                                    }}
                                    size="large">
                                    <CloseIcon />
                                  </IconButton>
                                </ListItemSecondaryAction>
                              </ListItem>
                            );
                          }}
                        </Draggable>
                      );
                    },
                  )
                  : null}
              </List>
            </div>
          );
        }}
      </Droppable>
    </DragDropContext>
  );
}
