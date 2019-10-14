const puppeteer = require('puppeteer');
const chalk = require('chalk');

creep();

async function creep() {
  console.log(chalk.bold('Launching chromium instance...'));
  const b = await puppeteer.launch();
  console.log(chalk.bold.green('Now, to interpals!'));

  const p = await b.newPage();
  
  p.setRequestInterception(true);
  p.on('request', handleRequest);

  let i = await p.goto('https://www.interpals.net/app/auth/login');
  
  let html = await i.text();
  
  if (html.includes('You are currently logged')) {
    console.log(chalk.bold.green('Already logged.'));
  } else {
    console.log(chalk.bold.red('Error trying to log in.'));
    process.exit(1);
  }

  console.log(chalk.bold('Searching for users...\n'));

  i = await p.goto('https://www.interpals.net/app/search');

  html = await i.text();

  const users = handleUsers(html);

  if (users.length > 0) {
    console.log(chalk.bold(`Found ${users.length} users. Starting to creep.\n`));
  } else {
    console.log(chalk.bold.red(`Found 0 users.`));
    process.exit(0);
  }

}

function handleRequest(r, ...args) {
  const data = {
    'method': 'POST',
    'postData': 'username=user@name.com&password=pwd'
  };

  r.continue(data);
}

function handleUsers(html) {
  const users = html.match(/[/]+[\w]+[?]+utm_medium=pp-userlink/g);
  
  return users.map(u => u.split('?utm_medium=pp-userlink')[0]);

}