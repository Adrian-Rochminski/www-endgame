import React from 'react';
import { Dialog } from 'primereact/dialog';
import { MyPrimaryButton, MySecondaryButton } from './MyButtons';

const ParkingSpotDetailsDialog = ({ visible, onHide, spotHistory, currentUsage }) => {
    const dialogFooter = (
        <div>
            <MyPrimaryButton label="Zamknij" onClick={onHide} />
        </div>
    );

    const scrollableContentStyle = {
        maxHeight: '300px',
        overflowY: 'auto',
        padding: '1em'
    };

    return (
        <Dialog header="Szczegóły miejsca parkingowego" visible={visible} style={{ width: '30vw' }} footer={dialogFooter} onHide={onHide}>
            <div style={scrollableContentStyle}>
                {currentUsage && currentUsage.length > 0 ? (
                    <div>
                        <strong><h3 style={{fontSize: '1.5em'}}>Aktualne użycie</h3></strong>
                        {currentUsage.map((usage, index) => (
                            <div key={`current-${index}`} style={{ paddingBottom: '10px' }}>
                                <strong>Pojazd:</strong> {usage.car}<br />
                                <strong>Start:</strong> {new Date(usage.start_time).toLocaleString('pl-PL')}<br />
                                {usage.end_time && <><strong>Koniec:</strong> {new Date(usage.end_time).toLocaleString('pl-PL')}<br /></>}
                            </div>
                        ))}
                    </div>
                ) : <p>Aktualnie brak użytkowania.</p>}
                {spotHistory && spotHistory.length > 0 ? (
                    spotHistory[0].message ? (
                        <p>{spotHistory[0].message}</p>
                    ) : (
                        <div>
                            <strong><h3 style={{fontSize: '1.5em'}}>Historia</h3></strong>
                            {spotHistory.map((h, index) => (
                                <div key={index} style={{ paddingBottom: '10px' }}>
                                    <strong>Tablica rejestracyjna:</strong> {h.licensePlate}<br />
                                    <strong>Zapłacono:</strong> {h.paid}<br />
                                    <strong>Start:</strong> {h.start}<br />
                                    <strong>Koniec:</strong> {h.end}
                                </div>
                            ))}
                        </div>
                    )
                ) : <p>Brak historii dla tego miejsca.</p>}
            </div>
        </Dialog>
    );
};


export default ParkingSpotDetailsDialog;
