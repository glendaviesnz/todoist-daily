# Todoist Daily

A simple script to create a daily standup post based on Todoist tasks and post it to a slack channel.

## Setup

Clone this repo and rename `example-config.mjs` to `config.mjs` and update the values. You will need to get add the following details:

- Your name - hopefully this is the easy one
- Your team's name
- Your Todoist sync api token which you can find under `Integrations` in the top right `Settings` menu on Todoist web app
- The Todoist project id for the project were you keep your daily task list. You can get this from the url if you open that project in the web app
- A slack `User OAuth Token`. Go to `https://api.slack.com/apps` and set up a new app and set user token scopes to `chat:write` and get the `User OAuth Token` as this script will just post to the channel as you rather than as a bot
- The name of the channel you want your update posted to

Run `npm start`
