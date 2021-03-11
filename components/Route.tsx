import { CanvasOverlay } from 'react-map-gl';

type RoutePropsType = {
  points: number[][];
};

type DrawRoutePropsType = {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  project: (lng: number, lat: number) => [];
};

export default function Route(props: RoutePropsType) {
  function drawRoute({ ctx, width, height, project }: DrawRoutePropsType) {
    let points = props.points;

    const color = '#b94545',
      lineWidth = 3,
      renderWhileDraggin = true;

    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'lighter';

    points = [
      [-77.033246, 38.911939],
      [-77.026808, 38.91229],
    ];

    if (points) {
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = color;
      ctx.beginPath();

      let pixel;
      points.forEach((currentPoint) => {
        pixel = project([currentPoint[0], currentPoint[1]]);
        ctx.lineTo(pixel[0], pixel[1]);
      });
      ctx.stroke();
    }
  }

  return <CanvasOverlay redraw={drawRoute} />;
}
