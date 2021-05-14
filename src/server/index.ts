import next from 'next';
import * as fs from 'fs';
import * as https from 'https';
import expressApp from './app/app';

const port = process.env.HTTPS
    ? parseInt(process.env.PORT || '443', 10)
    : parseInt(process.env.PORT || '8080', 10);
const dev = process.env.NODE_ENV === 'development';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare()
    .then(() => {
        expressApp.get('*', (req, res) => {
            return handle(req, res);
        });
        if (process.env.HTTPS) {
            const options = {
                key: fs.readFileSync('./ssl/server.key', 'utf8'),
                cert: fs.readFileSync('./ssl/server.crt', 'utf8'),
            };
            const server = https.createServer(options, expressApp);
            server.listen(port);
        } else {
            expressApp.listen(port);
        }

        if (dev) {
            console.warn(`${dev ? 'development' : process.env.NODE_ENV}`);
            process.env.HTTPS
                ? console.warn(
                      `> Server listening at https://localhost:${port}`
                  )
                : console.warn(
                      `> Server listening at http://localhost:${port}`
                  );
        }
    })
    .catch((error) => {
        console.error(error);
    });
