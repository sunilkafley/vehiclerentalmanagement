// ==============================================
// Vehicle Rental Management System – CONTROLLER
// ==============================================

class VRMSController {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    // Forms
    this.customerForm = document.getElementById('customerForm');
    this.vehicleForm = document.getElementById('vehicleForm');
    this.rentalForm = document.getElementById('rentalForm');
    this.reservationForm = document.getElementById('reserveForm');

    // ====== Event bindings ======
    if (this.customerForm)
      this.customerForm.addEventListener('submit', this.registerNewCustomer.bind(this));

    if (this.vehicleForm)
      this.vehicleForm.addEventListener('submit', this.addNewVehicle.bind(this));

    if (this.rentalForm)
      this.rentalForm.addEventListener('submit', this.handleConfirmRent.bind(this));

    if (this.reservationForm)
      this.reservationForm.addEventListener('submit', this.handleConfirmReservation.bind(this));

    // Search inputs
    ['searchType', 'searchMake', 'searchModel', 'searchLocation'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', this.handleVehicleSearch.bind(this));
        el.addEventListener('change', this.handleVehicleSearch.bind(this));
      }
    });

    // ====== Initial render ======
    this.view.updateCustomerTable(this.model.getCustomers());
    this.view.updateVehicleTable(this.model.getVehicles());
    this.view.updateRentalTable(this.model.getRentals());
    if (this.view.updateReturnedVehiclesTable)
      this.view.updateReturnedVehiclesTable(this.model.getRentals());
    if (this.view.updateCurrentReservationsTable)
      this.view.updateCurrentReservationsTable(this.model.getReservations());

    this.handleVehicleSearch();
    this.updateAvailableRentalsView();
    this.handleRentButtons();
    this.updateAvailableReservationsView();
    this.addAllListeners();
    
    this.handleReturnVehicles();
    this.setupCancelReservationButton();
    this.setupCancelRentButton();
  }

  // ================= CUSTOMERS =================
  registerNewCustomer(event) {
    event.preventDefault();
    const fullName = document.getElementById('customerName').value.trim();
    const email = document.getElementById('customerEmail').value.trim();
    const phoneNumber = document.getElementById('customerPhone').value.trim();
    const address = document.getElementById('customerAddress').value.trim();
    const type = document.getElementById('customerType').value;

    const customers = this.model.getCustomers();
    const newId = customers.reduce((max, c) => Math.max(max, Number(c.customerId) || 0), 0) + 1;
    const newCustomer = new Customer(newId, fullName, email, phoneNumber, address, type, new Date(), true);

    this.model.registerCustomer(newCustomer);
    this.view.clearCustomerForm();
    this.view.updateCustomerTable(this.model.getCustomers());
    this.addAllListeners();
  }

  editCustomer(event) {
    const id = Number(event.target.getAttribute('customer-id'));
    const customer = this.model.findCustomer(id);
    if (!customer) return;
    this.view.createCustomerInputs(customer);
    this.addAllListeners();
  }

  updateCustomer(event) {
    const id = Number(event.target.getAttribute('customer-id'));
    const fullName = document.getElementById('updateFullName').value.trim();
    const email = document.getElementById('updateEmail').value.trim();
    const phoneNumber = document.getElementById('updatePhoneNumber').value.trim();
    const address = document.getElementById('updateAddress').value.trim();
    const type = document.getElementById('updateType').value;

    const temp = new Customer(id, fullName, email, phoneNumber, address, type, new Date(), true);
    this.model.updateCustomer(temp);
    this.view.updateCustomerTable(this.model.getCustomers());
    this.addAllListeners();
  }

  deactivateCustomer(event) {
    const id = Number(event.target.getAttribute('customer-id'));
    this.model.deactivateCustomer(id);
    this.view.updateCustomerTable(this.model.getCustomers());
    this.addAllListeners();
  }

  cancelCustomerEdit() {
    this.view.updateCustomerTable(this.model.getCustomers());
    this.addAllListeners();
  }

  // ================= VEHICLES =================
  addNewVehicle(event) {
    event.preventDefault();
    const make = document.getElementById('vehicleMake').value.trim();
    const modelName = document.getElementById('vehicleModel').value.trim();
    const year = document.getElementById('vehicleYear').value.trim();
    const registrationNumber = document.getElementById('vehicleReg').value.trim();
    const type = document.getElementById('vehicleType').value;
    const dailyRate = Number(document.getElementById('vehicleRate').value);
    const mileage = document.getElementById('vehicleMileage').value.trim();
    const location = document.getElementById('vehicleLocation').value.trim();

    const vehicles = this.model.getVehicles();
    const newId = vehicles.reduce((max, v) => Math.max(max, Number(v.vehicleId) || 0), 0) + 1;
    const newVehicle = new Vehicle(newId, make, modelName, year, registrationNumber, type, dailyRate, mileage, location, true, 'Available');

    this.model.addVehicle(newVehicle);
    this.view.clearVehicleForm();
    this.view.updateVehicleTable(this.model.getVehicles());
    this.view.updateAvailableRentalsTable(this.model.getVehicles());
    this.view.updateAvailableReservationsTable(this.model.getVehicles());
    this.handleVehicleSearch(); 
    this.addAllListeners();
    this.addAllListeners();
    this.handleRentButtons();
    this.handleReserveButtons();
  }

  editVehicle(event) {
    const id = Number(event.target.getAttribute('vehicle-id'));
    const vehicle = this.model.findVehicle(id);
    if (!vehicle) return;
    this.view.createVehicleInputs(vehicle);
    this.addAllListeners();
  }

  updateVehicle(event) {
    const id = Number(event.target.getAttribute('vehicle-id'));
    const make = document.getElementById('updateMake').value.trim();
    const modelName = document.getElementById('updateModel').value.trim();
    const year = document.getElementById('updateYear').value.trim();
    const registrationNumber = document.getElementById('updateRegNumber').value.trim();
    const type = document.getElementById('updateType').value;
    const dailyRate = Number(document.getElementById('updateDailyRate').value);
    const mileage = document.getElementById('updateMileage').value.trim();
    const location = document.getElementById('updateLocation').value.trim();
    const availability = document.getElementById('updateAvailability').checked;

    const temp = new Vehicle(id, make, modelName, year, registrationNumber, type, dailyRate, mileage, location, availability);
    this.model.updateVehicle(temp);
    this.view.updateVehicleTable(this.model.getVehicles());
    this.handleVehicleSearch();
    this.updateAvailableRentalsView();
    this.updateAvailableReservationsView();
    this.addAllListeners();
  }

  removeVehicle(event) {
    const id = Number(event.target.getAttribute('vehicle-id'));
    this.model.removeVehicle(id);
    this.view.updateVehicleTable(this.model.getVehicles());
    this.handleVehicleSearch();
    this.addAllListeners();
  }

  cancelVehicleEdit() {
    this.view.updateVehicleTable(this.model.getVehicles());
    this.addAllListeners();
  }

  // ================= SEARCH =================
  handleVehicleSearch() {
    const type = (document.getElementById('searchType')?.value || '').trim();
    const make = (document.getElementById('searchMake')?.value || '').trim();
    const model = (document.getElementById('searchModel')?.value || '').trim();
    const location = (document.getElementById('searchLocation')?.value || '').trim();
    const results = this.model.searchVehicles({ type, make, model, location });
    this.view.updateVehicleSearch(results);
  }

  // ================= RENTALS =================
  updateAvailableRentalsView() {
    this.view.updateAvailableRentalsTable(this.model.getVehicles());
    this.handleRentButtons();
  }

  handleRentButtons() {
    const rentButtons = document.querySelectorAll('.rentButton');
    rentButtons.forEach(button => {
      button.addEventListener('click', () => {
        const vehicleId = Number(button.dataset.id);
        const vehicle = this.model.findVehicle(vehicleId);
        if (!vehicle || !vehicle.availability) {
          alert('Vehicle not available.');
          return;
        }

        document.getElementById('rentVehicleId').value = vehicle.vehicleId;
        this.availableCustomerDropdown();
        document.getElementById('rentFormContainer').style.display = 'block';
        this.setupCancelRentButton();
      });
    });
  }

  availableCustomerDropdown() {
    const select = document.getElementById('rentCustomerSelect');
    select.innerHTML = '<option value="" disabled selected>Select Customer</option>';
    const activeCustomers = this.model.getCustomers().filter(c => c.activeStatus);
    activeCustomers.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.customerId;
      opt.textContent = c.fullName;
      select.appendChild(opt);
    });
  }

