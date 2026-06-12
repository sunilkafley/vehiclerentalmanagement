// ================================================
// Vehicle Rental Management System – Unit Tests
// ================================================

// ================================
// Customer Management Tests
// ================================
describe("Customer Management", function() {
  let model;
  let customer;

  beforeEach(function() {
    model = new VRMSModel();
    model.customers = [];
    customer = new Customer(1, "John Doe", "john@email.com", "1234", "123 Street", "Regular", new Date(), true);
  });

  it("should register a new customer", function() {
    expect(model.getCustomers().length).toBe(0);
    model.registerCustomer(customer);
    expect(model.getCustomers().length).toBe(1);
    expect(model.getCustomers()[0].fullName).toBe("John Doe");
  });

  it("should find a customer by ID after registration", function() {
      expect(model.findCustomer(1)).toBeNull();
      model.registerCustomer(customer);
      const found = model.findCustomer(1);
      expect(found).not.toBeNull();
      expect(found.email).toBe("john@email.com");
    });

  it("should deactivate a customer", function() {
    model.registerCustomer(customer);
    expect(model.findCustomer(1).activeStatus).toBe(true);
    model.deactivateCustomer(1);
    expect(model.findCustomer(1).activeStatus).toBe(false);
  });
});


// ================================
// Vehicle Management Tests
// ================================
describe("Vehicle Management", function() {
  let model;
  let vehicle;
  let updatedVehicle;

  beforeEach(function() {
    model = new VRMSModel();
    model.vehicles = [];
    vehicle = new Vehicle(1, "Toyota", "Corolla", 2020, "ABC123", "Sedan", 100, 50000, "Christchurch", true, "Available");
    updatedVehicle = new Vehicle(1, "Toyota", "Corolla Sport", 2021, "ABC123", "Sedan", 120, 40000, "Christchurch", true, "Available");
  });

  it("should add a new vehicle", function() {
    expect(model.getVehicles().length).toBe(0);
    model.addVehicle(vehicle);
    expect(model.getVehicles().length).toBe(1);
    expect(model.getVehicles()[0].make).toBe("Toyota");
  });

  it("should update a vehicle with new details", function() {
    model.addVehicle(vehicle);
    expect(model.getVehicles()[0].model).toBe("Corolla");
    model.updateVehicle(updatedVehicle);
    expect(model.getVehicles()[0].model).toBe("Corolla Sport");
    expect(model.getVehicles()[0].dailyRate).toBe(120);
  });

  it("should remove a vehicle", function() {
    model.addVehicle(vehicle);
    expect(model.getVehicles().length).toBe(1);
    model.removeVehicle(1);
    expect(model.getVehicles().length).toBe(0);
  });
});


// ================================
// Rental Transaction Tests
// ================================
describe("Rental Transactions", function() {
  let model;
  let customer;
  let vehicle;
  let rental;

  beforeEach(function() {
    model = new VRMSModel();
    model.customers = [];
    model.vehicles = [];
    model.rentals = [];

    customer = new Customer(1, "Alice", "alice@email.com", "9876", "Main St", "Regular", new Date(), true);
    vehicle = new Vehicle(1, "Honda", "Civic", 2022, "XYZ789", "Hatchback", 90, 20000, "Nelson", true, "Available");
    rental = new RentalTransaction(1, new Date(), new Date(Date.now() + 2 * 86400000), vehicle, customer, null, 0, 180, "Rented");
  });

  it("should create a rental and mark vehicle unavailable", function() {
    model.registerCustomer(customer);
    model.addVehicle(vehicle);
    expect(vehicle.availability).toBe(true);
    model.createTransaction(rental);
    expect(model.findVehicle(1).availability).toBe(false);
    expect(model.getRentals().length).toBe(1);
  });

  it("should prevent renting an already rented vehicle", function() {
    model.registerCustomer(customer);
    model.addVehicle(vehicle);
    model.createTransaction(rental);
    const another = new RentalTransaction(2, new Date(), new Date(Date.now() + 86400000), vehicle, customer);
    const result = model.createTransaction(another);
    expect(result).toBe(false);
  });

  it("should close the rental and make vehicle available again", function() {
    model.registerCustomer(customer);
    model.addVehicle(vehicle);
    model.createTransaction(rental);
    expect(vehicle.availability).toBe(false);
    model.closeTransaction(1, new Date());
    expect(model.findVehicle(1).availability).toBe(true);
  });
});


// ================================
// Reservation Management Tests
// ================================
describe("Reservation Management", function() {
  let model;
  let customer;
  let vehicle;
  let reservation;

  beforeEach(function() {
    model = new VRMSModel();
    model.customers = [];
    model.vehicles = [];
    model.reservations = [];

    customer = new Customer(1, "Bob", "bob@email.com", "1111", "Hill Street", "VIP", new Date(), true);
    vehicle = new Vehicle(1, "Mazda", "Axela", 2021, "REG456", "Sedan", 110, 30000, "Christchurch", true, "Available");
    reservation = new Reservation(1, vehicle, customer, new Date(), "Reserved");
  });

  it("should create a reservation successfully", function() {
    model.registerCustomer(customer);
    model.addVehicle(vehicle);
    const result = model.createReservation(reservation);
    expect(result).toBe(true);
    expect(model.getReservations().length).toBe(1);
    expect(model.getReservations()[0].status).toBe("Reserved");
  });

  it("should mark vehicle unavailable when reserved", function() {
    model.registerCustomer(customer);
    model.addVehicle(vehicle);
    model.createReservation(reservation);
    expect(model.findVehicle(1).availability).toBe(false);
  });

  it("should cancel a reservation and free vehicle", function() {
    model.registerCustomer(customer);
    model.addVehicle(vehicle);
    model.createReservation(reservation);
    model.cancelReservation(1);
    expect(model.getReservations()[0].status).toBe("Cancelled");
    expect(model.findVehicle(1).availability).toBe(true);
  });
});


// ================================
// Vehicle Search Tests
// ================================
describe("Vehicle Search", function() {
  let model;
  let v1, v2, v3;

  beforeEach(function() {
    model = new VRMSModel();
    model.vehicles = [];

    v1 = new Vehicle(1, "Toyota", "Yaris", 2020, "REG001", "Hatchback", 80, 25000, "Christchurch", true, "Available");
    v2 = new Vehicle(2, "Honda", "Civic", 2022, "REG002", "Sedan", 100, 20000, "Nelson", true, "Available");
    v3 = new Vehicle(3, "Toyota", "Corolla", 2021, "REG003", "Sedan", 95, 30000, "Auckland", true, "Available");

    model.addVehicle(v1);
    model.addVehicle(v2);
    model.addVehicle(v3);
  });

  it("should find vehicles by make", function() {
    const results = model.searchVehicles({ make: "Toyota" });
    expect(results.length).toBe(2);
  });

  it("should find vehicles by type and location", function() {
    const results = model.searchVehicles({ type: "Sedan", location: "Nelson" });
    expect(results.length).toBe(1);
    expect(results[0].model).toBe("Civic");
  });

  it("should return empty array for unmatched queries", function() {
    const results = model.searchVehicles({ make: "Ford" });
    expect(results.length).toBe(0);
  });
});
