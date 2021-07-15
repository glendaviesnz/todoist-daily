import axios from 'axios';
import dayjs from 'dayjs';
import isYesterday from 'dayjs/plugin/isYesterday.js'
import isToday from 'dayjs/plugin/isToday.js'

import { config } from './config.mjs';

let slackMessage;
dayjs.extend(isYesterday);
dayjs.extend(isToday)

slackMessage = "*How do you feel today?*\n\n:green-dot:\n\n*What did you do yesterday?*\n\n";
const api = axios.create({
    headers: {'Authorization': `Bearer ${config.todoistToken}`}
  });

api.get('https://api.todoist.com/sync/v8/completed/get_all').then((result) => {
    const yesterdaysTasks = result.data.items.filter(item => {
        return item.project_id === config.todoistProject && dayjs(item.completed_date).isYesterday();
    }).map(item => item.content);
   
    yesterdaysTasks.forEach((task) => slackMessage += ':keyboard: ' + formatTask(task) + "\n");

    api.get('https://api.todoist.com/sync/v8/sync?sync_token=*&resource_types=[\"items\"]').then((result) => {
        const todaysTasks = result.data.items.filter(item => {
            return item.project_id === config.todoistProject && dayjs(item.due.date).isToday();
        }).map(item => item.content);
        slackMessage += "\n\n*What you plan to do today?* :\n\n";
        todaysTasks.forEach((task) => slackMessage += ':keyboard: ' + formatTask(task) + "\n");
    }).then(() => {
        run().catch(err => console.log(err));
        // console.log(slackMessage);
    });
});





async function run() {
  const url = 'https://slack.com/api/chat.postMessage';
  const res = await axios.post(url, {
    channel: config.slackChannel,
      text: slackMessage,
      unfurl_links: false,
      unfurl_media: false
  }, { headers: { authorization: `Bearer ${config.slackToken}` } });

  console.log('Done', res.data);
}

function formatTask(task) {
    const markdownLinkRegex = /\[(.*)\]\(((?:\/|https?:\/\/)[\w\d.\/?=#-_]+)\)/g;

    return task.replace(markdownLinkRegex, "<$2|$1>");
}