handleConfirmRent(event) {
  event.preventDefault();

  const vehicleId = Number(document.getElementById('rentVehicleId').value);
  const customerId = Number(document.getElementById('rentCustomerSelect').value);
  const rentalDate = document.getElementById('rentDate').value;
  const returnDate = document.getElementById('plannedReturnDate').value;

  if (!rentalDate || !returnDate) {
    alert('Please select both rental and return dates.');
    return;
  }

  // Validate: Return date cannot be before rental date
  if (new Date(returnDate) < new Date(rentalDate)) {
    alert('⚠️ Planned return date cannot be earlier than rental date.');
    return;
  }

  const vehicle = this.model.findVehicle(vehicleId);
  const customer = this.model.findCustomer(customerId);

  if (!vehicle || !customer) return alert('Invalid vehicle or customer selected.');

  const days = Math.max(
    1,
    Math.ceil((new Date(returnDate) - new Date(rentalDate)) / (1000 * 60 * 60 * 24))
  );
  const totalFee = (days * vehicle.dailyRate).toFixed(2);

  const rentals = this.model.getRentals();
  const newId = rentals.reduce((max, r) => Math.max(max, Number(r.rentalId) || 0), 0) + 1;

  const rental = new RentalTransaction(
    newId,
    rentalDate,
    returnDate,
    vehicle,
    customer,
    null,
    0,
    totalFee,
    'Rented'
  );

  const success = this.model.createTransaction(rental);
  if (!success) {
    alert('Vehicle not available for rent.');
    return;
  }

  vehicle.availability = false;
  vehicle.status = 'Rented';
  this.model.saveItemToStorage('vehicle_list', this.model.getVehicles());


  this.refreshVehicleTable();
  this.view.updateRentalTable(this.model.getRentals());
  this.view.updateAvailableRentalsTable(this.model.getVehicles());
  this.view.updateAvailableReservationsTable(this.model.getVehicles()); 
  this.handleVehicleSearch();

  alert(
    `✅ ${vehicle.make} ${vehicle.model} rented to ${customer.fullName}\n` +
      `Duration: ${days} day(s)\nTotal Fee: $${totalFee}`
  );

  document.getElementById('rentalForm').reset();
  document.getElementById('rentFormContainer').style.display = 'none';

  // Rebind event handlers
  this.handleRentButtons();
  this.handleReturnVehicles();

  this.view.updateAvailableReservationsTable(this.model.getVehicles());
  this.handleReserveButtons();
  this.addCancelReservationListeners();
  
}


