import { CanvasOverlay } from 'react-map-gl';
import { CoordinatesType } from '../pages/travelplaner';

type RoutePropsType = {
  points: CoordinatesType[] | undefined;
};

type DrawRoutePropsType = {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  project: (lng: number, lat: number) => [];
};

export default function Route(props: RoutePropsType) {
  function drawRoute({ ctx, width, height, project }: DrawRoutePropsType) {
    const points = props.points;
    if (points?.length > 1) {
      // console.log('cookies in js-cookies: ', Cookies.getJSON('route'));

      // console.log('points: ', points);

      const color = '#b94545',
        lineWidth = 3,
        renderWhileDraggin = true;

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';

      if (points) {
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = color;
        ctx.beginPath();

        let pixel;
        points.forEach((currentPoint, index) => {
          // console.log('index: ', index);
          pixel = project([Number(currentPoint[0]), Number(currentPoint[1])]);
          // console.log('pixel: ', pixel);
          ctx.lineTo(pixel[0], pixel[1]);
        });
        // console.log('ctx: ', ctx);
        ctx.stroke();
      }
    } else {
      ctx.clearRect(0, 0, width, height);
    }
  }

  return <CanvasOverlay redraw={drawRoute} />;
}
