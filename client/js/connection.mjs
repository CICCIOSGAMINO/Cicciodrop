export class ServerConnection {
  constructor () {
    this.#connect()
  }

  #connect () {
    this.#endpoint()
  }

  #endpoint () {
    const protocol = location.protocol.startsWith('https') ? 
      'wss' : 'ws'
    console.log(location)
  }

  #isConnected () {
    return this.#ws && this.#ws.readyState === this.#ws.OPEN
  }

  #isConnecting () {
    return this.#ws && this.#ws.readyState === this.#ws.CONNECTING
  }
}