handleReturnVehicles() {
  const buttons = document.querySelectorAll('.returnVehicleButton');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const rentalId = Number(btn.dataset.id);
      const rental = this.model.findRental(rentalId);
      if (!rental) return alert('Rental not found.');

      const today = new Date();
      const plannedReturn = new Date(rental.returnDate);
      const rentalStart = new Date(rental.rentalDate);

      // Calculate overdue days
      let overdueDays = 0;
      if (today > plannedReturn) {
        overdueDays = Math.ceil((today - plannedReturn) / (1000 * 60 * 60 * 24));
        alert(`⚠️ Vehicle overdue by ${overdueDays} day(s)!`);
      }

      // Compute total fee
      const totalDays = Math.max(1, Math.ceil((today - rentalStart) / (1000 * 60 * 60 * 24)));
      let rentalFee = totalDays * rental.vehicle.dailyRate;
      if (overdueDays > 0) rentalFee += overdueDays * rental.vehicle.dailyRate * 0.2; // small fine

      const ok = this.model.closeTransaction(rentalId, today, rentalFee);
      if (ok) {
        alert(`✅ Vehicle returned successfully.\nTotal Fee: $${rentalFee.toFixed(2)}`);
        this.refreshRentalsView();
        this.refreshVehicleTable();
        this.view.updateAvailableReservationsTable(this.model.getVehicles()); 
        this.handleVehicleSearch();

        this.handleRentButtons();
        this.handleReserveButtons();
        this.addCancelReservationListeners();
      }
    });
  });
}


  // ================= RESERVATIONS =================
  updateAvailableReservationsView() {
    this.view.updateAvailableReservationsTable(this.model.getVehicles());
    this.handleReserveButtons();
  }

  handleReserveButtons() {
    const reserveButtons = document.querySelectorAll('.reserveButton');
    reserveButtons.forEach(button => {
      button.addEventListener('click', () => {
        const vehicleId = Number(button.dataset.id);
        const vehicle = this.model.findVehicle(vehicleId);
        if (!vehicle || !vehicle.availability) {
          alert('Vehicle not available.');
          return;
        }
        document.getElementById('reserveVehicleId').value = vehicle.vehicleId;
        this.populateReservationCustomerDropdown();
        document.getElementById('reserveFormContainer').style.display = 'block';
      });
    });
  }

  populateReservationCustomerDropdown() {
    const select = document.getElementById('reserveCustomerSelect');
    select.innerHTML = '<option value="" disabled selected>Select Customer</option>';
    const active = this.model.getCustomers().filter(c => c.activeStatus);
    active.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.customerId;
      opt.textContent = c.fullName;
      select.appendChild(opt);
    });
  }

