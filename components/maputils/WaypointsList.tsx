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
import Cookies from 'js-cookie';
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

// function getCurrentWaypoints() {
//   return Cookies.getJSON('waypoints');
// }

type WaypointsListType = {
  generateTurnByTurnRoute: () => void;
  sessionToken: string;
};

export default function WaypointsList(props: WaypointsListType) {
  console.log('111111111111111111');
  const waypointsFromDB = useQuery(graphqlQueries.getCurrentWaypoints, {
    variables: { token: props.sessionToken },
  });

  // Delete waypoint from DB
  const [deleteWaypoint, { dataDeletedWaypoint }] = useMutation(
    graphqlQueries.deleteWaypoint,
  );

  // Delete waypoint from DB
  // const [updateWaypoints, { dataUpdatedWaypoints }] = useMutation(
  //   graphqlQueries.updateWaypoints,
  // );

  // console.log('waypoints waypointlist: ', waypointsFromDB);
  // Store the moved waypoint and it's updated long/lat and waypoint name

  // const [updateMovedWaypoint, { dataMovedWaypoint }] = useMutation(
  //   graphqlQueries.updateWaypoints,
  // );

  const [waypoints, setWaypoints] = useState(
    waypointsFromDB.data ? waypointsFromDB.data.waypoints : null,
  );
  resetServerContext();

  async function onDragEnd(result: DropResult) {
    const { destination, source } = result;
    const pointsTemp = Array.from(waypointsFromDB.data.waypoints);

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
    pointsTemp.map((point, index) => {
      point.orderNumber = index + 1;
    });

    console.log('pointsTemp: ', pointsTemp);

    await updateWaypoints({
      variables: {
        waypoints: pointsTemp,
      },
    });

    Cookies.set('waypoints', pointsTemp); // needs to be written into DB in new order
    props.generateTurnByTurnRoute();
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
                                        console.log('route: ', route);
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
