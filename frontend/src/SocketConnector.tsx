import { io, Socket } from 'socket.io-client';

export default class SocketConnector {
  private socket: Socket;

  constructor() {
    const HOST = process.env.REACT_APP_SOCKET_HOST;
    const PORT = process.env.REACT_APP_SOCKET_PORT;

    console.log(`Setup up websocket on: ${HOST}:${PORT}`);

    this.socket = io(`https://${HOST}:${PORT}`, {
      transports: ['websocket'],
    });

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