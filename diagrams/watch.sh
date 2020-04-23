#!/usr/bin/env bash

watchman -f -- trigger ./diagrams/ '*.txt' -- plantuml
