import axios from 'axios';
import { LOOKUP_ENDPOINTS } from './constants';
import StoredStatusModel, { IStoredStatusModel } from './storedStatusModel';
import { Timer } from './timer';

export class DataFetch {
  private timer: Timer;
  static socketInstance: any;

  constructor(socketInstance: any, interval: number) {
    DataFetch.socketInstance = socketInstance;
    this.timer = new Timer(interval);
    this.timer.start();
    this.timer.on('tick', DataFetch.fetchDataAndSave.bind(this));
  }

  private static async fetchDataAndSave(): Promise<void> {    
    try {
      const data = await DataFetch.fetchData();
      
      await DataFetch.saveData(data);
      //DataFetch.socketInstance.emit('data', data);
      
    } catch (error) {
      console.error('Error during data fetch or processing:', error);
    }
  }

  private static async fetchData(): Promise<IStoredStatusModel> {
    const promises: Promise<any>[] = [];
  
    // Fetch data from all endpoints
    for (const [, endpoint] of Object.entries(LOOKUP_ENDPOINTS)) {
      const promise = axios.get(endpoint).catch((error) => ({ error }));
      promises.push(promise);
    }
  
    const results = await Promise.all(promises);
  
    // Separate successful responses and errors
    const successfulResponseData = results.filter((result) => result.data).map((result) => result.data);
    const errors = results.filter((result) => result.error);
  
    // Log errors to console
    for (const error of errors) {
      console.error('Error fetching data:', error.error.message);
    }
  
    return {
      timestamp: new Date(), // Current timestamp
      regions: successfulResponseData, // Array of region status objects
    } as IStoredStatusModel;
  }

  private static async saveData(data: IStoredStatusModel): Promise<void> {
    try {
      const doc = new StoredStatusModel(data);
      await doc.save();
    } catch (error) {
      console.error('Error saving data in MongoDB:', error);
    }
  }

  public static async testFetchData(): Promise<any>{
    await DataFetch.fetchDataAndSave();
  }

  public static async fetchAggregatedData(): Promise<any> {
    try {
      
    
      return null;
           
      
    } catch (error) {
      console.error('Error fetching aggregated data from MongoDB:', error);
    }
  }

  start() {
    this.timer.start();
  }

  stop() {
    this.timer.stop();
  }
}
