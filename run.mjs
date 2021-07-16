import axios from 'axios';
import dayjs from 'dayjs';
import isYesterday from 'dayjs/plugin/isYesterday.js'
import isToday from 'dayjs/plugin/isToday.js'

import { config } from './config.mjs';


dayjs.extend(isYesterday);
dayjs.extend(isToday)
const api = axios.create({
    headers: {'Authorization': `Bearer ${config.todoistToken}`}
});
  
let slackMessage;
slackMessage = "*Glen Davies* posted an update for *Dotcom View Standup*\n\n";

const yesterdaysMessage = await getYesterdaysTasks();
const todaysMessage = await getTodaysTasks();

postToSlack();

async function getYesterdaysTasks() {
    return api.get('https://api.todoist.com/sync/v8/completed/get_all').then((result) => {
        const yesterdaysTasks = result.data.items.filter(item => {
            return item.project_id === config.todoistProject && dayjs(item.completed_date).isYesterday();
        }).map(item => item.content);
        let yesterdaysTasksMessage = '';
        yesterdaysTasks.forEach((task) => yesterdaysTasksMessage += formatTask(task) + "\n");
        return yesterdaysTasksMessage;
 
    });
}

async function getTodaysTasks() {
    return api.get('https://api.todoist.com/sync/v8/sync?sync_token=*&resource_types=[\"items\"]').then((result) => {
        const todaysTasks = result.data.items.filter(item => {
            return item.project_id === config.todoistProject && dayjs(item.due.date).isToday();
        }).map(item => item.content);
        let todaysTasksMessage = '';
        todaysTasks.forEach((task) => todaysTasksMessage += formatTask(task) + "\n");
        return todaysTasksMessage;
    })
}


async function postToSlack() {
  const url = 'https://slack.com/api/chat.postMessage';
  const res = await axios.post(url, {
    channel: config.slackChannel,
      text: slackMessage,
      "attachments": [
        {
	        "mrkdwn_in": ["text"],
            "color": "#dedede",
            "title": "How do you feel today?",
            "text": ":green-dot:",
          },
        {
	        "mrkdwn_in": ["text"],
            "color": "#bbd4d5",
            "title": "What did you do yesterday?",
            "text": yesterdaysMessage,
          },
          {
	        "mrkdwn_in": ["text"],
            "color": "#7a90b2",
            "title": "What will you do today?",
            "text": todaysMessage,
          },
          {
	        "mrkdwn_in": ["text"],
            "color": "#df9593",
            "title": "Anything blocking your progress?",
            "text": "No",
        }
    ],
    unfurl_links: false,
    unfurl_media: false
  }, { headers: { authorization: `Bearer ${config.slackToken}` } });
}

function formatTask(task) {
    const markdownLinkRegex = /\[(.*)\]\(((?:\/|https?:\/\/)[\w\d.\/?=#-_]+)\)/g;
    const linkedTask = task.replace(markdownLinkRegex, "<$2|$1>");

    return `• ${linkedTask}`;
}