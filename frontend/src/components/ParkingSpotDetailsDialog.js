import React from 'react';
import { Dialog } from 'primereact/dialog';
import { MyPrimaryButton, MySecondaryButton } from './MyButtons';

const ParkingSpotDetailsDialog = ({ visible, onHide, spotHistory }) => {
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
                {spotHistory && spotHistory.length > 0 ? (
                    spotHistory[0].message ? (
                        <p>{spotHistory[0].message}</p>
                    ) : (
                        spotHistory.map((h, index) => (
                            <div key={index} style={{ paddingBottom: '10px' }}>
                                <strong>Tablica rejestracyjna:</strong> {h.licensePlate}<br />
                                <strong>Zapłacono:</strong> {h.paid}<br />
                                <strong>Start:</strong> {h.start}<br />
                                <strong>Koniec:</strong> {h.end}
                            </div>
                        ))
                    )
                ) : (
                    <p>Brak historii dla tego miejsca.</p>
                )}
            </div>
        </Dialog>
    );
};

export default ParkingSpotDetailsDialog;
