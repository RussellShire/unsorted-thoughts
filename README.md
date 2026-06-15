# Unsorted Thoughts

## Overview
This repo is basically a way to instantly publish poetry from my phone. I use the Google Drive API to scrape a google doc.

The styling is, distinctive, because I like it.

The poems are shuffled on every load to make it sillier.

There is a counter so people can know if there's a new poem since they last visited, although the shuffle makes it very hard to actually find it.

## Tech
This is deliberately as simple as possible, using html and javascript without any frameworks or backend so it can be hosted on github pages. Google Docs technically forms the backend.

## How Google Docs are read
Individual notes ('thoughts') are separated by a '#'

Titles are lines that end with a ':'

Styling is stripped off but whitespace, new lines and paragraphs are preserved (mainly to support poetry).

## Running this project
There is a github action that inserts the keys as secrets. It's technically redundant because the keys will be on the page but I couldn't make myself commit the keys to a repo. You need a google drive api key from developer consoel and a google doc id. 
Otherwise it's very basic js and html with github actions.

### TODO
- Caching the call to avoid the loading as the api call happens, ideally I'd find a crunchy way to do this for free.
- Adding 'last updated' (would require a second call to `https://www.googleapis.com/drive/v3/files/${DOCUMENT_ID}?fields=modifiedTime,lastModifyingUser&key=${API_KEY}`)
- Add shuffle button to reorder without refresh
- Add search to filter poems on words, I keep doing this with ctrl-f so there's clearly user demand.
- Possibly add support for adding dates to 'thoughts' so this could be used like a blog.
