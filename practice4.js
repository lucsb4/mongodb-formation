// 1. Create an interface that asks the user to add a contact and ask organization info as well
// (Use normalize data model)
// 2. Create an interface that shows the total number of contacts by organization

// Company, Total
// MoOngy, 100
// Betacode, 10
// Auchan, 3

// 3. Create an interface that list all contact numbers of one organization

// Company, Numbers
// MoOngy, ["+351 54634566345", "+351 455325324", ...]

// 1. Training aggregate
// 2. Training operation $group
// 2.1 Training $sum
// 2.2 Training $push or $addToSet
// 3. Training $lokup

// 4. Create an interface that list all contacts with organization info

const { MongoClient, ObjectId } = require("mongodb");
const inquirer = require("inquirer");

const url = "mongodb://localhost:27017";
const client = new MongoClient(url);
client.connect();

const db = client.db("contacts");
const business = db.collection("business");
const companiesCollection = db.collection("companies");

// List all contacts paginated and ordered
const insertContact = async function () {
  const companies = await companiesCollection.find().toArray();
  console.log({ companies });

  const answers = await inquirer.prompt([
    { type: "input", name: "name", message: "Contact name: " },
    { type: "input", name: "number", message: "Contact number: " },
    {
      type: "rawlist",
      name: "company",
      message: "Choose a company",
      choices: companies.map((company) => company.name)
    }
  ]);

  business
    .insertOne({
      name: answers.name,
      number: answers.number,
      company: answers.company
    })
    .then((result) => console.log(result))
    .catch((error) => console.error(error));

  console.log({ result });

  menu();
};

const menu = async function () {
  const answers = await inquirer.prompt([
    {
      type: "rawlist",
      name: "action",
      message: "Choose an action: ",
      choices: [
        "Insert business contact",
        "List business contacts",
        "Get total contacts",
        "Get all contacts by company",
        "Exit"
      ]
    }
  ]);

  switch (answers.action) {
    case "Insert business contact":
      insertContact();
      break;
    case "List business contacts":
      listBusinessContacts();
      break;
    case "Get total contacts":
      // getTotalContacts();
      break;
    case "Get all contacts by company":
      // getAllContactsByCompany();
      break;
    case "Exit":
      process.exit();
    default:
      menu();
  }
};

// run interface
menu();
