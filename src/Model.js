// ========================================
// Vehicle Rental Management System – MODEL
// ========================================


// Local Storage Keys
const VEHICLEKEY = 'vehicle_list';
const CUSTOMERKEY = 'customer_list';
const RENTALKEY = 'rental_list';
const RESERVATIONKEY = 'reservation_list';

class VRMSModel {
  constructor(view) {
    this.view = view;

    // Load data from local storage
    this.vehicles = this.loadItemFromStorage(VEHICLEKEY);
    this.customers = this.loadItemFromStorage(CUSTOMERKEY);
    this.rentals = this.loadItemFromStorage(RENTALKEY);
    this.reservations = this.loadItemFromStorage(RESERVATIONKEY);

    // Overdue checking loop (1s for demo)
    setInterval(this.checkOverdueRentals.bind(this), 1000);

    this.isJasmine = document.getElementsByClassName('jasmine_html-reporter').length;
  }

  // ================================
  // Storage & Utility
  // ================================
 loadItemFromStorage(key) {
    const objJSON = localStorage.getItem(key);
    const objs = objJSON ? JSON.parse(objJSON) : [];

    if (key === RENTALKEY) {
      objs.forEach(r => {
        r.rentalDate = this.stringToDate(r.rentalDate);
        r.returnDate = this.stringToDate(r.returnDate);
        r.actualReturnDate = r.actualReturnDate ? this.stringToDate(r.actualReturnDate) : null;
      });
      return objs.map(r => new RentalTransaction(
        r.rentalId, r.rentalDate, r.returnDate, r.vehicle, r.customer,
        r.actualReturnDate, r.overdueDays, r.rentalFee, r.status
      ));
    }

    if (key === RESERVATIONKEY) {
      objs.forEach(res => (res.reservationDate = this.stringToDate(res.reservationDate)));
      return objs.map(r => new Reservation(
        r.reservationId, r.reservedVehicle, r.reservingCustomer, r.reservationDate, r.status
      ));
    }

    return objs;
  }

  saveItemToStorage(key, list) {
    localStorage.setItem(key, JSON.stringify(list));
  }

  stringToDate(value) {
    return new Date(Date.parse(value));
  }

  // ================================
  // Customer Management
  // ================================

  //Register Customer
  registerCustomer(customer) {
    
    if (this.customers.some(c => String(c.customerId) === String(customer.customerId))) {
      const next = this.customers.reduce((m, c) => Math.max(m, Number(c.customerId) || 0), 0) + 1;
      customer.customerId = next;
    }
    this.customers.push(customer);
    this.saveItemToStorage(CUSTOMERKEY, this.getCustomers());
  }

  // Update Customer Info
  updateCustomer(customer) {
    const c = this.findCustomer(customer.customerId);
    if (!c) return false;
    c.fullName = customer.fullName;
    c.email = customer.email;
    c.phoneNumber = customer.phoneNumber;
    c.address = customer.address;
    c.type = customer.type;
    this.saveItemToStorage(CUSTOMERKEY, this.getCustomers());
    return true;
  }

  //Deactivate Customer
  deactivateCustomer(customerId) {
    const customer = this.customers.find(c => String(c.customerId) === String(customerId));
    if (customer) {
      customer.activeStatus = false;
      this.saveItemToStorage(CUSTOMERKEY, this.customers);
      return true;
    }
    return false;
  }

  getCustomers() { return this.customers; }

  findCustomer(id) {
    return this.customers.find(c => String(c.customerId) === String(id)) || null;
  }

  // ================================
  // Vehicle Management
  // ================================

  // Add Vehicle
  addVehicle(vehicle) {
    if (this.vehicles.some(v => String(v.vehicleId) === String(vehicle.vehicleId))) {
      const next = this.vehicles.reduce((m, v) => Math.max(m, Number(v.vehicleId) || 0), 0) + 1;
      vehicle.vehicleId = next;
    }
    this.vehicles.push(vehicle);
    this.saveItemToStorage(VEHICLEKEY, this.getVehicles());
  }

