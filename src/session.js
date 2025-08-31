import fs from 'fs';
import path from 'path';
import axios from 'axios';

async function savesess(sessionUrl) {
    const folder = path.join(process.cwd(), 'session');
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
    }
    const response = await axios.get(sessionUrl, { responseType: 'arraybuffer' });
    const filePath = path.join(folder, 'creds.json');
    fs.writeFileSync(filePath, response.data);
    return filePath;
}
export default savesess