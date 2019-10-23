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
  department: db.departments.findOne({ name: "Cash Management" })._id
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

// BUSINESS QUERIES. PART 1
// define helpers
var random = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
// 1.
db.departments.find({}, { _id: 0, name: 1 });
// 2.
db.employees.find().forEach(employee => {
  db.employees.update(
    { _id: employee._id },
    {
      $set: {
        salary: random(1000, 2000)
      }
    }
  );
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
