// CREATE SCHEMA AND FILL DATA
// 1. create departments
db.departments.insert({ name: "Loans" });
db.departments.insert({ name: "Deposits" });
db.departments.insert({ name: "Cash Management" });
db.departments.insert({ name: "Treasury Management" });
db.departments.insert({ name: "Back Office" });
// 2. create employees
db.employees.insert({
  firstName: "Kiril",
  lastName: "Nedelev",
  address: "st. Hello world, 1",
  phone: "+3591234567",
  email: "kiril@mailbox.com",
  position: "CTO",
  department: db.departments.findOne({ name: "Back Office" })._id
});
db.employees.insert({
  firstName: "Jeremy",
  lastName: "Saunders",
  address: "st. Hello world, 4",
  phone: "+35942424233",
  email: "jeremy@mailbox.com",
  position: "Bank Teller",
  department: db.departments.findOne({ name: "Deposits" })._id
});
db.employees.insert({
  firstName: "Samuel",
  lastName: "Davidson",
  address: "st. Hello world, 8",
  phone: "+3593532532",
  email: "samuel@mailbox.com",
  position: "Cash Manager",
  department: db.departments.findOne({ name: "Cash Management" })._id,
  managers: [
    db.employees.findOne({ firstName: "Jeremy", lastName: "Saunders" })._id
  ]
});
db.employees.insert({
  firstName: "Jessica",
  lastName: "Davidson",
  address: "st. Hello world, 8",
  phone: "+3592343244",
  email: "jessica@mailbox.com",
  position: "Cash Manager",
  department: db.departments.findOne({ name: "Cash Management" })._id,
  managers: [
    db.employees.findOne({ firstName: "Jeremy", lastName: "Saunders" })._id
  ]
});
db.employees.insert({
  firstName: "Andrew",
  lastName: "Smith",
  address: "st. Hello world, 2",
  phone: "+359432325",
  email: "andrew@mailbox.com",
  position: "Loan Officer",
  department: db.departments.findOne({ name: "Loans" })._id,
  managers: [
    db.employees.findOne({ firstName: "Kiril", lastName: "Nedelev" })._id
  ]
});
db.employees.insert({
  firstName: "Michael",
  lastName: "Phelps",
  middleName: "Roger",
  address: "st. Hello world, 3",
  phone: "+3594323323",
  email: "michael@mailbox.com",
  position: "Internal Auditor",
  department: db.departments.findOne({ name: "Cash Management" })._id,
  managers: [
    db.employees.findOne({ firstName: "Kiril", lastName: "Nedelev" })._id
  ]
});
// 3. create clients
db.clients.insert({
  firstName: "Eugen",
  lastName: "Jackson",
  address: "st. Hello world, 6",
  phone: "+35934543543",
  email: "eugen@mailbox.com",
  accounts: [
    {
      _id: new ObjectId(),
      balance: 1242.99
    }
  ]
});
db.clients.insert({
  firstName: "Alena",
  lastName: "Krivicki",
  middleName: "Lianova",
  address: "st. Hello world, 5",
  phone: "+3591201901",
  email: "alena@mailbox.com",
  accounts: [
    {
      _id: new ObjectId(),
      currency: "EUR",
      balance: 456.12
    }
  ]
});
db.clients.insert({
  firstName: "Arina",
  lastName: "Velikova",
  address: "st. Hello world, 15",
  phone: "+35932453533",
  email: "arina@mailbox.com",
  accounts: [
    {
      _id: new ObjectId(),
      balance: 0
    }
  ]
});

