import { app } from './app.js';
import { env } from './src/config/env.js';

app.listen(env.port, () => {
    console.log(`Server running at http://localhost:${env.port}`);
});
