# openai-moderation

This action moderates user-submitted content

# **THIS ACTION IS A WIP/POC AND IT CURRENTLY DOES NOT PERFORM ANY WORK**

## Inputs

### `openai-api-key`

**Required** OpenAI API Key to use with this plugin.

## Example usage

Create `.github/workflows/moderation.yml` with the follwoing content:

```yaml
# TODO: Finish me
on:
  issue_comment:
    types: [created, edited]

uses: sgnn7/openai-moderation@<TODO>
with:
  openai_api_key: ${{ secrets.OPENAI_API_KEY }}
  github_token: ${{ secrets.GITHUB_TOKEN }}
```