handleConfirmReservation(event) {
  event.preventDefault();

  const vehicleId = Number(document.getElementById('reserveVehicleId').value);
  const customerId = Number(document.getElementById('reserveCustomerSelect').value);
  const dateValue = document.getElementById('reserveDate').value;

  const vehicle = this.model.findVehicle(vehicleId);
  const customer = this.model.findCustomer(customerId);

  if (!vehicle || !customer || !dateValue) {
    alert('Please complete all fields.');
    return;
  }

  const reservations = this.model.getReservations();
  const newId = reservations.reduce((max, r) => Math.max(max, Number(r.reservationId) || 0), 0) + 1;
  const reservation = new Reservation(newId, vehicle, customer, new Date(dateValue), 'Reserved');

  const success = this.model.createReservation(reservation);

  if (success) {
    // Update vehicle to "Reserved"
    vehicle.availability = false;
    vehicle.status = 'Reserved';
    this.model.saveItemToStorage('vehicle_list', this.model.getVehicles());

    // Update all tables dynamically
    this.refreshVehicleTable();
    this.view.updateAvailableRentalsTable(this.model.getVehicles());
    this.view.updateAvailableReservationsTable(this.model.getVehicles());
    this.view.updateCurrentReservationsTable(this.model.getReservations());
    this.handleVehicleSearch();

    alert(`✅ ${vehicle.make} ${vehicle.model} reserved for ${customer.fullName}.`);

    document.getElementById('reserveFormContainer').style.display = 'none';
    document.getElementById('reserveForm').reset();

    // Rebind listeners
    this.handleReserveButtons();
    this.handleRentButtons();
    this.addCancelReservationListeners();
  } else {
    alert('Reservation failed.');
  }
}


  handleCancelReservation(event) {
    const id = Number(event.target.dataset.id);
    const ok = this.model.cancelReservation(id);

    if (ok) {
    
      const reservation = this.model.getReservations().find(r => r.reservationId === id);
      if (reservation && reservation.reservedVehicle) {
        const v = this.model.findVehicle(reservation.reservedVehicle.vehicleId);
        if (v) {
          v.availability = true;
          v.status = 'Available';
          this.model.saveItemToStorage('vehicle_list', this.model.getVehicles());
        }
      }

      this.refreshVehicleTable();
      this.view.updateCurrentReservationsTable(this.model.getReservations());
      this.view.updateAvailableReservationsTable(this.model.getVehicles());
      this.view.updateAvailableRentalsTable(this.model.getVehicles()); 
      this.handleVehicleSearch();

      alert('✅ Reservation canceled and vehicle made available again.');
      
      this.handleRentButtons();
      this.handleReserveButtons();
      this.addCancelReservationListeners();
    } else {
      alert('Cancellation failed.');
    }
}

 // ================= Cancel when user dont want to rent or reserve =================

  setupCancelReservationButton() {
    const cancelBtn = document.getElementById('cancelReserveButton');
    if (!cancelBtn) return;

    cancelBtn.addEventListener('click', () => {
      const formContainer = document.getElementById('reserveFormContainer');
      const form = document.getElementById('reserveForm');
      if (formContainer) formContainer.style.display = 'none';
      if (form) form.reset();
    });
  }

  setupCancelRentButton() {
    const cancelBtn = document.getElementById('cancelRentButton');
    if (!cancelBtn) return;

    cancelBtn.addEventListener('click', () => {
      const formContainer = document.getElementById('rentFormContainer');
      const form = document.getElementById('rentalForm');
      if (formContainer) formContainer.style.display = 'none';
      if (form) form.reset();
    });
  }

 // ================= REFRESH HELPERS =================
 
  refreshRentalsView() {
    this.view.updateAvailableRentalsTable(this.model.getVehicles());
    this.view.updateRentalTable(this.model.getRentals());
    if (this.view.updateReturnedVehiclesTable)
      this.view.updateReturnedVehiclesTable(this.model.getRentals());
    this.handleRentButtons();
    this.handleReturnVehicles();
  }

  refreshReservationsView() {
    this.view.updateAvailableReservationsTable(this.model.getVehicles());
    this.view.updateCurrentReservationsTable(this.model.getReservations());
    this.handleReserveButtons();
    this.addCancelReservationListeners();
    this.setupCancelReservationButton();
    this.setupCancelRentButton();
  }

 
  refreshVehicleTable() {
    this.view.updateVehicleTable(this.model.getVehicles());
    this.addAllListeners(); // Rebind update/remove listeners after DOM refresh
  }

  // ================= LISTENERS =================
