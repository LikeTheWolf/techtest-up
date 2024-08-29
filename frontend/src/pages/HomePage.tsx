import React, { useEffect, useState } from 'react';
import SocketConnector from '../SocketConnector';

const HomePage: React.FC = () => {
  const initialData: any = null;
  const [pageData, setPageData] = useState<any>(initialData);

  const stack = [];

  useEffect(() => {
    const socketConnector = new SocketConnector();
  
    socketConnector.on("data", (dataUpdate: any) => {
      if(initialData !== null){
        setPageData(dataUpdate);
      } else {
        stack.push(dataUpdate);
      }
    });

    socketConnector.on("initialData", (dataInitial: any) => {
      setPageData(dataInitial);
    });
  
    return () => {
      socketConnector.close();
    };
  }, []);

  return (
    <div>
      <h1>Welcome to the Home Page</h1>
      <p>This is the main page of the app.</p>
    </div>
  );
};

export default HomePage;
