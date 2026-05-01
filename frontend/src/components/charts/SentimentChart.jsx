// src/components/charts/SentimentChart.jsx

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SentimentChart = ({ data }) => {
    const chartData = [
        { name: 'Muy Positivo', value: data.very_positive },
        { name: 'Positivo', value: data.positive },
        { name: 'Neutral', value: data.neutral },
        { name: 'Negativo', value: data.negative },
        { name: 'Muy Negativo', value: data.very_negative },
    ];

    const COLORS = ['#4caf50', '#8bc34a', '#ffeb3b', '#ff9800', '#f44336'];

    return (
        <ResponsiveContainer width="100%" height={400}>
            <PieChart>
                <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={150}
                    fill="#8884d8"
                    label
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default SentimentChart;
