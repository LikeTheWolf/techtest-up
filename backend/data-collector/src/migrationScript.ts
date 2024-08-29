import { Document } from 'mongoose';
import { connectToDatabase } from './database';
import StoredStatusModel from './storedStatusModel';

// Define the Mongoose schema for the original data
interface IRegionStatus {
  status: string;
  region: string;
  roles: string[];
  results: any; // Update with the correct type if available
  strict: boolean;
  server_issue: any;
}

interface IStoredStatusModel extends Document {
  timestamp: Date;
  regions: IRegionStatus[];
}

// Existing model for the old schema
async function migrateData() {
  try {
    // Step 1: Retrieve all documents from the collection
    const allDocuments = await StoredStatusModel.find({});

    // Step 2: Group documents by minute
    const groupedData: { [key: string]: any[] } = {}; // Use 'any' to handle various data formats

    allDocuments.forEach((doc: any) => {
      const minuteKey = new Date(doc._doc.timestamp).toISOString().slice(0, 16); // Extract the minute part of the timestamp

      if (!groupedData[minuteKey]) {
        groupedData[minuteKey] = [];
      }

      // Transform the old format into the new format
      const regionStatus: any = {
        status: doc._doc.status,
        region: doc._doc.region,
        roles: doc._doc.roles,
        results: doc._doc.results,
        strict: doc._doc.strict,
        server_issue: doc._doc.server_issue,
      };

      groupedData[minuteKey].push(regionStatus);
    });

    // Step 3: Combine grouped documents into the new format
    const consolidatedDocuments = Object.entries(groupedData).map(([minute, docs]) => {
      return {
        timestamp: new Date(minute), // Set the consolidated timestamp for this group
        regions: docs, // All region statuses grouped under the same timestamp
      };
    });

    // Step 4: Save the new documents
    for (const consolidatedDoc of consolidatedDocuments) {
      const newDocument = new StoredStatusModel(consolidatedDoc); // Create new model instance with the updated schema
      console.log('Prepared Document:', newDocument); // For debugging, show the document to be saved

      await newDocument.save(); // Uncomment this line to actually save after verifying
    }

    console.log('Data migration completed successfully');
  } catch(error){
    console.log(error);
  }
};

// Function to delete documents that do not have the 'regions' field
async function deleteOldDocuments() {
  try {
    const result = await StoredStatusModel.deleteMany({
      regions: { $exists: false } // Remove documents where 'regions' field does not exist
    });

    console.log(`Deleted ${result.deletedCount} old documents without the 'regions' field.`);
  } catch (error) {
    console.error('Error deleting old documents:', error);
  }
}

(async () => {
  await connectToDatabase();
  await migrateData();
  await deleteOldDocuments(); // Call the function to delete old documents
})();
