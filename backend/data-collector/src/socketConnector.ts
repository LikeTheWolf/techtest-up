import * as socketio from 'socket.io';

export default class SocketManager {
  private io: socketio.Server;
  private callback: any;
  
  constructor(server: any) {
    this.io = new socketio.Server(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });
    console.log(`WebSocket server listening...`);

    // Handle incoming socket connections
    this.io.on('connection', (socket: any) => {
      console.log('User connected to socket:', socket.id);

      socket.on('disconnect', () => {
        console.log('User disconnected from socket:', socket.id);
      });

      socket.on('message', (data: any) => {
        console.log('Received message:', JSON.stringify(data));
      });
      socket.on('fetchTime', (data:any) =>{
        
        if(this.callback){
          this.callback(data);
        }
      });
    });
  }

  // Method to emit events to all connected clients
  public emit(event: string, data: any): void {
    this.io.emit(event, data);
  }

  // Method to close the WebSocket server
  public close(): void {
    this.io.close();
  }

  // Method to emit events to all connected clients
  public on(event: string, callback: (...args: any[]) => void): void {
    this.io.on(event, callback);
  }

  public addFetchTimeCallback(callback: any){
    this.callback = callback;
  }
}