// BUSINESS QUERIES. PART 1
// define helpers
var random = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
// 1.
db.departments.find({}, { _id: 0, name: 1 });
// 2.
var salaries = [2500, 3000, 3500, 5000, 5500].reverse();
var index = 0;
db.employees.find().forEach(employee => {
  db.employees.update(
    { _id: employee._id },
    {
      $set: {
        salary: salaries[index % salaries.length]
      }
    }
  );
  index++;
});
db.employees.find({}, { _id: 0, firstName: 1, lastName: 1, salary: 1 });
// 3.
db.employees.aggregate([
  {
    $project: {
      _id: 0,
      firstName: 1,
      lastName: 1,
      email: {
        $concat: [
          { $toLower: "$firstName" },
          ".",
          { $toLower: "$lastName" },
          "@bankoftomorrow.bg"
        ]
      }
    }
  }
]);
// 4.
var startDates = [
  new Date("2011-02-07"),
  new Date("2012-01-01"),
  new Date("2013-04-09"),
  new Date("2014-11-11"),
  new Date("2015-08-16"),
  new Date("2016-10-21"),
  new Date("2017-01-28")
];
db.employees.find().forEach(employee => {
  db.employees.update(
    { _id: employee._id },
    {
      $set: {
        startDate: startDates[random(0, startDates.length)]
      }
    }
  );
});
var fiveYearsAgo = new Date();
fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
db.employees.find({ startDate: { $gte: fiveYearsAgo } });
// 5.
db.employees.find({ firstName: { $regex: /^S/ } });
// 6.
var countries = ["Bulgaria", "Ukraine"];
db.employees.find().forEach(employee => {
  db.employees.update(
    { _id: employee._id },
    {
      $set: {
        country: countries[random(0, countries.length)]
      }
    }
  );
});
db.employees.find({ country: "Bulgaria" });
// 7.
db.employees.find({
  $or: [
    { firstName: { $regex: /I/ } },
    { lastName: { $regex: /I/ } },
    { middleName: { $regex: /I/ } }
  ]
});

// BUSINESS QUERIES. PART 2
// 1.
var employee = db.employees.findOne({
  firstName: "Kiril",
  lastName: "Nedelev"
});
db.employees.update(
  { _id: employee._id },
  {
    $set: {
      departmentMovements: [
        {
          previous: db.departments.findOne({ name: "Loans" })._id,
          next: db.departments.findOne({ name: "Treasury Management" })._id,
          movedAt: new Date("2019-08-11")
        },
        {
          previous: db.departments.findOne({ name: "Treasury Management" })._id,
          next: db.departments.findOne({ name: "Back Office" })._id,
          movedAt: new Date("2019-10-15")
        }
      ]
    }
  }
);
var employee = db.employees.findOne({
  firstName: "Jeremy",
  lastName: "Saunders"
});
db.employees.update(
  { _id: employee._id },
  {
    $set: {
      departmentMovements: [
        {
          previous: db.departments.findOne({ name: "Loans" })._id,
          next: db.departments.findOne({ name: "Deposits" })._id,
          movedAt: new Date("2019-09-09")
        }
      ]
    }
  }
);
// 2.
var twoMonthsAgo = new Date();
twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
db.employees.find({
  "departmentMovements.movedAt": {
    $gte: twoMonthsAgo
  }
});
// 3.
db.employees.find({
  $or: [
    { departmentMovements: { $exists: false } },
    { departmentMovements: { $size: 0 } }
  ]
});

