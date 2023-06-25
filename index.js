const https = require('https');
const util = require('util');

const core = require('@actions/core');
const github = require('@actions/github');
const { context } = require('@actions/github');

function isEmpty(str) {
    return (!str || str.length === 0 );
}

async function evaluateModerationScores(commentBody, openAIApiKey) {
    return new Promise((resolve, reject) => {
        const requestData = JSON.stringify({
            input: commentBody,
        });

        const options = {
            hostname: 'api.openai.com',
            path: '/v1/moderations',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openAIApiKey}`,
            }
        };

        const req = https.request(options, (res) => {
            res.setEncoding('utf8');
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                core.info('Status Code:', res.statusCode);
                resolve(JSON.parse(responseData))
            });
        }).on("error", (err) => {
            console.log("Error: ", err.message);
            reject(err)
        });

        req.write(requestData);
        req.end();
    });
}


async function main() {
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

    // `comment_body` input defined in action metadata file
    const commentBody = context.payload.comment.body
    if (isEmpty(commentBody)) {
        core.info('Commend body was empty - skipping moderation step');
        return;
    }

    // Show debug info (with sanitized keys)
    core.info(`Github Repo: ${context.repo.owner}/${context.repo.repo}`);

    const sanitizedOpenAIApiKey = openAIApiKey.replace(apiKeySanitizationPattern, "*");
    core.info(`OpenAI API Key: ${sanitizedOpenAIApiKey}`);
    const sanitizedGithubToken = githubToken.replace(apiKeySanitizationPattern, "*");
    core.info(`Github Token: ${sanitizedGithubToken}`);

    core.info(`Comment ID: ${commentId}`);

    core.info(`Comment body:`);
    core.info('vvvvvvvvvvvvvvvvvvvvvvvv');
    core.info(`${commentBody}`);
    core.info('^^^^^^^^^^^^^^^^^^^^^^^^');


    core.info(`Checking content against moderation API ...`);

    moderationScores = await evaluateModerationScores(commentBody, openAIApiKey);
    console.log('Body: ', util.inspect(moderationScores, true, 12, true));

    const flagged = moderationScores.results.some((res) => res.flagged);
    if (!flagged) {
        core.info('Content not flagged!');
        return;
    }

    // Content is flagged - let's edit it
    core.info('*** CONTENT WAS FLAGGED! ***');

    // Dig deeper into the results now that we know there's failures

    // 1. Get all flagged results first
    const flaggedCategories =  moderationScores.results.filter((res) => res.flagged)
        // 2. Get the categories groups from those results
        .map(matchingResult => matchingResult.categories)
        // 3. Only keep the categories that resulted in the flagging
        .map(categories => Object.keys(categories).filter((key) => categories[key]))
        // 4. Flatten the structure so that we have a neat result
        .flat();

    core.info(`Flagged categories: ${flaggedCategories}`);

    core.info(`Updating comment: ${commentId} ...`);

    const octokit = github.getOctokit(githubToken);

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
}

try {
    main()
} catch (error) {
    core.setFailed(error.message);
}
