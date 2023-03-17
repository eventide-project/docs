#!/usr/bin/env bash

# Fall back to legacy OpenSSL, since OpenSSL v3 is incompatible with webpack - Nathan, Fri Mar 17 2023
export NODE_OPTIONS=--openssl-legacy-provider

vuepress dev
