# Hack Thing Wonk Spotify 2k17 Supreme

## Working on source

1. Clone this repo
2. `cd $PROJ_DIR`
3. `yarn` or `npm install` or whatever, do the node thing
4. Make sure you have Redis installed, or have a Redis connection url
5. `cp .env.example .env`
6. Fill in your details in the environment file
7. `npm run dev`

## Accessing services

You can either require them normally, _or_, access them anywhere in your code
with `service.[servicename]`, so e.g. `service.cache.remember('my-key', () => 123)`
to use the cache's remember feature
