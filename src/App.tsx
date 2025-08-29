import { useEffect, useState } from 'react'
import './App.css'
import {default as LaunchDataTable} from './components/LaunchDataTable'
import { Typography } from '@mui/material';




function App() {
  const [launchData, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true)
    fetch('../space-x-launch.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
         console.log('API response:', data);
        setData(data);
        setLoading(false);
      })
      .catch(error => {
        setError(error);
        setLoading(false);
      });
  }, []);


  if (loading) {
    return <div>Loading...</div>;
  }
 
  if (error) {
    return <div>Error...</div>;
  }
 


  return <main>
    <Typography variant="h2" gutterBottom component="div">
      Space X Launch Dashboard
    </Typography>
    <LaunchDataTable data={launchData} />
  </main>
}

export default App
