import { CanvasOverlay } from 'react-map-gl';

type RoutePropsType = {
  points: number[][] | undefined;
};

type DrawRoutePropsType = {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  project: (lnglat: number[]) => [];
};

export default function Route(props: RoutePropsType) {
  function drawRoute({ ctx, width, height, project }: DrawRoutePropsType) {
    const points = props.points ? props.points : [];
    if (points.length > 1) {
      const color = '#b94545',
        lineWidth = 3,
        renderWhileDraggin = true;

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';

      if (points) {
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = color;
        ctx.beginPath();

        let pixel: number[];
        points.forEach((currentPoint) => {
          pixel = project([Number(currentPoint[0]), Number(currentPoint[1])]);
          ctx.lineTo(pixel[0], pixel[1]);
        });
        ctx.stroke();
      }
    } else {
      ctx.clearRect(0, 0, width, height);
    }
  }

  return <CanvasOverlay redraw={drawRoute} />;
}
