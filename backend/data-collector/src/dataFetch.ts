import axios from 'axios';
import { LOOKUP_ENDPOINTS } from './constants';
import { aggregationPipeline } from './dataAggregations';
import StoredStatusModel, { IStoredStatusModel } from './storedStatusModel';
import { Timer } from './timer';

const GRANULARITY = 20;
const RECENT_NUM_RECORDS = 100;
export class DataFetch {
  private timer: Timer;
  private socketInstance: any;

  constructor(socketInstance: any, interval: number) {
    this.socketInstance = socketInstance;
    this.timer = new Timer(interval);
    this.timer.start();
    this.timer.on('tick', this.fetchDataAndSave.bind(this));
  }

  private async fetchDataAndSave(): Promise<void> {    
    try {
      const data = await this.fetchData();
      const saved = await this.saveData(data);
      const pipeline = aggregationPipeline();

      // Use the existing aggregation pipeline on the newly saved document
      const [aggregatedResult] = await StoredStatusModel.aggregate([
        { $match: { _id: saved._id } }, // Match the saved document by its ID
        ...pipeline,
      ]);

      this.socketInstance.emit('data', aggregatedResult);
      
    } catch (error) {
      console.error('Error during data fetch or processing:', error);
    }
  }

  private async fetchData(): Promise<IStoredStatusModel> {
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
      timestamp: new Date(),
      regions: successfulResponseData, // Array of region status objects
    } as IStoredStatusModel;
  }

  private async saveData(data: IStoredStatusModel): Promise<any> {
    try {
      const doc = new StoredStatusModel(data);
      const result = await doc.save();
      return result;
    } catch (error) {
      console.error('Error saving data in MongoDB:', error);
    }
  }

  public static async fetchAggregatedDataHistoric(): Promise<any> {
    try {
      const pipelineHistoric = aggregationPipeline(GRANULARITY);
      
      const resultHistoric = await StoredStatusModel.aggregate(pipelineHistoric);

      // destructure first element to get clean result
      const [formattedResult] = resultHistoric.length > 0 ? resultHistoric : [{}];

      return formattedResult;          
    } catch (error) {
      console.error('Error fetching aggregated data from MongoDB:', error);
    }
  }

  public static async fetchAggregatedDataRecent(): Promise<any> {
    try {
      const pipelineRecent = aggregationPipeline(undefined, RECENT_NUM_RECORDS);

      const resultRecent = await StoredStatusModel.aggregate(pipelineRecent);

      // destructure first element to get clean result
      const [formattedResult] = resultRecent.length > 0 ? resultRecent : [{}];

      return formattedResult;          
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