  // Update Vehicle Info
  updateVehicle(vehicle) {
    const v = this.findVehicle(vehicle.vehicleId);
    if (!v) return false;
    v.make = vehicle.make;
    v.model = vehicle.model;
    v.year = vehicle.year;
    v.registrationNumber = vehicle.registrationNumber;
    v.type = vehicle.type;
    v.dailyRate = Number(vehicle.dailyRate);
    v.mileage = vehicle.mileage;
    v.location = vehicle.location;
    v.availability = Boolean(vehicle.availability);
    v.status = vehicle.status || v.status;
    this.saveItemToStorage(VEHICLEKEY, this.getVehicles());
    return true;
  }

  // Remove Vehicle
  removeVehicle(id) {
    this.vehicles = this.vehicles.filter(v => String(v.vehicleId) !== String(id));
    this.saveItemToStorage(VEHICLEKEY, this.getVehicles());
  }

  getVehicles() { return this.vehicles; }

  findVehicle(id) {
    return this.vehicles.find(v => String(v.vehicleId) === String(id)) || null;
  }

  // Search Vehicles
  searchVehicles({ type = '', make = '', model = '', location = '' }) {
    const t = type.toLowerCase();
    const mk = make.toLowerCase();
    const mdl = model.toLowerCase();
    const loc = location.toLowerCase();
    return this.vehicles.filter(v =>
      String(v.type || '').toLowerCase().includes(t) &&
      String(v.make || '').toLowerCase().includes(mk) &&
      String(v.model || '').toLowerCase().includes(mdl) &&
      String(v.location || '').toLowerCase().includes(loc)
    );
  }

  // ================================
  // Rental Transactions
  // ================================

  //Create Rental Transaction
  createTransaction(rental) {
    if (!rental.vehicle || !rental.customer) return false;

  const vehicle = this.findVehicle(rental.vehicle.vehicleId);
    if (!vehicle || !vehicle.availability) return false;

  //  Mark vehicle unavailable
    vehicle.availability = false;
    vehicle.status = 'Rented';

  // Attach updated vehicle and set rental status
    rental.vehicle = vehicle;
    rental.status = 'Rented';
    rental.actualReturnDate = null;

    this.rentals.push(rental);

    this.saveItemToStorage(RENTALKEY, this.rentals);
    this.saveItemToStorage(VEHICLEKEY, this.vehicles);
    return true;
}

 // Close Rental Transaction
  closeTransaction(rentalId, actualReturnDate, rentalFee) {
    const rental = this.rentals.find(r => r.rentalId === rentalId);
    if (!rental) return false;

    rental.actualReturnDate = actualReturnDate;
    rental.rentalFee = Number(rentalFee);
    rental.status = 'Returned';

    // Make the vehicle available again
    const vehicle = this.findVehicle(rental.vehicle.vehicleId);
    if (vehicle) {
      vehicle.availability = true;
      vehicle.status = 'Available';
    }

    // Persist updated rentals and vehicles
    this.saveItemToStorage(RENTALKEY, this.rentals);
    this.saveItemToStorage(VEHICLEKEY, this.vehicles);

  return true;
}

// Calculate Rental Fees
  calculateFees(rental) {
    const start = rental.rentalDate;
    const end = rental.actualReturnDate || rental.returnDate;
    const rentalDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    let total = rentalDays * Number(rental.vehicle.dailyRate || 0);
    if (rental.overdueDays > 0) total += rental.overdueDays * Number(rental.vehicle.dailyRate || 0) * 0.2;
    return total;
  }

  findRental(id) {
  return this.rentals.find(r => Number(r.rentalId) === Number(id));
}

  getRentals() { return this.rentals; }

  findActiveRental(vehicleId) {
    return this.rentals.find(r => String(r.vehicle.vehicleId) === String(vehicleId) && (r.status === 'Rented' || r.status === 'Overdue')) || null;
  }

