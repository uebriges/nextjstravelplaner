/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Draggable } from 'react-beautiful-dnd';

type WaypointPropsType = {
  id: string;
  longitude: number;
  latitude: number;
  index: number;
};

const testStyles = css`
  border: 1px dashed gray;
  padding: 0.5rem 1rem;
  margin-bottom: 0.5rem;
  background-color: white;
  cursor: move;
`;

export default function Waypoint(props: WaypointPropsType) {
  return (
    <Draggable draggableId={props.id} index={props.index}>
      {(provided) => {
        return (
          <div
            css={testStyles}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
          >
            {props.longitude + ', ' + props.latitude}
          </div>
        );
      }}
    </Draggable>
  );
}
