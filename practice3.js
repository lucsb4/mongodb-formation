// 1. Search for a contact in my contact list
// 2. List all my contacts in alphabetic order
// 3. Create a pagination system that shows all my contacts
// e.g.
//  Marco - 20365353
//  Danilo - 34255342
//  More(y/n) y
//  Tiago - 6452432
//  Aguiar - 436345523

const { MongoClient, ObjectId } = require("mongodb");
const inquirer = require("inquirer");

const url = "mongodb://localhost:27017";
const client = new MongoClient(url);
client.connect();
const db = client.db("contacts");

// List all contacts paginated and ordered
const listContacts = async function (contactList) {
  const PAGE_SIZE = 5;
  let page = 0;

  while (page !== null) {
    const documents = await db
      .collection(contactList)
      .find()
      .limit(PAGE_SIZE)
      .skip(page)
      .sort({ name: 1 })
      .toArray();

    console.table(documents);

    const getNewPage = await inquirer.prompt([
      { type: "confirm", name: "isNewPage", message: "Show more?" }
    ]);

    if (getNewPage.isNewPage === true) page += PAGE_SIZE;
    else page = null;
  }

  menu();
};

const searchContact = async function (contactList) {
  const searchInputs = await inquirer.prompt([
    { type: "input", name: "searchKey", message: "Type search key: " },
    { type: "input", name: "searchValue", message: "Type search value: " }
  ]);

  const { searchKey, searchValue } = searchInputs;

  const foundResult = await db
    .collection(contactList)
    .find({ [searchKey]: searchValue })
    .toArray();

  console.log(foundResult);

  menu();
};

const paginate = function () {};

const menu = async function () {
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "contactList",
      message: "Please type a contact list"
    },
    {
      type: "rawlist",
      name: "action",
      message: "Choose an action",
      choices: ["List Contacts", "Search Contact", "Exit"]
    }
  ]);

  const { contactList, action } = answers;

  switch (action) {
    case "List Contacts":
      listContacts(contactList);
      break;
    case "Search Contact":
      searchContact(contactList);
      break;
    case "Exit":
      process.exit();
    default:
      menu();
  }
};

// run interface
menu();
