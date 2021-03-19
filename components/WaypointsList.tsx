/** @jsxImportSource @emotion/react */
import {
  Button,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import MenuIcon from '@material-ui/icons/Menu';
import SaveIcon from '@material-ui/icons/Save';
import Cookies from 'js-cookie';
import { useState } from 'react';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
  resetServerContext
} from 'react-beautiful-dnd';
import { CoordinatesType } from '../pages/travelplaner';
import { routeListStyle } from '../styles/styles';

function getCurrentWaypoints() {
  return Cookies.getJSON('waypoints');
}

type WaypointsListType = {
  generateTurnByTurnRoute: () => void;
};

export default function WaypointsList(props: WaypointsListType) {
  const [waypoints, setWaypoints] = useState(getCurrentWaypoints());
  resetServerContext();

  function onDragEnd(result: DropResult) {
    const { destination, source } = result;
    const pointsTemp = Array.from(getCurrentWaypoints());

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

    Cookies.set('waypoints', pointsTemp);
    props.generateTurnByTurnRoute();
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="1">
        {(provided) => {
          return (
            <div css={routeListStyle}>
              <List
                dense={false}
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {getCurrentWaypoints()
                  ? getCurrentWaypoints().map(
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
                                    primary={waypoint.locationName}
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
                                      onClick={() => {
                                        const route = getCurrentWaypoints();
                                        route.splice(index, 1);
                                        Cookies.set('waypoints', route);
                                        setWaypoints(route);
                                        props.generateTurnByTurnRoute();
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
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
              >
                Save
              </Button>
            </div>
          );
        }}
      </Droppable>
    </DragDropContext>
  );
}
