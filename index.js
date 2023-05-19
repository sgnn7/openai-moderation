const core = require('@actions/core');
const github = require('@actions/github');
const { context } = require('@actions/github');

function isEmpty(str) {
    return (!str || str.length === 0 );
}

try {
  const apiKeySanitizationPattern = /.(?=.*....)/g;

  // `openai_api_key` input defined in action metadata file
  const openAIApiKey = core.getInput('openai_api_key');
  if (isEmpty(openAIApiKey)) {
    throw new Error('OpenAI API Key cannot be empty!');
  }

  // `github_token` input defined in action metadata file
  const githubToken = core.getInput('github_token');
  if (isEmpty(githubToken)) {
    throw new Error('Github Token cannot be empty!');
  }

  // `replacement_message` input defined in action metadata file
  const replacementMessage = core.getInput('replacement_message');
  if (isEmpty(replacementMessage)) {
    throw new Error('Replacement message cannot be empty!');
  }

  // `comment_id` input defined in action metadata file
  core.info(`Payload: ${JSON.stringify(context.payload)}`);
  const commentId = context.payload.comment.id
  if (isEmpty(commentId)) {
    throw new Error('Comment ID cannot be empty!');
  }

  // Show debug info (with sanitized keys)
  core.info(`Github Repo: ${context.repo.owner}/${context.repo.repo}`);

  const sanitizedOpenAIApiKey = openAIApiKey.replace(apiKeySanitizationPattern, "*");
  core.info(`OpenAI API Key: ${sanitizedOpenAIApiKey}`);
  const sanitizedGithubToken = githubToken.replace(apiKeySanitizationPattern, "*");
  core.info(`Github Token: ${sanitizedGithubToken}`);

  core.info(`Comment ID: ${commentId}`);

  core.info('------------------------');

  const octokit = github.getOctokit(githubToken);

  core.info(`Updating comment: ${commentId} ...`);

  repoOwner = context.repo.owner;
  repoName = context.repo.repo;

  octokit.rest.issues.updateComment({
    owner: repoOwner,
    repo: repoName,
    comment_id: commentId,
    body: replacementMessage,
  }).then(() => {
    core.info(`Comment update success!`);
  }, (err) => {
    throw err;
  });

  /*
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  */

} catch (error) {
  core.setFailed(error.message);
}
