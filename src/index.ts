import './reset.css'
import './main.css'
import { setTimeout } from 'timers';

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

enum Speed {
  Ball = 3,
  Player = 3
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
  private _activeButtonsPress: number
  private _prevButtonPressCode: number
  private _velocity: Vector
  constructor (initX: number = 0, initY: number = 0) {
    super(Size.PlayerWidth, Size.PlayerHeight, initX, initY)
    this._velocity = new Vector()
    this._score = 0
    this._activeButtonsPress = 0
  }

  get velocity(): Vector {
    return this._velocity
  }

  get score(): number {
    return this._score
  }

  get prevButtonPressCode(): number {
    return this._prevButtonPressCode
  }

  set prevButtonPressCode(code: number) {
    this._prevButtonPressCode = code
  }

  addActiveButtonPress (velocity: number, code: number): void {
    if (this._activeButtonsPress < 2 && code !== this.prevButtonPressCode) {
      this._activeButtonsPress++
      this.prevButtonPressCode= code
    }
    this.velocity.y = velocity
  }

  removeActiveButtonPress (): void {
    if (this._activeButtonsPress > 0) {
      this._activeButtonsPress--
      if (this._activeButtonsPress === 0) {
        this.velocity.y = 0
      } else {
        this.velocity.y = -this.velocity.y
      }
    }
  }

  updateScore () {
    this._score = this._score + 1
  }

  updatePosition (dt: number, topLimit: number): void {
    if (this.velocity.y < 0 && this.bottom <= 0) return
    if (this.velocity.y > 0 && this.top >= topLimit) return
    this.position.y = this.position.y + this.velocity.y * dt
  }
}

class PingPongGame {
  private _canvas: HTMLCanvasElement
  private _context: CanvasRenderingContext2D
  private _ball: Ball
  private _lastUpdateTime: number
  private _players: Player[]
  private _playersScoresNodes: HTMLElement[]

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

    this.ball.velocity.x = Speed.Ball
    this.ball.velocity.y = Speed.Ball

    this.setPlayerSpeed(81, 65, this.player1)
    this.setPlayerSpeed(80, 76, this.player2)

    this._playersScoresNodes = [
      document.getElementById('player-1-score'),
      document.getElementById('player-2-score')
    ]
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

  get playersScoreNodes(): HTMLElement[] {
    return this._playersScoresNodes
  }

  get player1ScoreNode(): HTMLElement {
    return this._playersScoresNodes[0]
  }

  get player2ScoreNode(): HTMLElement {
    return this._playersScoresNodes[1]
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

  setPlayerSpeed (topSpeedKeyCode: number, bottomSpeedKeyCode: number, player: Player): void {
    const addSpeedY = (e: KeyboardEvent): void => {
      if (e.keyCode === topSpeedKeyCode) {
        player.addActiveButtonPress(-Speed.Player, e.keyCode)
      } else if (e.keyCode === bottomSpeedKeyCode) {
        player.addActiveButtonPress(Speed.Player, e.keyCode)
      }
    }
    window.addEventListener('keydown', addSpeedY)
    window.addEventListener('keypress', addSpeedY)
    window.addEventListener('keyup', (e: KeyboardEvent): void => {
      if (e.keyCode === topSpeedKeyCode || e.keyCode === bottomSpeedKeyCode) {
        player.removeActiveButtonPress()
      }
    })
  }

  updateCanvas ():void {
    this.context.fillStyle = ColorPalette.Black
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }

  drawRectangle (rect: Rectangle, color: ColorPalette = ColorPalette.White): void {
    this.context.fillStyle = color
    this.context.fillRect(rect.position.x, rect.position.y, rect.size.x, rect.size.y)
  }

  ballAreInPlayerBoundaries (ball: Ball, player: Player): boolean {
    return (ball.top <= player.top && ball.bottom >= player.bottom)
  }

  checkBallMoveDirection (ball: Ball, player1: Player, player2: Player): void {
    if ((ball.left <= player1.right && this.ballAreInPlayerBoundaries(ball, player1)) || (ball.right >= player2.left) && this.ballAreInPlayerBoundaries(ball, player2)) {
      ball.velocity.x = -ball.velocity.x
    }
    if (ball.bottom <= 0 || ball.top >= this.canvas.height) {
      ball.velocity.y = -ball.velocity.y
    }
  }

  drawPlayers (players: Player[]): void {
    players.forEach(player => this.drawRectangle(player, ColorPalette.Orange))
  }

  resetBall (ball: Ball, winnerPlayerIndex: number = 0): void {
    ball.velocity.x = 0
    ball.velocity.y = 0

    ball.position.x = this.canvas.width / 2
    ball.position.y = this.canvas.height / 2

    const multiplier = winnerPlayerIndex ? -1 : 1

    setTimeout(() => {
      const speed = Speed.Ball * multiplier
      ball.velocity.x = speed
      ball.velocity.y = speed
    }, 500)
  }

  checkScore (ball: Ball): void {
    let winnerPlayerIndex: number
    if (ball.left <= 0) {
      winnerPlayerIndex = 1
      // player2.updateScore()
      // this.player2ScoreNode.innerHTML = `${this.player2.score}`
    }
    if (ball.right >= this.canvas.width) {
      winnerPlayerIndex = 0
      // player1.updateScore()
      // this.player1ScoreNode.innerHTML = `${this.player1.score}`
    }
    if (winnerPlayerIndex !== undefined) {
      this.players[winnerPlayerIndex].updateScore()
      this.playersScoreNodes[winnerPlayerIndex].innerHTML = `${this.players[winnerPlayerIndex].score}`

      this.resetBall(ball, winnerPlayerIndex)
    }
  }

  updateElementsPositions = (dt: number): void => {
    this.ball.updatePosition(dt)
    this.player1.updatePosition(dt, this.canvas.height)
    this.player2.updatePosition(dt, this.canvas.height)
    this.checkBallMoveDirection(this.ball, this.player1, this.player2)
    this.checkScore(this.ball)
    this.updateCanvas()
    this.drawRectangle(this.ball, ColorPalette.Cyan)
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
