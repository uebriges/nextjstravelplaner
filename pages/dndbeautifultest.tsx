/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useState } from 'react';
import {
  DragDropContext,
  Droppable,
  resetServerContext,
} from 'react-beautiful-dnd';
import Waypoint from '../components/Waypoint';

const testStyles = css`
  border: 1px dashed gray;
  padding: 0.5rem 1rem;
  margin-bottom: 0.5rem;
  background-color: white;
  cursor: move;
`;

export default function DndBeautifulTest() {
  resetServerContext();

  console.log('rerender');
  const [points, setPoints] = useState([
    { id: '3', longitude: -77.02, latitude: 38.9 },
    { id: '4', longitude: -76.97, latitude: 38.9 },
    { id: '5', longitude: -76.98, latitude: 38.91 },
    { id: '6', longitude: -73.97, latitude: 39.9 },
    { id: '7', longitude: -75.98, latitude: 40.91 },
  ]);

  function onDragEnd(result) {
    console.log('result: ', result);
    const { destination, source } = result;
    const pointsTemp = Array.from(points);

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
    setPoints(pointsTemp);
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="1">
        {(provided) => {
          return (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {points.map((point, index) => {
                return (
                  <Waypoint
                    key={point.id}
                    longitude={point.longitude}
                    latitude={point.latitude}
                    index={index}
                    id={point.id}
                  />
                );
              })}
              {provided.placeholder}
            </div>
          );
        }}
      </Droppable>
    </DragDropContext>
  );
}
