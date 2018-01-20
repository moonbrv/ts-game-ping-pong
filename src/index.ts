import './reset.css'
import './main.css'

enum ColorPalette {
  Black = '#000000',
  Cyan = '#009688',
  Gray = '#6A6A6A',
  White = '#E8E1E1',
  Orange = '#FB5521'
}

enum Size {
  Speed = 3,
  Ball = 10,
  PlayerWidth = 10,
  PlayerHeight = 100,
  InitialOffsetX = 20,
  InitialOffsetY = 40
}

// const colors = {
//   black: '000000',
//   cyan: '#009688',
//   gray: '#6A6A6A',
//   white: '#E8E1E1',
//   orange: '#FB5521'
// }

const gameCanvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('game')

class Vector {
  private _x: number
  private _y: number
  constructor (x = 0, y = 0) {
    this._x = x
    this._y = y
  }
  get x(): number {
    return this._x
  }
  set x(newX: number) {
    this._x = newX
  }
  get y(): number {
    return this._y
  }
  set y(newY: number) {
    this._y = newY
  }
}

class Rectangle {
  private _position: Vector
  private _size: Vector

  constructor (w: number = 0, h: number = 0, initX: number = 0, initY: number = 0) {
    this._position = new Vector(initX, initY)
    this._size = new Vector(w, h)
  }

  get position(): Vector {
    return this._position
  }

  get size(): Vector {
    return this._size
  }

  get left(): number {
    return this.position.x
  }

  get right(): number {
    return this.position.x + this.size.x
  }

  get top(): number {
    return this.position.y + this.size.y
  }

  get bottom(): number {
    return this.position.y
  }
}

class Ball extends Rectangle {
  private _velocity: Vector

  constructor () {
    super(Size.Ball, Size.Ball)
    this._velocity = new Vector()
  }

  get velocity(): Vector {
    return this._velocity
  }

  updatePosition (dt: number): void {
    this.position.x = this.position.x + this.velocity.x * dt
    this.position.y = this.position.y + this.velocity.y * dt
  }
}

class Player extends Rectangle {
  private _score: number
  constructor (initX: number = 0, initY: number = 0) {
    super(Size.PlayerWidth, Size.PlayerHeight, initX, initY)
  }

  get score(): number {
    return this._score
  }

  updateScore () {
    this._score = this._score + 1
  }
}

class PingPongGame {
  private _canvas: HTMLCanvasElement
  private _context: CanvasRenderingContext2D
  private _ball: Ball
  private _lastUpdateTime: number
  private _players: Player[]

  constructor (canvas: HTMLCanvasElement) {
    this._canvas = canvas
    this._context = canvas.getContext('2d')
    this._ball = new Ball()
    this._lastUpdateTime = 0
    this._players = [
      new Player(Size.InitialOffsetX, Size.InitialOffsetY),
      new Player(
        this.canvas.width - Size.InitialOffsetX - Size.PlayerWidth,
        this.canvas.height - Size.InitialOffsetY - Size.PlayerHeight
      )
    ]

    this.ball.velocity.x = Size.Speed
    this.ball.velocity.y = Size.Speed

  }

  get canvas(): HTMLCanvasElement {
    return this._canvas
  }

  get context(): CanvasRenderingContext2D {
    return this._context
  }

  get ball(): Ball {
    return this._ball
  }

  get lastUpdateTime(): number {
    return this._lastUpdateTime
  }

  set lastUpdateTime(miliseconds: number) {
    this._lastUpdateTime = miliseconds
  }

  get players (): Player[] {
    return this._players
  }

  get player1 (): Player {
    return this._players[0]
  }

  get player2 (): Player {
    return this._players[1]
  }

  updateCanvas ():void {
    this.context.fillStyle = ColorPalette.Black
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }

  drawRectangle (rect: Rectangle, color: ColorPalette = ColorPalette.White): void {
    this.context.fillStyle = color
    this.context.fillRect(rect.position.x, rect.position.y, rect.size.x, rect.size.y)
  }

  checkBallMoveDirection (ball: Ball):void {
    if (ball.left <= 0 || ball.right >= this.canvas.width) {
      ball.velocity.x = -ball.velocity.x
    }
    if (ball.bottom <= 0 || ball.top >= this.canvas.height) {
      ball.velocity.y = -ball.velocity.y
    }
  }

  drawPlayers (players: Player[]): void {
    players.forEach(player => this.drawRectangle(player))
  }

  updateElementsPositions = (dt: number): void => {
    this.ball.updatePosition(dt)
    this.checkBallMoveDirection(this.ball)

    this.updateCanvas()
    this.drawRectangle(this.ball)
    this.drawPlayers(this.players)
  }

  updateGame = (miliseconds: number): void => {
    if (this.lastUpdateTime) {
      const dt = (miliseconds - this.lastUpdateTime) / 10
      this.updateElementsPositions(dt)
    }
    this.lastUpdateTime = miliseconds
    requestAnimationFrame(this.updateGame)
  }
}

const game = new PingPongGame(gameCanvas)
game.updateGame(0)
