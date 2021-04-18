// Coding with Node.js 15.14.0 (static, private fields/methods)
const crypto = require ('crypto')
const process = require('process')
const parser = require('ua-parser-js')
const WebSocket = require('ws')

// -------------------------------- Cicciodrop Server -----------------------------------
class CicciodropServer {
  #wss
  #rooms
  constructor (port) {
    this.#wss = new WebSocket.Server({
      port: port
    })
    this.#wss.on('connection', (ws, request) => 
      this.#onConnection(new Peer(ws, request)))
    this.#wss.on('headers', (headers, response) => 
      this.#onHeaders(headers, response))

    this.#rooms = {}

    console.log(`@SERVER >> RUN(${port})`)
  }

  #onConnection (peer) {
    console.log(`${peer}`)
  }
  #onHeaders (headers, response) {
    // check for peerid already present or set it
    console.log(`@COOKIE >> ${headers.cookie}`)
    if (response.headers.cookie && response.headers.cookie.indexOf('peerid=') > -1) return
    response.peerId = Peer.uuid()
    headers.push(`Set-Cookie: peerid=${response.peerId}; SameSite=Strict; Secure`)
  }
}

class Peer {
  #ws
  #timerId
  #lastBeat
  constructor (ws, request) {
    this.#ws = ws
    this.ip = 
      request.headers['x-forwarded-for'] || request.connection.remoteAddress
    this.id = 
      request.peerId || request.headers.cookie?.raplace('peerid=','')
    this.rtcSupported = request.url.indexOf('webrtc') > -1
    this.ua = new UserAgent(request)
    // for keepalive
    this.#timerId = 0
    this.#lastBeat = Date.now()
   }

  toString () {
    return `@PEER#${this.id} ip=${this.ip} rtcSupported=${this.rtcSupported} ${this.ua}>`
  }

  static uuid () {
    return crypto.randomUUID({
      disableEntropyCache: true
    })
  }
}

class UserAgent {
  #ua
  constructor (request) {
    this.#ua = parser(request.headers['user-agent'])
    this.os = this.#ua.os
    this.browser = this.#ua.browser
  }
  // JSON.stringify(this.ua.os, null, ' ') object print
  toString () {
    return `os=${this.os.name} browser=${this.browser.name}:${this.browser.version}`
  }
}

// --------------------------------- Process Handlers -----------------------------------
process.on('SIGINT', () => {
  console.info('@SIGINT >> Exiting ... BYE!')
  process.exit(0)
})
process.on('SIGTERM', () => {
  console.info('@SIGTERM >> Exiting ... BYE!')
  process.exit(0)
})

new CicciodropServer(8080)
