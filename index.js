const core = require('@actions/core');
const github = require('@actions/github');

try {
  const apiKeySanitizationPattern = /.*/
  // `openai-api-key` input defined in action metadata file
  const openAIApiKey = core.getInput('openai-api-key');

  // TODO: Remove me
  console.log(`API Key: ${openAIApiKey.replace(pattern, "X")}!`);

  const time = (new Date()).toTimeString();
  core.setOutput("time", time);

  /*
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);
  */
} catch (error) {
  core.setFailed(error.message);
}
