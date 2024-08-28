import axios from 'axios';
import { LOOKUP_ENDPOINTS } from './constants';
import StoredStatusModel, { IStoredStatusModel } from './storedStatusModel';
import { Timer } from './timer';

export class DataFetch {
  private timer: Timer;

  constructor(interval: number) {
    this.timer = new Timer(interval);
    this.timer.start();
    this.timer.on('tick', DataFetch.fetchDataAndSave.bind(this));
  }

  private static async fetchDataAndSave(): Promise<void> {    
    try {
      const data = await DataFetch.fetchData();
      
      // Process the data
      await DataFetch.saveData(data);
      
    } catch (error) {
      console.error('Error during data fetch or processing:', error);
    }
  }

  private static async fetchData(): Promise<IStoredStatusModel[]> {
    const promises: Promise<any>[] = [];
    // we also have access to location key string here if needed (",")
    for(const [, endpoint] of Object.entries(LOOKUP_ENDPOINTS)){
      const promise = axios.get(endpoint).catch(error => ({ error }))
      promises.push(promise);
    }

    const results = await Promise.all(promises)

    // Separate successful responses and errors
    const successfulResponseData = results.filter(result => result.data).map(result => result.data);
    const errors = results.filter(result => result.error);

    // Log errors to console
    for (const error of errors) {
      console.error('Error fetching data:', error.error.message);
    }

    return successfulResponseData;
  }

  private static async saveData(data: IStoredStatusModel[]): Promise<void> {
    try {
      for (const entry of data) {
        const storedStatusDocument = new StoredStatusModel(entry);
  
        await storedStatusDocument.save();
      }
    } catch (error) {
      console.error('Error saving data in MongoDB:', error);
    }
  }

  public static async testFetchData(): Promise<any>{
    await DataFetch.fetchDataAndSave();
  }

  start() {
    this.timer.start();
  }

  stop() {
    this.timer.stop();
  }
}
