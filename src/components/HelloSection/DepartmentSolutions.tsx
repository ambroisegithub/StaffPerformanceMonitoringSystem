// @ts-nocheck

import * as React from 'react';
import { FaUserTie, FaChartBar, FaBuilding } from 'react-icons/fa';

const DepartmentCard = ({ icon: Icon, title, features }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
    <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6 mx-auto">
      <Icon className="w-8 h-8 text-blue-600" />
    </div>
    <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">{title}</h3>
    <ul className="space-y-3">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center text-gray-600">
          <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
          {feature}
        </li>
      ))}
    </ul>
  </div>
);

const DepartmentSolutions = () => {
  const departments = [
    {
      icon: FaUserTie,
      title: "HR Department",
      features: [
        "Employee document management",
        "Policy distribution tools",
        "Performance review system",
        "Training record management"
      ]
    },
    {
      icon: FaChartBar,
      title: "Finance Department",
      features: [
        "Invoice management",
        "Budget tracking",
        "Financial report generation",
        "Expense documentation"
      ]
    },
    {
      icon: FaBuilding,
      title: "Administrative",
      features: [
        "Meeting minute organization",
        "Project documentation",
        "Resource sharing",
        "Department collaboration"
      ]
    }
  ];

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Department Solutions
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Tailored solutions for every department in your organization, ensuring efficient document management and seamless collaboration.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {departments.map((dept, index) => (
            <DepartmentCard key={index} {...dept} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default DepartmentSolutions;