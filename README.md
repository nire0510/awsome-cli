# AWSOME-CLI
Query your AWS services like a boss 🥸.

**awsome-cli** is a Node.js based CLI tool, which simplifies the use of AWS CLI, and helps you to get information from the services you use in your AWS account(s).

## Prerequisites
* [AWS CLI](https://aws.amazon.com/cli/)
* [Node.js](https://nodejs.org/en/)

## Installation
`npm install -g @nire0510/awsome-cli`

## Usage
Simply run `awsome` command in your terminal:
> `$ awsome`

You can also rerun a previous command by calling the history command: `awsome history`.

## Example
![awsome](awsome-cli.png)

## Updates
`npm update -g "@nire0510/awsome-cli"`
You can check your current version with this command: `awsome -v`. Alternatively, you can update only the services file from the project's repository, by adding the `-u` option: `awsome -u`.

## Help
`awsome -h`
```
Usage: awsome [options] [command]

Get information from your AWS accounts like a boss

Options:
  -v, --version  output the version number
  -u, --update   Download the latest services & queries
  -h, --help     display help for command

Commands:
  history        Rerun a query you ran recently
  add            Suggest additional AWS queries
```
