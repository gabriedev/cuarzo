import { Collision } from '../collision'
import { Vector2 } from '../geometry/vector2'
import { logoEngine } from '../internals/logo'
import { playBrandingVideo } from '../internals/playBrandingVideo'
import { renderLogoImage } from '../internals/renderLogoImage'
import { Resources } from '../internals/resources'
import { camera } from './camera'

/**
 *  @typedef {import('../node').Node2D} Node2D
 */

class Engine {
  constructor() {
    this.lastTime
    /** @type {Node2D[]} */
    this.collisions = []
    /** @type {Node2D[]} */
    this.nodes = []
    this.paused = false
    this.config = {
      devMode: import.meta['env']?.DEV
    }
  }

  onLoaded(listener) {
    if (typeof listener !== 'function')
      throw new Error('Invalid listener. Expected a function.')
    Resources.asignListener(listener)
    Resources.executeListener()
  }

  mount(nodes) {
    this.nodes = this.nodes.concat(nodes)
    window.requestAnimationFrame(this._start.bind(this))
  }

  init({
    canvas = document.querySelector('canvas'),
    width = 600,
    height = 800,
    imageBrandUrl,
    videoElement
  } = {}) {
    if (!(canvas instanceof HTMLCanvasElement))
      throw new Error(
        "The 'canvas' parameter must be an instance of HTMLCanvasElement."
      )

    this.canvas = canvas
    canvas.width = width
    canvas.height = height
    camera.setViewportSize(new Vector2(width, height))
    this.ctx = canvas.getContext('2d')

    document.body.style.background = 'black'

    function showLogoEngine() {
      renderLogoImage(logoEngine, Resources.executeListener.bind(this))
      document.body.style.removeProperty('background')
    }

    if (typeof imageBrandUrl === 'string')
      return renderLogoImage(imageBrandUrl, showLogoEngine)

    if (typeof videoElement !== 'undefined') {
      if (!(videoElement instanceof HTMLVideoElement))
        throw new Error(
          "The 'videoElement' parameter must be an instance of HTMLVideoElement."
        )
      return playBrandingVideo(videoElement, showLogoEngine)
    }

    showLogoEngine()
  }

  clear() {
    if (this.ctx === undefined) return
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  /**
   *
   * @param {number} time
   * @private
   */
  _gameLoop(time) {
    this.clear()
    const delta = time - this.lastTime

    for (const node of this.nodes) {
      node._update(delta)
    }

    this.lastTime = time
    window.requestAnimationFrame(this._gameLoop.bind(this))
  }

  /**
   *
   * @param {number} delta
   * @private
   */
  _start(delta) {
    for (const node of this.nodes) {
      node._ready(delta)
    }

    this.lastTime = delta
    window.requestAnimationFrame(this._gameLoop.bind(this))
  }

  /**
   *
   * @returns {Collision[]}
   */
  getCollisionsComponents() {
    return this.collisions.map((node) =>
      node.components.filter((component) => component instanceof Collision)
    )
  }
}

export const Cuarzo = new Engine()
