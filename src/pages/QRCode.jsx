
export default function QRCode() {


    return (
        <div className="p-4 text-center space-y-4">
            <h2 className="text-xl font-semibold">🎉 You have completed all steps!</h2>
            <p>Thank you for participating in the study.</p>


            <div className="mt-6">
                <p>scan this QR code:</p>
                <img
                    src={``}
                    alt="Prolific Completion QR"
                    className="mx-auto"
                />
            </div>
        </div>
    );
}
