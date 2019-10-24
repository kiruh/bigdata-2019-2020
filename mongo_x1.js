// Task 1
var validateCar = (car) => {
    const fields = ['model', 'number'];
    return fields.every(field => {
        if (!car[field]) {
            print("car." + field + " is required");
            return false;
        }
        return true;
    });
}
var dbw = {
    cars: {
        insert: (car) => {
            if (!validateCar(car)) return;
            db.cars.insert(car);
        },
        update: (car) => {
            if (!validateCar(car)) return;
            const current = db.cars.findOne({ _id: car._id });
            if (!current) {
                print("car with _id " + car._id + " doesn't exist");
                return;
            }
            db.cars.update({ _id: car._id }, car);
        }
    }
};
var models = ['BMW', 'Mercedes', 'Nissan', 'Toyota', 'Opel'];
var numbers = [7458884, 2346192, 2849503, 2849493, 2139020];
for (let i = 0; i < 5; i++) {
    var car = {
        model: models[Math.floor(Math.random() * models.length)],
        number: numbers[i],
    };
    dbw.cars.insert(car);
}
// Task 2
db.cars.find().forEach(car => {
    dbw.cars.update({
        ...car,
        seats: 2,
    });
});
// Task 3
var validateCargo = (cargo) => {
    const fields = ['name', 'category', 'amount', 'carId'];
    const valid = fields.every(field => {
        if (!cargo[field]) {
            print("cargo." + field + " is required");
            return false;
        }
        return true;
    });
    if (!valid) return false;
    if (!db.cars.findOne({ _id: cargo.carId })) {
        print('there is no car with id ' + cargo.carId);
        return false;
    }
    return true;
}
dbw.cargos = {
    insert: (cargo) => {
        if (!validateCargo(cargo)) return;
        db.cargos.insert(cargo);
    },
    update: (cargo) => {
        if (!validateCargo(cargo)) return;
        const current = db.cargos.findOne({ _id: cargo._id });
        if (!current) {
            print("cargo with _id " + cargo._id + " doesn't exist");
            return;
        }
        db.cargos.update({ _id: cargo._id }, cargo);
    }
}
var names = ['Tomatoes', 'Onions', 'Carrots', 'Cucumbers', 'Cabbages'];
var amounts = [100, 120, 140, 160, 200];
var cars = db.cars.find().toArray();
for (let i = 0; i < 5; i++) {
    var cargo = {
        name: names[i],
        category: 'Vegetables',
        amount: amounts[Math.floor(Math.random() * amounts.length)],
        carId: cars[Math.floor(Math.random() * cars.length)]._id
    };
    dbw.cargos.insert(cargo);
}
// Task 4
db.cars.find().forEach(car => {
    print(car.model + ' ' + car.number);
    var cargos = db.cargos.find({ carId: car._id }).toArray();
    if (cargos.length) {
        cargos.forEach(cargo => {
            print('- ' + cargo.name, + ' (' + cargo.category + '), ' + cargo.amount + ' kg');
        })
    } else {
        print('- No cargo');
    }
});
// Task 5
var priorityCategories = ['Vegetables', 'Fruits', 'Milk', 'Meat'];
db.cargos.find({ category: { $in: priorityCategories } }).forEach(cargo => {
    db.priorityCargos.insert(cargo);
});
dbw.cargos.insert = cargo => {
    if (!validateCargo(cargo)) return;
    db.cargos.insert(cargo);
    if (priorityCategories.includes(cargo.category)) {
        db.priorityCargos.insert(cargo);
    }
}