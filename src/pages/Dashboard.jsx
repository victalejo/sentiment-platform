// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';

const Dashboard = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        // Simulación de llamada a API para obtener datos
        fetch('https://api.example.com/data')
            .then(response => response.json())
            .then(data => setData(data))
            .catch(error => console.error('Error fetching data:', error));
    }, []);

    return (
        <div className="dashboard">
            <h1>Dashboard</h1>
            <div className="data-list">
                {data.length ? (
                    data.map((item, index) => (
                        <div key={index} className="data-item">
                            <h3>{item.title}</h3>
                            <p>{item.description}</p>
                        </div>
                    ))
                ) : (
                    <p>Cargando datos...</p>
                )}
            </div>
        </div>
    );
};

export default Dashboard;