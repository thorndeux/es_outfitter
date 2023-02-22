#!/bin/sh

# Update to latest npm version
npm install npm@latest -g

# Install and update frontend dependencies
npm update

# Pass through command
exec "$@"