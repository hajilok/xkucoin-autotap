import { promises as fs } from 'fs';
import FormData from 'form-data';
import axios from "axios";
import chalk from 'chalk';  // Tambahan untuk warna
import figlet from 'figlet';  // Tambahan untuk banner
import ora from 'ora';  // Tambahan untuk animasi spinner

const formData = new FormData();

const header = async (cookie = null) => {
  const baseHeaders = {
    "accept": "application/json",
    "accept-language": "en-US,en;q=0.9",
    "content-type": "application/json",
    "sec-ch-ua": "\"Chromium\";v=\"111\", \"Not(A:Brand\";v=\"8\"",
    "sec-ch-ua-mobile": "?1",
    "sec-ch-ua-platform": "\"Android\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "x-request-with": "null",
  };

  if (cookie) {
    baseHeaders['cookie'] = cookie;
  }

  return baseHeaders;
};

const loginKucoin = async (data) => {
  try {
    const getHeader = await header();
    const KucoinLogin = await axios.post('https://www.kucoin.com/_api/xkucoin/platform-telebot/game/login?lang=en_US', data, {
      headers: getHeader,
      withCredentials: true
    });

    if (KucoinLogin.data.success == false) {
      console.log(chalk.red('Login failed:', KucoinLogin.data));
      return false;
    } else if (KucoinLogin.data.success === true) {
      const cookies = KucoinLogin.headers['set-cookie'];
      const sendHeader = await header(cookies);
      return sendHeader;
    }
  } catch (error) {
    console.log(chalk.red('Error during login:', error));
  }
};

const userInfo = async (header) => {
  const getUser = await axios.get('https://www.kucoin.com/_api/xkucoin/platform-telebot/game/campaign/info?lang=en_US', {
    headers: header
  });
  return getUser.data.msg;
};

const tapTap = async (data, header) => {
  const gasTap = await axios.post('https://www.kucoin.com/_api/xkucoin/platform-telebot/game/gold/increase?lang=en_US', data, {
    headers: {
      ...header,
      ...formData.getHeaders()
    }
  });
  if (gasTap.data.success == true) {
    return true;
  } else {
    return false;
  }
};

// Function untuk membuat countdown dengan animasi spinner
const countdown = async (duration) => {
  let spinner = ora({
    text: `Countdown starts... ${duration} seconds remaining`,
    spinner: 'bouncingBar', // Animasi spinner
  }).start();

  for (let i = duration; i >= 0; i--) {
    spinner.text = chalk.blue(`Countdown: ${i} seconds remaining`);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Tunggu 1 detik
  }

  spinner.succeed(chalk.green('Countdown complete!'));
};

// Membuat banner dengan figlet
const displayBanner = () => {
  console.log(chalk.cyan(figlet.textSync('Makmum Airdrop', {
    font: 'Slant',
    horizontalLayout: 'default',
    verticalLayout: 'default',
    width: 80,
    whitespaceBreak: true
  })));
};

const main = async () => {
  displayBanner(); // Menampilkan banner

  const data = (await fs.readFile('data.txt', 'utf-8')).replace(/\r/g, "").split('\n').filter(Boolean);
  if (data.length === 0) {
    console.log(chalk.red('Error: your query is none'));
    return;
  }

  formData.append('increment', '60');
  formData.append('molecule', '3000');

  while (true) {
    for (let i = 0; i < data.length; i++) {
      const token = data[i];
      const params = new URLSearchParams(token);
      const user = decodeURIComponent(params.get('user'));
      const chat_instance = params.get('chat_instance');
      const chat_type = params.get('chat_type');
      const start_param = params.get('start_param');
      const auth_date = params.get('auth_date');
      const hash = params.get('hash');

      const payload = {
        extInfo: {
          hash: hash,
          auth_date: auth_date,
          via: "miniApp",
          user: user,
          chat_type: chat_type,
          chat_instance: chat_instance,
          start_param: start_param
        }
      };

      const getLogin = await loginKucoin(payload);
      if (!getLogin === true) {
        console.log(chalk.red('Error to login user , I don\'t know'));
        break;
      } else {
        const getUser = await userInfo(getLogin);
        const getNama = JSON.parse(user);
        console.log(chalk.green(`${getUser} Login from account ${getNama.first_name} ${getNama.last_name} Dengan Username ${getNama.username}`));
      }

      const tap = await tapTap(formData, getLogin);
      if (tap == true) {
        console.log(chalk.green('Successfully Auto Tap 60'));
      } else {
        console.log(chalk.red('Error from tap'));
      }
    }

    // Setelah memproses semua data, jalankan countdown 1 menit
    await countdown(60);
  }
};

main();
