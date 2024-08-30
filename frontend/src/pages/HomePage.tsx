import { Divider, H4, Spinner } from '@blueprintjs/core';
import React, { useEffect, useState } from 'react';
import DynamicCharts from '../components/DynamicCharts'; // Make sure to import the DynamicCharts component
import SocketConnector from '../SocketConnector';

const DEFAULT_MAX_RECENT = 50;

const HomePage: React.FC = () => {
  const [initialDataRecent, setInitialDataRecent] = useState<any>(null);
  const [initialDataHistoric, setInitialDataHistoric] = useState<any>(null);
  const [loadingRec, setLoadingRec] = useState<boolean>(true);
  const [loadingHist, setLoadingHist] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    const socketConnector = new SocketConnector();
  
    socketConnector.on("data", (dataUpdate: any) => {
      const lastUpdated = getLastUpdated(dataUpdate);
      if(lastUpdated){
        setLastUpdated(lastUpdated);
      }
      console.log("got new data: " + JSON.stringify(dataUpdate));

       // Debugging check: Ensure dataUpdate is not null or undefined
       if (!dataUpdate) {
        console.warn("Received null or undefined dataUpdate, ignoring update.");
        return;
      }

      // Update initialDataRecent with new data for each key
      setInitialDataRecent((prevData: any) => {
        if (!prevData) {
          console.error("prevData is null, initializing.");
          return dataUpdate;
        }

        // Create a copy of prevData to update
        const updatedData = { ...prevData };
        let first = true;
        let maxLength = DEFAULT_MAX_RECENT;

        // Loop through each key in the incoming dataUpdate
        for (const key in dataUpdate) {
          if (dataUpdate.hasOwnProperty(key) && Array.isArray(dataUpdate[key])) {
            if (!Array.isArray(updatedData[key])) {
              updatedData[key] = []; // Ensure the key is initialized as an array if not present
            }

            if(first && updatedData[key].length > 1){
              first = false;
              maxLength = updatedData[key].length;
            }
            // Append the new data to the existing array for the given key
            updatedData[key] = [...updatedData[key], ...dataUpdate[key]];

            // Check if the length exceeds MAX_RECENT
            if (updatedData[key].length > maxLength) {
              // Remove the number of excess items from the start of the array
              updatedData[key].splice(0, updatedData[key].length - maxLength);
            }
          }
        }

        return updatedData;
      });
    });

    socketConnector.on("initialDataHistoric", (initialHist: any) => {
      setInitialDataHistoric(initialHist);
      setLoadingHist(false);
    });

    socketConnector.on("initialDataRecent", (initialRec: any) => {
      setInitialDataRecent(initialRec);
      setLoadingRec(false);
    });
  
    return () => {
      socketConnector.close();
    };
  }, []);

  return (
    <div>
      <div>

      <br></br>

      <H4>{lastUpdated ? `Recent Data (Last Updated: ${new Date(lastUpdated).toLocaleString('en-GB')})` : 'Recent Data'}</H4>
      <p></p>
        {loadingRec? (
          <Spinner intent="primary" size={50} />
        ) : (
          <DynamicCharts data={initialDataRecent} /> // Render the charts once data is loaded
        )}
      </div>

      <Divider />

      <div>
        <br></br>

        <H4>Historic Data</H4>
        <p></p>
        {loadingHist? (
          <Spinner intent="primary" size={50} />
        ) : (
          <DynamicCharts data={initialDataHistoric} /> // Render the charts once data is loaded
        )}
      </div>
    </div>
  );
};

function getLastUpdated(data: any): string | null {
  if (!data) return null;

  for (const key in data) {
    if (Array.isArray(data[key]) && data[key].length > 0 && data[key][0].timestamp) {
      // If the key is an array, it is not empty, and the first element has a timestamp
      return data[key][0].timestamp
    }
  }

  // If no timestamp is found, return null
  return null;
}

export default HomePage;
