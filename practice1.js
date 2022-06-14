/*
 * === GOAL ===
 * Create a command line interface to create and list and remove contact folders
 * Every contact folder should be a container
 * Create a command to create
 * Create a command to list
 * Create a command to remove
 * */

const inquirer = require("inquirer");
const MongoDB = require("mongodb");
const { MongoClient } = MongoDB;

const url = "mongodb://localhost:27017/contacts"; // 27017 is the default mongodb port
const client = new MongoClient(url);
client.connect();

const database = client.db("contacts");

const listContactLists = async () => {
  const collections = await database.listCollections().toArray();
  const formattedCollections = collections.map((collection) => {
    return {
      name: collection.name,
      type: collection.type,
    };
  });
  console.table(formattedCollections);
};

const menu = function () {
  inquirer
    .prompt([
      {
        type: "rawlist",
        name: "action",
        message: "Action",
        choices: [
          "List Contact Lists",
          "Create Contact List",
          "Remove Contact List",
        ],
      },
    ])
    .then((answers) => {
      switch (answers["action"]) {
        case "List Contact Lists":
          listContactLists();
          break;
        case "Create Contact List":
          // createContactList();
          break;
        case "Remove Contact List":
          // removeContactList();
          break;
        default:
          console.log("Default behaviour.");
          break;
        // options();
      }
    })
    .catch((error) => {
      console.log(error);
    });
};

menu();
