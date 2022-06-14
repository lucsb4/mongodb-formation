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

const listCollections = async () => {
  const collections = await database.listCollections().toArray();
  const formattedCollections = collections.map((collection) => {
    return {
      name: collection.name
    };
  });
  console.table(formattedCollections);
  menu();
};

const createCollection = async () => {
  try {
    const ans = await inquirer.prompt([
      {
        type: "input",
        name: "collectionName",
        message: "Type collection name"
      }
    ]);

    database.createCollection(ans.collectionName);
  } catch (error) {
    console.error(error);
  } finally {
    menu();
  }
};

const removeCollection = async () => {
  try {
    const ans = await inquirer.prompt([
      {
        type: "input",
        name: "collectionName",
        message: "Type collection name"
      }
    ]);

    database.dropCollection(ans.collectionName);
  } catch (error) {
    console.error(error);
  } finally {
    menu();
  }
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
          "Remove Contact List"
        ]
      }
    ])
    .then((answers) => {
      switch (answers["action"]) {
        case "List Contact Lists":
          listCollections();
          break;
        case "Create Contact List":
          createCollection();
          break;
        case "Remove Contact List":
          removeCollection();
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
