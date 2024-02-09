"use client"
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../../../components/Navbar';
import axios from 'axios';
import { Card } from 'primereact/card';
import { MyPrimaryButton, MySecondaryButton } from '../../../components/MyButtons';
import { ScrollPanel } from 'primereact/scrollpanel';
import { SERVER_ADDRESS } from '../../../../utils/Links'
import { Chart } from 'primereact/chart';

export default function Summary() {
    const router = useRouter();
    const [stats, setStats] = useState([]);

    const dummyData = {
        "parking_id": "1e5bd36d-0f73-4d93-a62f-3a3c86b2330f",
        "profit_summary": [
            {
                "cost": 2450.0,
                "month": "2023-12",
                "profit": -2450.0,
                "revenue": 0.0
            },
            {
                "cost": 750.0,
                "month": "2024-01",
                "profit": -750.0,
                "revenue": 0.0
            },
            {
                "cost": 750.0,
                "month": "2024-02",
                "profit": -745.0188753923334,
                "revenue": 4.981124607666667
            },
            {
                "cost": 750.0,
                "month": "2024-03",
                "profit": -750.0,
                "revenue": 0.0
            }
        ]
    }

    // endpoint not implemented
    useEffect(() => {
        axios.get(`${SERVER_ADDRESS}/parking/summary`)
            .then(response => {
                console.log(response.data);
                setStats(response.data)
            })
            .catch(error => {
                console.error('Error fetching data 1:', error);
                setStats(dummyData)
            });
    }, []);
    if (!stats) { return <p>Waiting for summary ...</p>; }


    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});

    useEffect(() => {
        const data = {
            labels: ['Q1', 'Q2', 'Q3', 'Q4'],
            datasets: [
                {
                    label: 'Sales',
                    data: [540, 325, 702, 620],
                    backgroundColor: [
                        'rgba(255, 159, 64, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(153, 102, 255, 0.2)'
                    ],
                    borderColor: [
                        'rgb(255, 159, 64)',
                        'rgb(75, 192, 192)',
                        'rgb(54, 162, 235)',
                        'rgb(153, 102, 255)'
                    ],
                    borderWidth: 1
                }
            ]
        };
        const options = {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        };

        setChartData(data);
        setChartOptions(options);
    }, []);

    return (
        <div className="LiveView" style={style}>
            <Navbar />
            <div className="card flex justify-content-center mt-10" style={card_style}>
                <Card title={"Parking: " + stats.id} subTitle="" className="md:w-75rem">

                    <p className="m-0">Podsumowanie kosztów:</p>
                    <Chart type="bar" data={chartData} options={chartOptions} />

                </Card>
            </div>

        </div>


    );
}

const style = {
    width: "100vw",
    height: "100vh",
}

const card_style = {
    display: "flex",
    alignItems: 'center',
    justifyContent: 'center'
}
