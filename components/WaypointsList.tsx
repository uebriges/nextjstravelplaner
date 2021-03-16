/** @jsxImportSource @emotion/react */
import { List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import Cookies from 'js-cookie';
import {
  DragDropContext,
  Draggable,
  Droppable,
  resetServerContext,
} from 'react-beautiful-dnd';
import { CoordinatesType } from '../pages/travelplaner';
import { routeListStyle } from '../styles/styles';

function getCurrentRoute() {
  return Cookies.getJSON('waypoint');
}

export default function WaypointsList() {
  resetServerContext();

  function onDragEnd(result) {
    const { destination, source } = result;
    const pointsTemp = Array.from(getCurrentRoute());

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

    Cookies.set('waypoint', pointsTemp);
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
                {getCurrentRoute()
                  ? getCurrentRoute().map(
                      (waypoint: CoordinatesType, index: number) => {
                        return (
                          <Draggable
                            key={
                              'Draggable' +
                              waypoint.latitude +
                              waypoint.longitude
                            }
                            draggableId={
                              'Id' + waypoint.latitude + waypoint.longitude
                            }
                            index={index}
                          >
                            {(provided) => {
                              return (
                                <ListItem
                                  key={waypoint.longitude + waypoint.latitude}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  ref={provided.innerRef}
                                >
                                  <ListItemIcon>
                                    <MenuIcon />
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={waypoint.locationName}
                                  />
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
