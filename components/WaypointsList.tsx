/** @jsxImportSource @emotion/react */
import { List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import Cookies from 'js-cookie';
import { useDrag, useDrop } from 'react-dnd';
import { CoordinatesType } from '../pages/TravelPlaner';
import { routeListStyle } from '../styles/styles';
import { ItemType } from './DndContext';

function getCurrentRoute() {
  return Cookies.getJSON('route');
}

export default function WaypointsList() {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemType.WAYPOINT,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    item: { type: ItemType.WAYPOINT },
  }));

  const [{ isOver, handlerId, canDrop }, drop] = useDrop(() => ({
    // The type (or types) to accept - strings or symbols
    accept: ItemType.WAYPOINT,
    // Props to collect
    drop: (item, monitor) => {
      console.log('item: ', item);
      console.log('monitor: ', monitor);
      console.log('handlerId: ', handlerId);
      console.log('canDrop: ', canDrop);
      console.log('isOver: ', isOver);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      handlerId: monitor.getHandlerId(),
      canDrop: monitor.canDrop(),
    }),
  }));

  return (
    <div className="list" css={routeListStyle}>
      <List dense={false} ref={drop}>
        {getCurrentRoute()
          ? getCurrentRoute().map(
              (waypoint: CoordinatesType, index: number) => {
                return (
                  <ListItem key={index} ref={drag}>
                    <ListItemIcon>
                      <MenuIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${waypoint.longitude}, ${waypoint.latitude}`}
                    />
                  </ListItem>
                );
              },
            )
          : null}
      </List>
    </div>
  );
}
