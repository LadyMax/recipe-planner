// A Node.js based start up for the C#-based backend
// (integrates with React Rapide that starts the index.js file in backend)
// Allows the backend to start running as we start the Vite dev server!

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import proxy from 'express-http-proxy';
import { isFreePort } from 'find-free-ports';
import chokidar from 'chokidar';

export default function startBackend(app) {

  app.disable('x-powered-by');

  let message = `<pre>
    In order to see something meaningful here
    run <b>npm run build</b> that compiles/builds
    your Vite-based project to the dist folder first.

    Then you can see the production version of the app
    served from the dist folder here.
  </pre>`;

  // Create the dist folder if it does not exist
  const distFolder = path.join(import.meta.dirname, '..', 'dist');
  fs.existsSync(distFolder) || (
    fs.mkdirSync(distFolder),
    fs.writeFileSync(path.join(distFolder, 'index.html'), message, 'utf-8')
  );

  // Calculate db path
  const dbPath = path.join(import.meta.dirname, '_db.sqlite3');

  // Calculate db template path
  const dbTemplatePath = path.join(import.meta.dirname, 'db_template', '_db.sqlite3');

  // Copy the database from template folder to backend folder if it does not exist there
  fs.existsSync(dbPath) || fs.copyFileSync(dbTemplatePath, dbPath);

  // Port to start the backend on
  let startPort = 5001;

  // Start .NET backend from Node.js
  setTimeout(async function starter(initialStart = true) {

    // Check if port 5001 is available, if not, show error
    if (!await isFreePort(startPort)) {
      console.error(`❌ Port ${startPort} is already in use! Please stop the process using this port or change the port in backend/index.js`);
      console.error(`You can check which process is using the port with: netstat -ano | findstr :${startPort}`);
      process.exit(1);
    }
    let backendProcess = spawn(
      `dotnet run ${startPort} "${distFolder}" "${dbPath}"`,
      { cwd: import.meta.dirname, stdio: 'inherit', shell: true }
    );

    // Proxy traffic to the backend if the request starts with /api
    initialStart && app.use('/api', (req, res, next) => {
      proxy(`localhost:${startPort}`, {
        proxyReqPathResolver(req) {
          return '/api' + req.url;
        }
      })(req, res, next);
    });

    // Kill the backend process on exit
    process.on('exit', () => backendProcess.kill());

    // Listen to changes to backend source code and restart the backend
    initialStart && chokidar.watch(path.join(import.meta.dirname, 'src'))
      .on('all', (event, path) => {
        if (event === 'change' && (path + '').endsWith('.cs')) {
          backendProcess.kill();
          console.log(event, path);
          console.log('\nRestarting backend because of changes to source!\n');
          starter(false);
        }
      });

    // Extra message (info about ports)
    initialStart && setTimeout(() => {
      console.log(
        '✅ Started C#/.NET based Minimal API\n' +
        '\n📋 Port Configuration:\n' +
        `   Frontend (Vite): http://localhost:5173\n` +
        `   Backend (API):   http://localhost:${startPort}\n` +
        '\n💡 Note: Visit the Vite Dev Port (5173) for all requests,\n' +
        '   unless you want to check a build, then visit the backend port directly.\n');
    }, 3000);
  }, 1);

}