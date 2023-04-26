/* eslint-disable @typescript-eslint/member-ordering */
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'bibliotheque-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit {
  static ITERATION = 10000;
  static STEP = 5;
  static HAUTEUR = 200 / MainComponent.STEP;
  static LARGEUR = 300 / MainComponent.STEP;

  static blackListed: { [name: string]: number } = {};

  casiers: Casier[] = [];
  squares: boolean[][] = [];

  iteration = 0;

  ngOnInit() {
    for (let i = 0; i < MainComponent.LARGEUR; i++) {
      this.squares[i] = [];
      for (let j = 0; j < MainComponent.HAUTEUR; j++) {
        this.squares[i][j] = false;
      }
    }

    this.startIteration();
  }

  startIteration() {
    const p = this.findFree();
    if (p) {
      // console.log(`${p.x}, ${p.y}`);

      const d = new Casier(p.x, p.y);
      let ok = this.isCasierFree(d);
      if (!ok) {
        d.x = d.x - d.width + 1;
        ok = this.isCasierFree(d);
      }
      if (!ok) {
        d.y = d.y - d.height + 1;
        ok = this.isCasierFree(d);
      }
      if (!ok) {
        d.x = d.x + d.width - 1;
        ok = this.isCasierFree(d);
      }

      // console.log(`${d.x}, ${d.y} : ${ok}`);
      if (ok) {
        this.casiers.push(d);
        for (let i = 0; i < d.width; i++) {
          for (let j = 0; j < d.height; j++) {
            this.squares[d.x + i][d.y + j] = true;
          }
        }
      } else {
        const s = JSON.stringify(p);
        if (!MainComponent.blackListed[s]) {
          MainComponent.blackListed[s] = 1;
        } else {
          MainComponent.blackListed[s] += 1;
        }
        // console.log(MainComponent.blackListed);
      }
    }
    if (this.iteration < MainComponent.ITERATION) {
      setTimeout(() => {
        this.iteration += 1;
        this.startIteration();
      }, 0);
    }
  }

  isCasierFree(d: Casier): boolean {
    for (let i = 0; i < d.width; i++) {
      for (let j = 0; j < d.height; j++) {
        if (MainComponent.isXout(d.x + i) || MainComponent.isYout(d.y + j)) {
          return false;
        }
        if (this.squares[d.x + i][d.y + j]) {
          return false;
        }
      }
    }
    return true;
  }
  static isXout(x: number): boolean {
    return MainComponent.LARGEUR <= x || x < 0;
  }
  static isYout(y: number): boolean {
    return MainComponent.HAUTEUR <= y || y < 0;
  }

  findFree(): Point | undefined {
    // console.log(`findFree())`);

    // const depart = new Point(this.LARGEUR / 2, this.HAUTEUR / 2);
    // const depart = new Point(MainComponent.LARGEUR / 2, MainComponent.HAUTEUR - 1);
    const depart = new Point(0, MainComponent.HAUTEUR - 1);

    const freePoints: Set<string> = new Set<string>();
    const occupiedPoints: Set<string> = new Set<string>();

    // console.log(`A ${x}, ${y} : ${this.squares[x][y]}`);
    if (!this.squares[depart.x][depart.y]) {
      return new Point(depart.x, depart.y);
    }

    this.findFreeAround(depart.x, depart.y, occupiedPoints, freePoints);
    // console.log(occupiedPoints);
    // console.log(freePoints);

    let prochePoint: Point | undefined;
    let distanceMin = Infinity;

    for (const ps of freePoints.values()) {
      const p = JSON.parse(ps) as Point;
      if (distanceMin > depart.distCarre(p)) {
        distanceMin = depart.distCarre(p);
        prochePoint = p;
      }
    }
    // console.log(`${JSON.stringify(prochePoint)} ${distanceMin}`);

    return prochePoint;
  }

  findFreeAround(
    x: number,
    y: number,
    occupied: Set<string>,
    free: Set<string>
  ) {
    // console.log(`findFreeAround ${x}, ${y}`);

    const newPoint = new Point(x, y);

    if (occupied.has(newPoint.toString())) {
      // console.log('already in');
      return;
    }
    occupied.add(newPoint.toString());

    for (let i = -1; i < 2; i++) {
      for (let j = -1; j < 2; j++) {
        if (i !== 0 || j !== 0) {
          if (!MainComponent.isXout(x + i) && !MainComponent.isYout(y + j))
            if (!this.squares[x + i][y + j]) {
              free.add(new Point(x + i, y + j).toString());
            } else {
              this.findFreeAround(x + i, y + j, occupied, free);
            }
        }
      }
    }
  }
}

class Casier {
  x = 0;
  y = 0;
  height: number;
  width: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.height = 6 + Math.floor(Math.random() * 5);
    this.width = 6 + Math.floor(Math.random() * 5);
  }
}

class Point {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  static fromString(s: string): Point {
    return JSON.parse(s) as Point;
  }

  toString(): string {
    return JSON.stringify(this);
  }

  distCarre(p2: Point) {
    if (MainComponent.isXout(this.x) || MainComponent.isXout(p2.x)) {
      return Infinity;
    }
    if (MainComponent.isYout(this.y) || MainComponent.isYout(p2.y)) {
      return Infinity;
    }
    if (
      MainComponent.blackListed[JSON.stringify(this)] > 10 ||
      MainComponent.blackListed[JSON.stringify(p2)] > 10
    ) {
      return Infinity;
    }
    return (
      // 50 * (this.x - p2.x) * (this.x - p2.x) + (this.y - p2.y) * (this.y - p2.y)
      (this.x - p2.x) * (this.x - p2.x) + 10 * (this.y - p2.y) * (this.y - p2.y)
    );
  }
}
