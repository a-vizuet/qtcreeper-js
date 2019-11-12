const fs = require('fs');

const puppeteer = require('puppeteer');
const chalk = require('chalk');

let config = require('./helpers/config').CONFIG;
const I_SEARCH = require('./helpers/constants').INTERPALS_SEARCH;
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

async function loadFiles() {
  return new Promise(res => {
    fs.readFile('config.json', (err, data) => {
      if (err) {
        saveConfigFile();
      } else {
        config = JSON.parse(data.toString('utf-8'));
      }
    });

    fs.readFile('users_visited.txt', async (err, data) => {
      if (err) {
        await saveUsersFile();
        res();
      } else {
        visitedUsers = data.toString('utf-8').length > 0 ? data.toString('utf-8').split('\n') : [];
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
  return new Promise(res => {
    fs.writeFile('users_visited.txt', visitedUsers.toString().replace(/,/g, '\n'), err => {
      if (err) {
        console.log(chalk.bold.red(err));
        process.exit(1);
      } else {
        res();
      }
    });
  });
}

function setConfig(configs, data) {
  configs.forEach((c, i) => config[c] = data[i])

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

          setConfig(['username', 'password'], [username, password]);

          main();
        });
      
      });
      break;
    case 2:
      let genders;
      let minAge;
      let maxAge;
      rdln.question(chalk('What genders to crawl? 1 = female, 2 = male, 3 = both\n> '), genderInp => {
        switch(Number(genderInp)) {
          case 1:
            genders = ['female'];
            break;
          case 2:
            genders = ['male'];
            break;
          default:
            genders = ['female', 'male'];
            break;
        } 

        rdln.question(chalk('Minimum age?\n> '), minAgeInp => {
          minAge = minAgeInp;

          rdln.question(chalk('Maximum age?\n> '), maxAgeInput => {
            maxAge = maxAgeInput;

            setConfig(['sex', 'age1', 'age2'], [genders, minAge, maxAge]);

            main();
          });
        });
      }); 
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
      if (config.username) {
        creep();
      } else {
        console.log('Set username and password first!\n');
        main();
      }
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

  let finishedUsers = false;
  let page = 0;
  let online = true;

  do {
    i = await buildSearch(p, page, online);
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
      if (!visitedUsers.includes(users[i])) {
        try {
          await visitUser(p, users[i]);
        } catch (error) {
          await visitUser(p, users[i]);
        }
      } else {
        console.log(`User ${users[i]} already visited. Skipping...`);
      }
    }

    page++;
  } while (!finishedUsers);

}

function handleUsers(html) {
  const users = html.match(/Report ([a-zA-Z0-9\-_]+) to moderators/g);
  return users.length > 0 ?
    users.map(u => u.slice(7, u.length - 14)) : [];
}

function buildSearch(p_instance, page, online) {
  let searchURL = I_SEARCH;

  console.log(page);

  if (online) {
    searchURL += `offset=${page * 20}&online=1&age1=${config.age1}&age2=${config.age2}`;

    for (const i in config.sex) {
      searchURL += `&sex=${config.sex[i]}`;
    }
  }

  console.log(searchURL);
  return p_instance.goto(searchURL);
}

async function visitUser(p, user) {
  await p.goto(`https://www.interpals.net/${user}`);
  visitedUsers.push(user);
  console.log(`User ${user} has been visited`);
  await saveUsersFile();
}
