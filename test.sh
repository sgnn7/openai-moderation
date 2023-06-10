#!/bin/bash

# Extremely crude but there's no need for a full testing framework while
# prototyping the basics of the API usage

set -euo pipefail

GITHUB_EVENT_PATH=test/test_event.json \
  GITHUB_REPOSITORY='sgnn7/openai-moderation' \
  INPUT_GITHUB_TOKEN="${TEST_GITHUB_TOKEN}" \
  INPUT_REPLACEMENT_MESSAGE="This is just a test message - $(date)" \
  INPUT_OPENAI_API_KEY=${OPENAI_API_KEY:-not_a_real_key} \
  node .
