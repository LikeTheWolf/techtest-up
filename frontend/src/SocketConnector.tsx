import { io, Socket } from 'socket.io-client';

export default class SocketConnector {
  private socket: Socket;

  constructor() {
    const PROTOCOL = process.env.REACT_APP_SOCKET_PROTOCOL;
    const HOST = process.env.REACT_APP_SOCKET_HOST;
    const PORT = process.env.REACT_APP_SOCKET_PORT;

    //in dev this should be https://localhost:5000      PROTOCOL://HOST:PORT
    //in prod this should be wss://ws.likethewolf.org    PROTOCOL://HOST

    console.log(`Setup up websocket on: ${PROTOCOL}://${HOST}:${PORT}`);

    if(PROTOCOL === 'wss'){
      this.socket = io(`${PROTOCOL}://${HOST}`, {
        path: '/socket.io',  // Ensure the path matches the backend configuration
        transports: ['websocket'],
        secure: true,  // Ensure it's secure (wss)
      });
    } else {
      this.socket = io(`${PROTOCOL}://${HOST}:${PORT}`, {
        transports: ['websocket'],
      });
    }

    this.socket.on('connect', () => {
      console.log('Connected to socket:', this.socket.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket:', this.socket.id);
    });
  }

  public on(event: string, callback: (data: any) => void): void {
    this.socket.on(event, callback);
  }

  public off(event: string, callback: (data: any) => void): void {
    this.socket.off(event, callback);
  }

  public emit(event: string, data: any): void {
    this.socket.emit(event, data);
  }

  public close(): void {
    this.socket.close();
  }
}