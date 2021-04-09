/** @jsxImportSource @emotion/react */
import { useMutation, useQuery } from '@apollo/client';
import {
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import MenuIcon from '@material-ui/icons/Menu';
import { useEffect, useState } from 'react';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
  resetServerContext,
} from 'react-beautiful-dnd';
import { CoordinatesType } from '../../pages/travelplaner';
import { routeListStyle } from '../../styles/styles';
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
    console.log('waypointsFromDB.data: ', waypointsFromDB.data);
    if (waypointsFromDB.data && waypointsFromDB.data.waypoints !== null) {
      const waypointsArray: CoordinatesType[] | undefined = Array.from(
        waypointsFromDB.data.waypoints,
      );
      console.log('waypointsArray: ', waypointsArray);
      waypointsArray.sort((a, b) => {
        return (a.orderNumber as number) - (b.orderNumber as number);
      });
      setWaypoints(waypointsArray);
      props.generateTurnByTurnRoute();
    }
  }, [waypointsFromDB.data]);

  // function refetchWaypoints() {
  //   console.log('refetching...');
  //   waypointsFromDB.refetch();
  // }

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

    console.log('updatedWaypoints in drag end: ', waypointsFromDB.data); // wrong values
    console.log('state waypoints: ', waypoints); // wrong value
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="1">
        {/* provided is served by Droppable */}
        {(provided) => {
          return (
            <div css={routeListStyle}>
              <List
                dense={false}
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {waypoints
                  ? waypoints.map(
                      (waypoint: CoordinatesType, index: number) => {
                        // console.log('render waypoint: ', waypoint);
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
                                  key={waypoint.longitude + waypoint.latitude}
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
                                    >
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
