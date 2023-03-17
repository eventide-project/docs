#!/usr/bin/env bash

aws s3 sync _build s3://docs.eventide-project.org --profile brightworks