addUpdateListeners() {
  // Customer update buttons
  document.querySelectorAll('#customerTable .updateButton')
    .forEach(btn => btn.addEventListener('click', this.editCustomer.bind(this)));

  // Vehicle update buttons (only in Vehicle Management section)
  document.querySelectorAll('#vehicles #vehicleTable .updateButton').forEach(btn => {
    const row = btn.closest('tr');
    const statusCell = row?.querySelector('.status-available, .status-unavailable');
    if (!statusCell) return;

    const status = statusCell.textContent.trim().toLowerCase();
    const isAvailable = status === 'available';

    btn.disabled = !isAvailable;
    btn.style.opacity = isAvailable ? '1' : '0.6';
    btn.style.cursor = isAvailable ? 'pointer' : 'not-allowed';

    if (isAvailable) btn.addEventListener('click', this.editVehicle.bind(this));
  });
}

addRemoveListeners() {
  // Customer deactivate buttons
  document.querySelectorAll('#customerTable .deactivateButton')
    .forEach(btn => btn.addEventListener('click', this.deactivateCustomer.bind(this)));

  // Vehicle remove buttons (only in Vehicle Management section)
  document.querySelectorAll('#vehicles #vehicleTable .removeButton').forEach(btn => {
    const row = btn.closest('tr');
    const statusCell = row?.querySelector('.status-available, .status-unavailable');
    if (!statusCell) return;

    const status = statusCell.textContent.trim().toLowerCase();
    const isAvailable = status === 'available';

    btn.disabled = !isAvailable;
    btn.style.opacity = isAvailable ? '1' : '0.6';
    btn.style.cursor = isAvailable ? 'pointer' : 'not-allowed';

    if (isAvailable) btn.addEventListener('click', this.removeVehicle.bind(this));
  });
}

 addCancelReservationListeners() {
    document.querySelectorAll('.cancelReservationButton')
      .forEach(btn => btn.addEventListener('click', this.handleCancelReservation.bind(this)));
  }


  addSaveListeners() {
    document.querySelectorAll('#customerTable .saveButton')
      .forEach(btn => btn.addEventListener('click', this.updateCustomer.bind(this)));

    document.querySelectorAll('#vehicleTable .saveButton')
      .forEach(btn => btn.addEventListener('click', this.updateVehicle.bind(this)));
  }

  addCancelListeners() {
    document.querySelectorAll('#customerTable .cancelButton')
      .forEach(btn => btn.addEventListener('click', this.cancelCustomerEdit.bind(this)));

    document.querySelectorAll('#vehicleTable .cancelButton')
      .forEach(btn => btn.addEventListener('click', this.cancelVehicleEdit.bind(this)));
  }

  addAllListeners() {
    this.addRemoveListeners();
    this.addUpdateListeners();
    this.addSaveListeners();
    this.addCancelListeners();
  }
}

// Initialize app
function setup() {
  const view = new VRMSView();
  const model = new VRMSModel(view);
  new VRMSController(model, view);
}
