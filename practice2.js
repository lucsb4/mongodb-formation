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
        type: "input",
        name: "contactToInsert",
        message: "Type the contact to insert: "
      }
    ]);

    console.log(ans);

    db.collection(contactList)
      .insertOne(JSON.parse(ans.contactToInsert))
      .then((response) => console.log(response))
      .catch((error) => console.error(error));
  } catch (error) {
    console.error(error);
  }

  menu();
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
        name: "contactList",
        message: "Type a contact list: "
      },
      {
        type: "rawlist",
        name: "action",
        message: "Choose an action: ",
        choices: ["List Contacts", "Create Contacts", "Remove Contacts"]
      }
    ])
    .then((answers) => {
      const { contactList, action } = answers;
      switch (action) {
        case "List Contacts":
          listContacts(contactList);
          break;
        case "Create Contacts":
          createContacts(contactList);
          break;
        case "Remove Contacts":
          removeContacts(contactList);
          break;
        default:
          menu();
      }
    });
};

menu();