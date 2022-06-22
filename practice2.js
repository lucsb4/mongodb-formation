const inquirer = require("inquirer");
const { MongoClient, ObjectId } = require("mongodb");

const url = "mongodb://localhost:27017";
const client = new MongoClient(url);
client.connect();

const db = client.db("contacts");

const listContacts = async (contactList) => {
  const contacts = await db.collection(contactList).find().toArray();

  const formattedContacts = contacts.map((contact) => ({
    id: contact._id,
    name: contact.name,
    age: contact.age
  }));

  console.table(formattedContacts);
  menu();
};

const createContacts = async (contactList) => {
  try {
    const ans = await inquirer.prompt([
      {
        type: "list",
        name: "insertType",
        choices: ["By field", "JSON"]
      }
    ]);

    if (ans.insertType === "By field") {
      try {
        const field = await inquirer.prompt([
          {
            type: "input",
            name: "name",
            message: "Type the name of the contact: "
          },
          {
            type: "input",
            name: "age",
            message: "Type the age of the contact: "
          }
        ]);

        db.collection(contactList)
          .insertOne({ name: field.name, age: Number(field.age) })
          .then((response) => console.log(response))
          .catch((error) => console.error(error));
        menu();
      } catch (error) {
        console.error(error);
      }
    }

    if (ans.insertType === "JSON") {
      try {
        const ans = await inquirer.prompt([
          {
            type: "input",
            name: "jsonToInsert",
            message: "Type the contact to insert: "
          }
        ]);

        db.collection(contactList)
          .insertOne(JSON.parse(ans.jsonToInsert))
          .then((response) => console.log(response))
          .catch((error) => console.error("onInsert Error::", error));
        menu();
      } catch (error) {
        console.error("inquirer Error::", error);
      }
    }
  } catch (error) {
    console.error(error);
  }
};

const removeContacts = async (contactList) => {
  try {
    const ans = await inquirer.prompt([
      {
        type: "input",
        name: "contactToDelete",
        message: "Type the id of the contact to delete: "
      }
    ]);

    console.log(ans);

    db.collection(contactList)
      // .deleteOne({ name: { $eq: ans.contactToDelete } })
      .deleteOne({ _id: ObjectId(ans.contactToDelete) })
      .then((response) => console.log(response))
      .catch((error) => console.error(error));
  } catch (error) {
    console.error(error);
  }

  menu();
};

const menu = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "selectedCollection",
        message: "Type the collection to use: "
      },
      {
        type: "rawlist",
        name: "action",
        message: "Choose an action: ",
        choices: ["List Contacts", "Create Contacts", "Remove Contacts"]
      }
    ])
    .then((answers) => {
      const { selectedCollection, action } = answers;
      switch (action) {
        case "List Contacts":
          listContacts(selectedCollection);
          break;
        case "Create Contacts":
          createContacts(selectedCollection);
          break;
        case "Remove Contacts":
          removeContacts(selectedCollection);
          break;
        default:
          menu();
      }
    });
};

menu();
