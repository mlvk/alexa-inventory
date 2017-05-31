# Alexa Inventory is an [Alexa Skill](https://developer.amazon.com/alexa-skills-kit) that allows you to take inventory verbally.

### How to interact:

The trigger: `Alexa, open stock levels`

### Commands:

`start tracking` - This will switch to inventory tracking mode.

When in inventory tracking mode:

`5 pounds of salt` - This will send a notification to [slack](https://slack.com/). The pattern is `number` - `unit` - `item`

### Project Setup

```bash
npm install
touch .env
```

Edit your .env file with the following var:

1. `SLACK_URL`=https://hooks.slack.com/services/YOUR-SLACK-CHANNEL-URL

```bash
serverless deploy
```

Once you have deployed, grab the ARN from your AWS console.

### Setup new alexa skill

[Amazon Developer](https://developer.amazon.com)

The first step is to create a new [Alexa Skill](https://developer.amazon.com/alexa-skills-kit)

1. Login to https://developer.amazon.com with your alexa linked account and go to the alexa tab.
2. Add a new skill, and walk through the steps.
3. Set the invocation name. `stock levels` seems to work well
4. Next go to the `Interaction Model` and paste in the model from `schema.json`
5. Create the custom slot types
  * `items` - The list of items you want to track in inventory: salt, pepper etc.
  * `unit` - The list of units of measure to be allowed: pounds, grams, cups etc.
  * `note` - Hardcode to anything, this is just a placeholder to send arbitrary notes to slack
6. Paste in the sample utterances
7. Build the model
8. Select the AWS Lambda ARN and paste in the ARN from the previous step
