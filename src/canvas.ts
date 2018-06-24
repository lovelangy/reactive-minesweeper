import { Scene, Cube, CubeStatus, MineImageResrouce } from './types';
import { GAP_SIZE, CANVAS_WIDTH, CANVAS_HEIGHT, CELL_SIZE, PADDING } from './constants';

export function createCanvasElement() {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  return canvas;
}

export function renderScene(ctx: CanvasRenderingContext2D, displayImages:MineImageResrouce, scene: Scene) {

  renderBackground(ctx, scene.playground, displayImages);
  // renderScore(ctx, scene.score);
}

export function renderScore(ctx: CanvasRenderingContext2D, score: number) {
  let textX = CANVAS_WIDTH / 2;
  let textY = CANVAS_HEIGHT / 2;

  drawText(ctx, score.toString(), textX, textY, 'rgba(0, 0, 0, 0.1)', 150);
}

export function renderBackground(ctx: CanvasRenderingContext2D, playground: Cube[][], displayImages:MineImageResrouce) {
  ctx.fillStyle = '#EEE';
  for (let i = 0; i < playground.length; i++) {
    for (let j = 0; j < playground[i].length; j++) {

      let textX = (CELL_SIZE + GAP_SIZE) * j + PADDING;
      let textY = (CELL_SIZE + GAP_SIZE) * i + PADDING;
      if (playground[i][j].flag === CubeStatus.marked) {
        drawImage(ctx, textX, textY, displayImages.flagImage);
      }
      else if (playground[i][j].flag === CubeStatus.open) {
        let value = playground[i][j].value;
        let displayimage = playground[i][j].value === -1 ? displayImages.mineImage : displayImages.numberImages[value];

        drawImage(ctx, textX, textY, displayimage);
      }
      else if (playground[i][j].flag === CubeStatus.wrongMine) {
        drawImage(ctx, textX, textY, displayImages.mineWrongImage);
      }
      else {
        drawImage(ctx, textX, textY, displayImages.closedImage);
      }
    }
  }
}

export function renderGameOver(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  let textX = CANVAS_WIDTH / 2;
  let textY = CANVAS_HEIGHT / 2;

  drawText(ctx, 'GAME OVER!', textX, textY, 'black', 25);
}


function drawImage(ctx: CanvasRenderingContext2D, textX: number, textY: number, image: HTMLImageElement) {

  ctx.drawImage(image, textX, textY, CELL_SIZE, CELL_SIZE);
}


function drawText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, fillStyle: string,
  fontSize: number, horizontalAlign: string = 'center', verticalAlign: string = 'middle') {

  ctx.fillStyle = fillStyle;
  ctx.font = `bold ${fontSize}px sans-serif`;

  let textX = x;
  let textY = y;

  ctx.textAlign = horizontalAlign;
  ctx.textBaseline = verticalAlign;

  ctx.fillText(text, textX, textY);
}
