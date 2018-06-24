import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { animationFrame } from 'rxjs/scheduler/animationFrame';
import { interval } from 'rxjs/observable/interval';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { of } from 'rxjs/observable/of';
import {
  map,
  filter,
  scan,
  withLatestFrom,
  switchMap,
  takeWhile,
  first,
  merge
} from 'rxjs/operators';

import { PADDING, FPS, CELL_SIZE, GAP_SIZE } from './constants';
import { Scene, Coordination, Cube, MineImageResrouce } from './types';

import {
  createCanvasElement,
  renderScene,
  renderGameOver
} from './canvas';

import {
  isGameOver,
  generatePlayGroud,
  sweep
} from './utils';

/**
 * Create canvas element and append it to the page
 */
let canvas = createCanvasElement();
let ctx = canvas.getContext('2d');

let closedimage = new Image(5, 5);
closedimage.src = './images/closed.svg';

let mineWrongimage = new Image(5, 5);
mineWrongimage.src = './images/mine_wrong.svg';

let flagimage = new Image(5, 5);
flagimage.src = './images/flag.svg';

let mineimage = new Image(5, 5);
mineimage.src = './images/mine.svg';

let numberImages: HTMLImageElement[] = [];
for (var i = 0; i < 9; i++) {
  numberImages[i] = new Image(5, 5);
  numberImages[i].src = `./images/type${i}.svg`;
}
let displayImages : MineImageResrouce = {numberImages : numberImages, closedImage: closedimage, mineImage:mineimage, mineWrongImage : mineWrongimage,flagImage :flagimage };

document.body.appendChild(canvas);

document.oncontextmenu = function () {
  return false;
}; // disable contextmenu

let canvasClick$ = fromEvent<MouseEvent>(canvas, 'click');
let rightClick$ = fromEvent<MouseEvent>(document, 'contextmenu');

let documentClick$ = fromEvent(document, 'click');

function createGame(fps$: Observable<number>): Observable<Scene> {

  let playground$ = new BehaviorSubject<Cube[][]>(generatePlayGroud());
  
  let score$ = of(0).pipe(
    scan((score, _) => score + 1),
  ); // to do

  canvasClick$.pipe(
    merge(rightClick$),
    withLatestFrom(playground$),
    map(([event, playground]) => {
      let x = (event.clientX - canvas.offsetLeft - PADDING) / (CELL_SIZE + GAP_SIZE);
      let y = (event.clientY - canvas.offsetTop - PADDING) / (CELL_SIZE + GAP_SIZE);
      x = Math.floor(x);
      y = Math.floor(y);
      let cooridation: Coordination = { x: x, y: y };
      let markedAsMine = event.button === 2; // 0 = left click, 2 = right click
      return [cooridation, playground, markedAsMine];
    }),
    filter(
      event => {
        let cor = event[0] as Coordination;
        return cor.x > -1 && cor.y > -1;
      }
    ), //  ingore the click, if user click outside of the playground
    scan(sweep)
  ).subscribe(
    event => {
      let playground = event[1] as Cube[][];
      if(!isGameOver(playground))
         playground$.next(playground);
      else
        playground$.error(playground);
    }
  );

  let scene$: Observable<Scene> = combineLatest(playground$, score$, (playground, score) => ({ playground, score }));

  return fps$.pipe(withLatestFrom(scene$, (_, scene) => scene));
}

let game$ = of('Start Game').pipe(
  map(() => interval(1000 / FPS, animationFrame)),
  switchMap(createGame),
  //takeWhile(scene => !isGameOver(scene)) //  takewhile is diffrenct with filter, takewhile will stop emitting
);

const startGame = () => game$.subscribe({
  next: (scene) => {
    renderScene(ctx,displayImages, scene);
  },
  error: (lastPlayground) =>
  {
    let lastScene :Scene = {playground: lastPlayground as Cube[][],score:0};
    renderScene(ctx,displayImages, lastScene);
  },
  complete: () => {
    //renderGameOver(ctx);
    // documentClick$.pipe(first()).subscribe({
    //   next: () => startGame(),
    //   complete: () => console.log(' clicked to game start')
    // });
  }
});

startGame();