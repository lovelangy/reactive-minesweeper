

export interface Scene {
  playground: Cube[][]; //  playground that contains bombs and clues about the number of neighboring mines in each field
  score: number;
}
export interface MineImageResrouce {
  numberImages: HTMLImageElement[]; 
  mineImage: HTMLImageElement;
  mineWrongImage:HTMLImageElement;
  closedImage:HTMLImageElement;
  flagImage : HTMLImageElement; 
}

export interface Coordination {
  x: number;
  y: number;
}

export interface Cube {
  value: number;
  flag: CubeStatus;
}

export enum CubeStatus {
  closed,
  open,
  wrongMine,
  marked
}