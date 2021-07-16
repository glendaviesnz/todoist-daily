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
slackMessage = "*Glen Davies* posted an update for *Dotcom View Standup*\n\n*How do you feel today?*\n\n:green-dot:\n\n*What did you do yesterday?*\n\n";

const yesterdaysMessage = await getYesterdaysTasks();
const todaysMessage = await getTodaysTasks();
slackMessage += yesterdaysMessage + todaysMessage;
postToSlack();

async function getYesterdaysTasks() {
    return api.get('https://api.todoist.com/sync/v8/completed/get_all').then((result) => {
        const yesterdaysTasks = result.data.items.filter(item => {
            return item.project_id === config.todoistProject && dayjs(item.completed_date).isYesterday();
        }).map(item => item.content);
        let yesterdaysTasksMessage;
        yesterdaysTasks.forEach((task) => yesterdaysTasksMessage += formatTask(task) + "\n");
        return yesterdaysTasksMessage;
 
    });
}

async function getTodaysTasks() {
    return api.get('https://api.todoist.com/sync/v8/sync?sync_token=*&resource_types=[\"items\"]').then((result) => {
        const todaysTasks = result.data.items.filter(item => {
            return item.project_id === config.todoistProject && dayjs(item.due.date).isToday();
        }).map(item => item.content);
        let todaysTasksMessage;
        todaysTasksMessage += "\n\n*What will you do today?*\n\n";
        todaysTasks.forEach((task) => todaysTasksMessage += formatTask(task) + "\n");
        todaysTasksMessage += "\n\n*Anything blocking your progress?*\n\nNo";
        return todaysTasksMessage;
    })
}


async function postToSlack() {
  const url = 'https://slack.com/api/chat.postMessage';
  const res = await axios.post(url, {
    channel: config.slackChannel,
      text: slackMessage,
      unfurl_links: false,
      unfurl_media: false
  }, { headers: { authorization: `Bearer ${config.slackToken}` } });
}

function formatTask(task) {
    const markdownLinkRegex = /\[(.*)\]\(((?:\/|https?:\/\/)[\w\d.\/?=#-_]+)\)/g;
    const linkedTask = task.replace(markdownLinkRegex, "<$2|$1>");

    if (task.toLowerCase().includes('follow up')) {
        return `:keyboard: ${linkedTask}`;
    }
    if (task.toLowerCase().includes('review') || task.toLowerCase().includes('look at')) {
        return `:eyes: ${linkedTask}`;
    }
    if (task.toLowerCase().includes('test')) {
        return `:crash-test-dummy: ${linkedTask}`;
    }
    if (task.toLowerCase().includes('read')) {
        return `:reading: ${linkedTask}`;
    }
    if (task.toLowerCase().includes('bug')) {
        return `:bug2: ${linkedTask}`;
    }
    if (task.toLowerCase().includes('fix')) {
        return `:hammer_and_wrench: ${linkedTask}`;
    }
    if (task.toLowerCase().includes('meeting') || task.toLowerCase().includes('1:1')) {
        return `:zoom: ${linkedTask}`;
    }
    if (task.toLowerCase().includes('watch')) {
        return `:tv: ${linkedTask}`;
    }
    return `:keyboard: ${linkedTask}`;
}