// BUSINESS QUERIES. PART 3
// 1.
var employee = db.employees.findOne({
  firstName: "Jeremy",
  lastName: "Saunders"
});
db.employees.update({ _id: employee._id }, { $set: { isFired: true } });
db.employees.find({ isFired: true });
// 2.
var employee = db.employees.findOne({
  firstName: "Jessica",
  lastName: "Davidson"
});
db.employees.update({ _id: employee._id }, { $set: { onParentalLeave: true } });
db.employees.find({ onParentalLeave: true });
// 3.
var employee = db.employees.findOne({
  firstName: "Kiril",
  lastName: "Nedelev"
});
db.employees.update({ _id: employee._id }, { $set: { isVacant: true } });
db.employees.find({ isVacant: true });
// 4.
db.employees.find({
  $and: [{ salary: { $gte: 2000 } }, { salary: { $lte: 3000 } }]
});
// 5.
db.employees.aggregate([
  {
    $group: {
      _id: "$salary",
      employees: { $push: { $concat: ["$firstName", " ", "$lastName"] } }
    }
  }
]);
// 6.
db.employees.find({
  $or: [{ managers: { $exists: false } }, { managers: { $size: 0 } }]
});
// 7.
db.employees.find({ salary: { $gt: 5000 } }).sort({ firstName: -1 });
// 8.
db.employees.aggregate([
  { $sort: { salary: -1 } },
  {
    $group: {
      _id: "$department",
      employees: {
        $push: {
          $concat: [
            "$firstName",
            " ",
            "$lastName",
            ", ",
            { $toString: "$salary" }
          ]
        }
      }
    }
  },
  {
    $lookup: {
      from: "departments",
      localField: "_id",
      foreignField: "_id",
      as: "departmentObj"
    }
  },
  { $unwind: "$departmentObj" },
  {
    $project: {
      _id: 0,
      name: "$departmentObj.name",
      employees: { $slice: ["$employees", 5] }
    }
  }
]);
// 9.
db.employees.aggregate([
  {
    $group: {
      _id: "$department",
      total: { $sum: "$salary" }
    }
  },
  { $sort: { total: 1 } },
  {
    $lookup: {
      from: "departments",
      localField: "_id",
      foreignField: "_id",
      as: "departmentObj"
    }
  },
  { $unwind: "$departmentObj" },
  {
    $project: {
      name: "$departmentObj.name",
      total: "$total"
    }
  },
  {
    $group: {
      _id: "$total",
      ids: { $push: "$_id" },
      names: { $push: "$name" }
    }
  },
  { $sort: { _id: 1 } },
  { $limit: 1 },
  {
    $project: {
      _id: 0,
      minSalary: "$_id",
      departments: {
        $map: {
          input: { $zip: { inputs: ["$ids", "$names"] } },
          as: "el",
          in: {
            _id: { $arrayElemAt: ["$$el", 0] },
            name: { $arrayElemAt: ["$$el", 1] }
          }
        }
      }
    }
  }
]);
// 10.
// a) group by department
db.employees.aggregate([
  {
    $group: {
      _id: "$department",
      avgSalary: { $avg: "$salary" }
    }
  },
  {
    $lookup: {
      from: "departments",
      localField: "_id",
      foreignField: "_id",
      as: "departmentObj"
    }
  },
  { $unwind: "$departmentObj" },
  {
    $project: {
      _id: 0,
      name: "$departmentObj.name",
      avgSalary: "$avgSalary"
    }
  }
]);
// b) group by salary
db.employees.aggregate([
  {
    $group: {
      _id: "$department",
      avgSalary: { $avg: "$salary" }
    }
  },
  {
    $lookup: {
      from: "departments",
      localField: "_id",
      foreignField: "_id",
      as: "departmentObj"
    }
  },
  { $unwind: "$departmentObj" },
  {
    $project: {
      name: "$departmentObj.name",
      avgSalary: "$avgSalary"
    }
  },
  {
    $group: {
      _id: "$avgSalary",
      ids: { $push: "$_id" },
      names: { $push: "$name" }
    }
  },
  {
    $project: {
      _id: 0,
      avgSalary: "$_id",
      departments: {
        $map: {
          input: { $zip: { inputs: ["$ids", "$names"] } },
          as: "el",
          in: {
            _id: { $arrayElemAt: ["$$el", 0] },
            name: { $arrayElemAt: ["$$el", 1] }
          }
        }
      }
    }
  }
]);

// BUSINESS QUERIES. PART 4
// 1.
db.clients.find({
  "accounts.currency": { $exists: true, $ne: "BGN" }
});
// 2.
db.clients.find({
  $or: [{ "accounts.balance": { $exists: false } }, { "accounts.balance": 0 }]
});
// 3.
db.clients.find().forEach(client => {
  if (!client.accounts) return;
  const accounts = client.accounts.map(account => {
    return {
      ...account,
      name: `${client.firstName} ${
        client.lastName
      } account ${account.currency || "BGN"}`
    };
  });
  db.clients.update({ _id: client._id }, { $set: { accounts } });
});