  //Check Overdue Rentals
  checkOverdueRentals() {
    const now = new Date();
    let mutated = false;
    this.rentals.forEach(r => {
      if (r.status === 'Rented' && now > r.returnDate) {
        r.status = 'Overdue';
        r.overdueDays = Math.ceil((now - r.returnDate) / (1000 * 60 * 60 * 24));
        r.rentalFee = this.calculateFees(r);
        mutated = true;
      }
    });
    if (mutated) this.saveItemToStorage(RENTALKEY, this.rentals);
  }

  // ================================
  // Reservation Management
  // ================================

  //Create Reservation
  createReservation(reservation) {
    const vehicle = this.findVehicle(reservation.reservedVehicle?.vehicleId);
    const customer = this.findCustomer(reservation.reservingCustomer?.customerId);

    if (!vehicle || !customer || vehicle.availability === false) return false;
    vehicle.availability = false; 
    reservation.reservedVehicle = vehicle;
    reservation.reservingCustomer = customer;
    reservation.status = 'Reserved';
    this.reservations.push(reservation);

    this.saveItemToStorage(RESERVATIONKEY, this.reservations);
    this.saveItemToStorage(VEHICLEKEY, this.vehicles);
    return true;
  }

  // Cancel Reservation
  cancelReservation(reservationId) {
    const reservation = this.reservations.find(r => String(r.reservationId) === String(reservationId));
    if (!reservation) return false;

    reservation.status = 'Cancelled';

    const vehicle = this.findVehicle(reservation.reservedVehicle?.vehicleId);
    if (vehicle) {
    vehicle.availability = true;
    vehicle.status = 'Available'; 
  }

    this.saveItemToStorage(RESERVATIONKEY, this.reservations);
    this.saveItemToStorage(VEHICLEKEY, this.vehicles);
    return true;
  }

  // Check Reservation Status
  checkReservationStatus(reservationId) {
    const r = this.reservations.find(x => String(x.reservationId) === String(reservationId));
    return r ? r.status : 'Not Found';
  }

  getReservations() { return this.reservations; }
}

// ================================
//         Core Classes 
// ================================

class User {
  constructor(userId, fullName, email, phoneNumber) {
    this.userId = userId;
    this.fullName = fullName;
    this.email = email;
    this.phoneNumber = phoneNumber;
  }
}

class Customer extends User {
  constructor(customerId, fullName, email, phoneNumber, address, type, registrationDate, activeStatus = true) {
    super(customerId, fullName, email, phoneNumber);
    this.customerId = customerId;
    this.address = address;
    this.type = type;
    this.registrationDate = registrationDate;
    this.activeStatus = activeStatus;
  }
}

class Staff extends User {
  constructor(staffId, fullName, email, phoneNumber, role) {
    super(staffId, fullName, email, phoneNumber);
    this.staffId = staffId;
    this.role = role;
  }
}


class Vehicle {
  constructor(vehicleId, make, model, year, registrationNumber, type, dailyRate, mileage, location, availability = true, status = 'Available') {
    this.vehicleId = vehicleId;
    this.make = make;
    this.model = model;
    this.year = year;
    this.registrationNumber = registrationNumber;
    this.type = type;
    this.dailyRate = dailyRate;
    this.mileage = mileage;
    this.location = location;
    this.availability = availability;
    this.status = status;
  }
}

class RentalTransaction {
  constructor(rentalId, rentalDate, returnDate, vehicle, customer, actualReturnDate = null, overdueDays = 0, rentalFee = 0, status = 'Rented') {
    this.rentalId = rentalId;
    this.rentalDate = new Date(rentalDate);
    this.returnDate = new Date(returnDate);
    this.actualReturnDate = actualReturnDate ? new Date(actualReturnDate) : null;
    this.overdueDays = overdueDays;
    this.rentalFee = rentalFee;
    this.status = status;
    this.vehicle = vehicle;
    this.customer = customer;
  }
}

class Reservation {
  constructor(reservationId, reservedVehicle, reservingCustomer, reservationDate, status = 'Active') {
    this.reservationId = reservationId;
    this.reservedVehicle = reservedVehicle;
    this.reservingCustomer = reservingCustomer;
    this.reservationDate = new Date(reservationDate);
    this.status = status;
  }
}
