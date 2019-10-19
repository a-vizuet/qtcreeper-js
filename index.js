const fs = require('fs');

const puppeteer = require('puppeteer');
const chalk = require('chalk');

let config = require('./helpers/config').CONFIG;
let visitedUsers = [];

const rdln = require('readline')
  .createInterface({ input: process.stdin, output: process.stdout });

let firstTime = true;

main();

async function main() {
  if (firstTime) {
    console.log(chalk.bold('Loading files...'));
    await loadFiles();
    console.log(chalk.bold.green('Config files loaded!'));
    firstTime = false;
  }

  console.log(config);

  rdln.question(chalk`
  Please select an option and press enter:
    1 - set username and password (${!config.password && !config.username ? 'NOT SET!' : config.username})
    2 - set gender and age range (${config.sex.join(' and ')}, ${config.age1} to ${config.age2})
    3 - set continents (${config.continents})
    4 - set countries (${config.countries.length > 0 ? config.countries.join(',') : 'All'})
    5 - set keywords (${config.keywords.length > 0 ? config.keywords.join(',') : 'None'})
    6 - set creeper speed (not implemented yet)
    7 - set maximum qts to creep (not implemented yet)
    8 - clear users already visited file (${visitedUsers.length} users visited)
    9 - run creeper!\n> `, triggerOption);
}

function loadFiles() {
  return new Promise(res => {
    fs.readFile('config.json', (err, data) => {
      if (err) {
        saveConfigFile();
      } else {
        config = JSON.parse(data.toString('utf-8'));
      }
    });

    fs.readFile('users_visited.txt', (err, data) => {
      if (err) {
        saveUsersFile();
        res();
      } else {
        visitedUsers = data.toString('utf-8').length > 0 ? data.toString('utf-8').split('\r\n') : [];
        res();
      }
    });
  });
}

function saveConfigFile() {
  console.log(config);
  fs.writeFile('config.json', JSON.stringify(config), err => {
    if (err) {
      console.log(chalk.bold.red(err));
      process.exit(1);
    }
  });
}

function saveUsersFile() {
  fs.writeFile('users_visited.txt', '', err => {
    if (err) {
      console.log(chalk.bold.red(err));
      process.exit(1);
    } else {
      visitedUsers = [];
    }
  });
}

function setUsernameAndPassword(u, p) {
  config.username = u;
  config.password = p;

  saveConfigFile();
}

function repeatQuestion() {
  rdln.question(chalk`> `, triggerOption);
}

function triggerOption(opt) {
  switch (Number(opt)) {
    case 1:
      let username;
      let password;
      rdln.question(chalk('Enter username or email address:\n> '), inp => {
        username = inp;
        
        rdln.question(chalk('Enter password:\n> '), ans => {
          password = ans;

          setUsernameAndPassword(username, password);

          main();
        });
      
      });
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
      config.username ? creep() : console.log('Set username and password first!');
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
  const p = await b.newPage();

  p.setRequestInterception(true);
  p.on('request', handleRequest);

  console.log(chalk.bold.bold('Attempting to log in...'));
  let i = await p.goto('https://www.interpals.net/app/auth/login');

  /* Manual log in */
  await p.focus('#topLoginEmail');
  await p.keyboard.type(config.username);
  await p.focus('#topLoginPassword');
  await p.keyboard.type(config.password);
  await p.click('input[value="Sign In"]');

  i = await p.goto('https://www.interpals.net');
  let html = await i.text();

  if (html.includes('My Profile')) {
    console.log(chalk.bold.green('Logged in!'));
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

  for (let i = 0; i < users.length; i++) {
    await p.goto(`https://www.interpals.net/${users[i]}`);
    console.log(`User ${users[i]} has been visited`);
  }

}

function handleRequest(r, ...args) {
  const url = r.url();

  if (url === 'https://www.interpals.net/app/search?sex=female&continents=EU') {
    // build url
    console.log('search');

  }

  return r.continue();

}

function handleUsers(html) {
  const users = html.match(/Report ([a-zA-Z0-9\-_]+) to moderators/g);
  console.log(users);
  return users.length > 0 ?
    users.map(u => u.slice(7, u.length - 14)) : [];
}

function buildSearch() { }
