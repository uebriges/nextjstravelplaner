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
import { useState } from 'react';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
  resetServerContext,
} from 'react-beautiful-dnd';
import { CoordinatesType } from '../../pages/travelplaner';
import { routeListStyle } from '../../styles/styles';
import graphqlQueries from '../../utils/graphqlQueries';

type WaypointsListType = {
  generateTurnByTurnRoute: () => void;
  sessionToken: string;
};

export default function WaypointsList(props: WaypointsListType) {
  console.log('111111111111111111');
  // Retrieve current waypoints from DB
  const waypointsFromDB = useQuery(graphqlQueries.getCurrentWaypoints, {
    variables: { token: props.sessionToken },
  });

  // Delete waypoint from DB
  const [deleteWaypoint, { dataDeletedWaypoint }] = useMutation(
    graphqlQueries.deleteWaypoint,
  );

  // Update waypoints in DB
  const [updateWaypoints, { dataUpdatedWaypoints }] = useMutation(
    graphqlQueries.updateWaypoints,
  );

  // Store the moved waypoint and it's updated long/lat and waypoint name
  const [waypoints, setWaypoints] = useState(
    waypointsFromDB.data ? waypointsFromDB.data.waypoints : null,
  );

  // useEffect(() => {
  //   props.generateTurnByTurnRoute();
  // }, [dataUpdatedWaypoints, props]);

  resetServerContext();

  async function onDragEnd(result: DropResult) {
    const { destination, source } = result;
    const pointsTemp = [...waypointsFromDB.data.waypoints];

    console.log('pointsTemp: ', pointsTemp);

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

    console.log('points Temp: ', pointsTemp);

    // Update the order numbers
    const newlyOrderedPoints = pointsTemp.map((point, index) => {
      point = { ...point, orderNumber: index + 1 };
      return point;
    });

    console.log('pointsTemp: ', newlyOrderedPoints);

    await updateWaypoints({
      variables: {
        waypoints: newlyOrderedPoints,
      },
    });

    console.log('updatedWaypoints in drag end: ', dataUpdatedWaypoints);

    props.generateTurnByTurnRoute();

    // Cookies.set('waypoints', newlyOrderedPoints); // needs to be written into DB in new order
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
                {waypointsFromDB.data
                  ? waypointsFromDB.data.waypoints.map(
                      (waypoint: CoordinatesType, index: number) => {
                        return (
                          <Draggable
                            key={
                              'Draggable' +
                              waypoint.latitude +
                              waypoint.longitude +
                              index
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
                                        await deleteWaypoint({
                                          variables: {
                                            waypointId: waypoint.id,
                                          },
                                        });
                                        console.log(
                                          'route after deletion: ',
                                          route,
                                        );
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
              {/* <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
              >
                Save
              </Button> */}
            </div>
          );
        }}
      </Droppable>
    </DragDropContext>
  );
}
