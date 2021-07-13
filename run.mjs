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

api.get('https://api.todoist.com/sync/v8/completed/get_all').then((result) => {
    const yesterdaysTasks = result.data.items.filter(item => {
        return item.project_id === config.todoistProject && dayjs(item.completed_date).isYesterday();
    }).map(item => item.content);
    console.log("\n\nWhat I did yesterday:\n\n");
    yesterdaysTasks.forEach((task) => console.log(task));

    api.get('https://api.todoist.com/sync/v8/sync?sync_token=*&resource_types=[\"items\"]').then((result) => {
        const todaysTasks = result.data.items.filter(item => {
            return item.project_id === config.todoistProject && dayjs(item.due.date).isToday();
        }).map(item => item.content);
        console.log("\n\nWhat I plan to do today:\n\n");
        todaysTasks.forEach((task) => console.log(task));
    });
});


