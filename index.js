const puppeteer = require('puppeteer');
const chalk = require('chalk');

const rdln = require('readline')
  .createInterface({ input: process.stdin, output: process.stdout });

main();

function main() {
  // load already saved info and set it
  rdln.question(chalk`
  Please select an option and press enter:
    1 - set username and password
    2 - set gender and age range
    3 - set continents
    4 - set countries
    5 - set keywords
    6 - set creeper speed
    7 - set maximum qts to creep
    8 - clear users already visited file
    9 - run creeper!\n> `, triggerOption);
}

function repeatQuestion() {
  rdln.question(chalk`> `, triggerOption);
}

function triggerOption(opt) {
  switch (Number(opt)) {
    case 1:
      break;
    case 2:
      break;
    case 3:
      break;
    case 4:
      break;
    case 5:
      break;
    case 6:
      break;
    case 7:
      break;
    case 8:
      break;
    case 9:
      break;
    default:
      console.log('Not a valid option');
      repeatQuestion();
      break;
  }
}

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
    await b.close();
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
    await b.close();
    process.exit(0);
  }

}

function handleRequest(r, ...args) {
  const url = r.url();

  if (url === 'https://www.interpals.net/app/auth/login') {
    console.log('login');
    const data = {
      'method': 'POST',
      'postData': 'username=user@name.com&password=pwd'
    };

    return r.continue(data);
  }

  else if (url === 'https://www.interpals.net/app/search') {
    // build url
    console.log('search');


  }

  return r.continue();

}

function handleUsers(html) {
  const users = html.match(/[/]+[\w]+[?]+utm_medium=pp-userlink/g);

  return users.length > 0 ?
    users.map(u => u.split('?utm_medium=pp-userlink')[0]) : [];
}

function buildSearch() { }
