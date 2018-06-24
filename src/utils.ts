import { CubeStatus, Cube, Coordination,Scene } from './types';
import { PLAYGROUND_LENGTH, PLAYGROUND_WIDTH, BOMBCOUNT, CELL_SIZE, GAP_SIZE, PADDING } from './constants';

// -1 means bomb, 0 means empty, other number means the bombs around this square
export function generatePlayGroud() {
  var playground: Cube[][] = [];

  // init multidimensional array in typescript is not easy as in C#
  // https://gist.github.com/xto3na/bdee0c7023716be08b3714f287262e38

  for (let i = 0; i < PLAYGROUND_LENGTH; i++) {
  playground[i] = [];
    for (let j = 0; j < PLAYGROUND_LENGTH; j++) {
      playground[i][j] = { value: 0, flag: CubeStatus.closed };
    }
  }

  //
  for (let i = 0; i < BOMBCOUNT; i++) {
    let random_i = getRandomNumber(0, PLAYGROUND_LENGTH);
    let random_j = getRandomNumber(0, PLAYGROUND_WIDTH);

    playground[random_i][random_j].value = -1; // bomb
  }

  for (let i = 0; i < PLAYGROUND_LENGTH; i++) {
    for (let j = 0; j < PLAYGROUND_WIDTH; j++) {
      if (playground[i][j].value !== -1) { // if bomb, then skip
        let numberOfBomb = 0;
        if (j - 1 >= 0 && playground[i][j - 1].value === -1) numberOfBomb++;  // check left
        if (j + 1 < PLAYGROUND_WIDTH && playground[i][j + 1].value === -1) numberOfBomb++;  // check right

        if (i - 1 >= 0 && playground[i - 1][j].value === -1) numberOfBomb++;  // check upper
        if (i - 1 >= 0 && j - 1 >= 0 && playground[i - 1][j - 1].value === -1) numberOfBomb++;  // check upper
        if (i - 1 >= 0 && j + 1 < PLAYGROUND_WIDTH && playground[i - 1][j + 1].value === -1) numberOfBomb++;  // check upper

        if (i + 1 < PLAYGROUND_LENGTH && playground[i + 1][j].value === -1) numberOfBomb++;  // check bottom
        if (i + 1 < PLAYGROUND_LENGTH && j + 1 < PLAYGROUND_WIDTH && playground[i + 1][j + 1].value === -1) numberOfBomb++; // check bottom
        if (i + 1 < PLAYGROUND_LENGTH && j - 1 >= 0 && playground[i + 1][j - 1].value === -1) numberOfBomb++;  // check bottom

        playground[i][j].value = numberOfBomb;
        playground[i][j].flag = CubeStatus.closed;
      }
    }

  }

  return playground;
}

export function sweep([acc_coordination, acc_playground, acc_markedAsMine], [curr_coordination, curr_playground, cur_markedAsMine]) {
  let coord = curr_coordination as Coordination;
  let i = coord.y;
  let j = coord.x;

  let newplayground = acc_playground as Cube[][];
  if (cur_markedAsMine) // mark
    newplayground[i][j].flag = CubeStatus.marked;
  else { // open
    if (newplayground[i][j].value === -1) { // game failed, show all the bombs 
      for (let m = 0; m < PLAYGROUND_LENGTH; m++) {
          for (let n = 0; n < PLAYGROUND_LENGTH; n++) {
            if(newplayground[m][n].value === -1) 
            newplayground[m][n].flag = CubeStatus.open
          }
        }
        newplayground[i][j].flag = CubeStatus.wrongMine;
    }
    else if (newplayground[i][j].value === 0) // empty
      SweepEmpty(newplayground, i, j);
    else
      newplayground[i][j].flag = CubeStatus.open;
  }
  return [coord, newplayground,cur_markedAsMine];
}

function SweepEmpty(playground: Cube[][], i: number, j: number) {

  if (playground[i][j].value !== 0) return;
  playground[i][j].flag = CubeStatus.open;

  if (j - 1 >= 0 && playground[i][j - 1].flag !== CubeStatus.open) {
    playground[i][j - 1].flag = CubeStatus.open;  // check left

    SweepEmpty(playground, i, j - 1);
  }
  if (j + 1 < PLAYGROUND_WIDTH && playground[i][j + 1].flag !== CubeStatus.open) {
    playground[i][j + 1].flag = CubeStatus.open;    // check right
    SweepEmpty(playground, i, j + 1);
  }
  if (i - 1 >= 0 && playground[i - 1][j].flag !== CubeStatus.open) {
    playground[i - 1][j].flag = CubeStatus.open;   // check upper
    SweepEmpty(playground, i - 1, j);
  }
  if (i - 1 >= 0 && j - 1 >= 0 && playground[i - 1][j - 1].flag !== CubeStatus.open) {
    playground[i - 1][j - 1].flag = CubeStatus.open;   // check upper
    SweepEmpty(playground, i - 1, j - 1);
  }

  if (i - 1 >= 0 && j + 1 < PLAYGROUND_WIDTH && playground[i - 1][j + 1].flag !== CubeStatus.open) {
    playground[i - 1][j + 1].flag = CubeStatus.open;   // check upper
    SweepEmpty(playground, i - 1, j + 1);
  }
  if (i + 1 < PLAYGROUND_LENGTH && playground[i + 1][j].flag !== CubeStatus.open) {
    playground[i + 1][j].flag = CubeStatus.open;  // check bottom
    SweepEmpty(playground, i + 1, j);
  }
  if (i + 1 < PLAYGROUND_LENGTH && j + 1 < PLAYGROUND_WIDTH && playground[i + 1][j + 1].flag !== CubeStatus.open) {
    playground[i + 1][j + 1].flag = CubeStatus.open; // check bottom
    SweepEmpty(playground, i + 1, j + 1);
  }
  if (i + 1 < PLAYGROUND_LENGTH && j - 1 >= 0 && playground[i + 1][j - 1].flag !== CubeStatus.open) {
    playground[i + 1][j - 1].flag = CubeStatus.open;  // check bottom
    SweepEmpty(playground, i + 1, j - 1);
  }
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

export function isGameOver(playground: Cube[][]) {
  for (let m = 0; m < PLAYGROUND_LENGTH; m++) {
    for (let n = 0; n < PLAYGROUND_LENGTH; n++) {
      if(playground[m][n].flag === CubeStatus.wrongMine)
       return true;
    }
  }
  return false;

}