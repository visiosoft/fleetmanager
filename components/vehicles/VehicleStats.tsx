import { Card } from '@nextui-org/react';

const VehicleStats = () => {
  const stats = [
    {
      title: 'Total Vehicles',
      value: '24',
      change: '+2',
      trend: 'up'
    },
    {
      title: 'Active Vehicles',
      value: '18',
      change: '+1',
      trend: 'up'
    },
    {
      title: 'In Maintenance',
      value: '4',
      change: '-1',
      trend: 'down'
    },
    {
      title: 'Inactive',
      value: '2',
      change: '0',
      trend: 'neutral'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="p-4">
          <div className="flex flex-col">
            <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
            <div className="mt-2 flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              <p className={`ml-2 text-sm font-medium ${
                stat.trend === 'up' ? 'text-success-600' :
                stat.trend === 'down' ? 'text-danger-600' :
                'text-gray-500'
              }`}>
                {stat.change}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default VehicleStats; 