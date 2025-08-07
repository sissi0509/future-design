
// this file is used to send xAPI statements to the LRS (Learning Record Store) not used in the current codebase
const LRS_ENDPOINT = 'https://cloud.scorm.com/tc/1G02N9ZANX/statements';
const LRS_USERNAME = 'Xi';
const LRS_PASSWORD = 'GfgJ7zalM23tuJK6GPt2rGaXLPJdKE8Nw5jL3O3X';
export const sendStatement = async (statement) => {
    try {
        const response = await fetch(LRS_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(`${LRS_USERNAME}:${LRS_PASSWORD}`)
            },
            body: JSON.stringify(statement)
        });

        if (!response.ok) {
            throw new Error(`Failed to send statement: ${response.status}`);
        }
        console.log('xAPI statement sent:', statement);
    } catch (error) {
        console.error('xAPI error:', error);
    }
};
