import * as React from 'react';

interface StatisticProps {
  label: string;
  value: string;
}

const Statistic: React.FC<StatisticProps> = ({ label, value }) => {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold text-gray-900">{value}</div>
      <div className="text-gray-600">{label}</div>
    </div>
  );
};

export default Statistic;
