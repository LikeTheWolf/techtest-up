import React from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

// dataset has the structure: { servers_count: [{ timestamp: string, region1: number, region2: number, ... }], ... }
interface DynamicChartsProps {
  data: any;
}

const regions = ['us_east', 'eu_west', 'eu_central', 'us_west', 'sa_east', 'ap_southeast'];
const regionColours = ['#E2C8E4', '#28E6CF', '#BFD88C', '#77B1A9', '#F3C981', '#B3D9FF'];

const DynamicCharts: React.FC<DynamicChartsProps> = ({ data }) => {
  // Render charts for each metric
  const renderChart = (metricData: any, title: string) => (
    <div style={styles.chartItem}>
      <h3>{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={metricData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" tick={false} />
          <YAxis />
          <Tooltip
            formatter={(value: any, name: string, props: any) => [
              value,
              name,
              new Date(props.payload.timestamp).toLocaleDateString('en-GB', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              }),  // Format for tooltip
            ]}
            labelFormatter={(label) =>
              new Date(label).toLocaleDateString('en-GB', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })
            }
          />
          <Legend />
          {/* Dynamically render a Line for each region */}
          {regions.map((region, index) => (
            <Line key={region} type="monotone" dataKey={region} stroke={regionColours[index]} dot={false}/>
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <div style={styles.gridContainer}>
      {/* Render a chart for each metric */}
      {data.servers_count && renderChart(data.servers_count, 'Servers Count')}
      {data.online && renderChart(data.online, 'Online Users')}
      {data.session && renderChart(data.session, 'Session Count')}
      {data.active_connections && renderChart(data.active_connections, 'Active Connections')}
      {data.wait_time && renderChart(data.wait_time, 'Wait Time')}
      {data.cpu_load && renderChart(data.cpu_load, 'CPU Load')}
    </div>
  );
};

// Basic CSS styles for the grid container and chart items
const styles = {
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',  // Changed to 3 charts per line
    gap: '20px',
    padding: '20px',
  },
  chartItem: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '20px',
    backgroundColour: '#fff',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
};

export default DynamicCharts;
