import fs from 'fs';
import path from 'path';
import axios from 'axios';



async function retrieveCreds(sessionId, saveDir = path.join(process.cwd(), "session")) {
    const code = sessionId.split("-").pop();
    const url = `https://cdn-haki.zone.id/files/${code}.json`;
    const { data } = await axios.get(url, { responseType: "arraybuffer" });
    if (!fs.existsSync(saveDir)) {
        fs.mkdirSync(saveDir, { recursive: true });
    }
    const savePath = path.join(saveDir, "creds.json");
    fs.writeFileSync(savePath, data);
    return savePath;
}
export default retrieveCreds