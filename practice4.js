// 1. Create an interface that asks the user to add a contact and ask organization info as well
// (Use normalize data model)
// 2. Create an interface that shows the total number of contacts by organization

// e.g.
// Company, Total
// MoOngy, 100
// Betacode, 10
// Auchan, 3

// 3. Create an interface that list all contact numbers of one organization

// e.g.
// Company, Numbers
// MoOngy, ["+351 54634566345", "+351 455325324", ...]

// 1. Training aggregate
// 2. Training operation $group
// 2.1 Training $sum
// 2.2 Training $push or $addToSet
// 3. Training $lookup

// 4. Create an interface that list all contacts with organization info

const { MongoClient, ObjectId } = require("mongodb");
const inquirer = require("inquirer");

const url = "mongodb://localhost:27017";
const client = new MongoClient(url);
client.connect();

const db = client.db("contacts");
const businessCollection = db.collection("business");
const companiesCollection = db.collection("companies");

const insertContact = async function () {
  const companies = await companiesCollection.find().toArray();

  const answer = await inquirer.prompt([
    { type: "input", name: "name", message: "Contact name: " },
    { type: "input", name: "age", message: "Contact age: " },
    { type: "input", name: "number", message: "Contact number: " },
    {
      type: "rawlist",
      name: "companyName",
      message: "Choose a company",
      choices: companies.map((company) => company.name)
    }
  ]);

  businessCollection
    .insertOne({
      name: answer.name,
      age: Number(answer.age),
      number: answer.number,
      company: companies.find((company) => company.name === answer.companyName)
        ._id
    })
    .then((result) => console.log(result))
    .catch((error) => console.error(error));

  menu();
};

const getTotalContactsByCompany = async function () {
  const totalContactsByCompany = await businessCollection
    .aggregate([
      {
        $group: {
          _id: "$company",
          total: {
            $sum: 1
          }
        }
      },
      {
        $lookup: {
          from: "companies",
          localField: "_id",
          foreignField: "_id",
          as: "companyInfo"
        }
      },
      {
        $unwind: {
          path: "$companyInfo",
          includeArrayIndex: "length",
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $project: {
          companyName: "$companyInfo.name",
          total: true,
          _id: false
        }
      }
    ])
    .toArray();

  console.table(totalContactsByCompany);

  menu();
};

const getAllContactsWithCompanyInfo = async function () {
  const allContacts = await businessCollection
    .aggregate([
      {
        $lookup: {
          from: "companies",
          localField: "company",
          foreignField: "_id",
          as: "companyInfo"
        }
      },
      {
        $unwind: {
          path: "$companyInfo",
          includeArrayIndex: "length",
          preserveNullAndEmptyArrays: false
        }
      }
    ])
    .toArray();

  console.log(allContacts);

  menu();
};

const getAllPhoneNumbersByCompany = async function () {
  const companies = await companiesCollection.find().toArray();

  const answers = await inquirer.prompt([
    {
      type: "rawlist",
      name: "companyName",
      message: "Choose a company: ",
      choices: companies.map((company) => company.name)
    }
  ]);

  const allPhoneNumbersByCompany = await businessCollection
    .aggregate([
      {
        $lookup: {
          from: "companies",
          localField: "company",
          foreignField: "_id",
          as: "companyInfo"
        }
      },
      {
        $unwind: {
          path: "$companyInfo",
          includeArrayIndex: "length",
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $group: {
          _id: "$companyInfo.name",
          phoneNumbers: {
            $push: "$number"
          }
        }
      }
    ])
    .toArray();

  const phoneNumbersByCompany = allPhoneNumbersByCompany.find(
    (phoneNumbersByCompany) => phoneNumbersByCompany._id === answers.companyName
  ).phoneNumbers;

  console.log(answers.companyName, phoneNumbersByCompany);

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
        "Get total contacts by company",
        "Get all phone numbers by company",
        "Get all contacts with company info",
        "Exit"
      ]
    }
  ]);

  switch (answers.action) {
    case "Insert business contact":
      insertContact();
      break;
    case "Get total contacts by company":
      getTotalContactsByCompany();
      break;
    case "Get all phone numbers by company":
      getAllPhoneNumbersByCompany();
      break;
    case "Get all contacts with company info":
      getAllContactsWithCompanyInfo();
      break;
    case "Exit":
      process.exit();
    default:
      menu();
  }
};

// run interface
menu();
