
// ========================================
// Vehicle Rental Management System – VIEW
// ========================================

class VRMSView {
  constructor() {
    // Table bodies
    this.customerTableBody = document.querySelector('#customerTable tbody');
    this.vehicleTableBody = document.querySelector('#vehicleTable tbody');
    this.rentalTableBody = document.getElementById('rentalTableBody');
    this.reservationTableBody = document.getElementById('reservationTableBody');
    this.vehicleSearchResults = document.getElementById('vehicleSearchResults');
  }

  // ================= Customers =================
  clearCustomerForm() {
    document.getElementById('customerForm')?.reset();
  }

  updateCustomerTable(customers) {
    if (!this.customerTableBody) return;
    this.customerTableBody.innerHTML = '';
    customers.forEach(customer => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${customer.customerId}</td>
        <td>${customer.fullName}</td>
        <td>${customer.email}</td>
        <td>${customer.phoneNumber}</td>
        <td>${customer.address}</td>
        <td>${customer.type}</td>
        <td class="${customer.activeStatus ? 'status-active' : 'status-inactive'}">${customer.activeStatus ? 'Active' : 'Inactive'}</td>
        <td>
          <div style="display:flex; justify-content:center; gap:8px;">
            <button class="updateButton" customer-id="${customer.customerId}">Update</button>
            <button class="deactivateButton" customer-id="${customer.customerId}">Deactivate</button>
            </div>
        </td>`;
      this.customerTableBody.appendChild(row);
    });
  }

  createCustomerInputs(customer) {
  const actionBtn = document.querySelector(`#customerTable .updateButton[customer-id="${customer.customerId}"]`);
    if (!actionBtn) return;
    const row = actionBtn.closest('tr');
    row.innerHTML = `
        <td>${customer.customerId}</td>
        <td><input id="updateFullName" type="text" size="20" value="${customer.fullName}" required></td>
        <td><input id="updateEmail" type="email" size="25" value="${customer.email}"></td>
        <td><input id="updatePhoneNumber" type="text" size="12"value="${customer.phoneNumber}"></td>
        <td><input id="updateAddress" type="text" value="${customer.address}"></td>
        <td>
            <select id="updateType" required>
                <option value="" hidden>Select Type</option>
                <option value="Private" ${customer.type === 'Private' ? 'selected' : ''}>Private</option>
                <option value="Corporate" ${customer.type === 'Corporate' ? 'selected' : ''}>Corporate</option>
             </select>
        </td>
        <td>${customer.activeStatus ? 'Active' : 'Inactive'}</td>
        <td>
        <div style="display:flex; justify-content:center; gap:8px;">
            <button type="button" class="saveButton" customer-id="${customer.customerId}">Save</button>
            <button type="button" class="cancelButton" customer-id="${customer.customerId}">Cancel</button>
        </div>
        </td>`;
}

  // ================= Vehicles =================
  clearVehicleForm() {
    document.getElementById('vehicleForm')?.reset();
  }

  updateVehicleTable(vehicles) {
  if (!this.vehicleTableBody) return;
  this.vehicleTableBody.innerHTML = '';

  vehicles.forEach(v => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${v.vehicleId}</td>
      <td>${v.make}</td>
      <td>${v.model}</td>
      <td>${v.year}</td>
      <td>${v.registrationNumber}</td>
      <td>${v.type}</td>
      <td>$${parseFloat(v.dailyRate).toFixed(2)}</td>
      <td>${Number(v.mileage).toLocaleString('en-NZ')} km</td>
      <td>${v.location}</td>
      <td class="${v.availability ? 'status-available' : 'status-unavailable'}">
        ${v.availability ? 'Available' : 'Not Available'}</td>
      <td>
        <div style="display:flex; justify-content:center; gap:8px;">
          <button class="updateButton" vehicle-id="${v.vehicleId}">Update Vehicle Info</button>
          <button class="removeButton" vehicle-id="${v.vehicleId}">Remove</button>
        </div>
      </td>`;
    this.vehicleTableBody.appendChild(row);
  });
}


  updateVehicleSearch(results) {
    if (!this.vehicleSearchResults) return;
    this.vehicleSearchResults.innerHTML = '';

    const headerRow = document.createElement('tr');
    headerRow.innerHTML = `
        <th>Vehicle ID</th>
        <th>Make</th>
        <th>Model</th>
        <th>Year</th>
        <th>Type</th>
        <th>Location</th>
        <th>Daily Rate</th>
        <th>Availability</th>`;
    this.vehicleSearchResults.appendChild(headerRow);

    if (!results || results.length === 0) {
      this.vehicleSearchResults.innerHTML = `<tr><td colspan="8">No vehicles found</td></tr>`;
      return;
    }
    results.forEach(v => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${v.vehicleId}</td>
        <td>${v.make}</td>
        <td>${v.model}</td>
        <td>${v.year}</td>
        <td>${v.type}</td>
        <td>${v.location}</td>
        <td>$${parseFloat(v.dailyRate).toFixed(2)}</td>
        <td class="${v.availability ? 'status-available' : 'status-unavailable'}">${v.availability ? 'Yes' : 'No'}</td>`;
      this.vehicleSearchResults.appendChild(tr);
    });
  }

  createVehicleInputs(vehicle) {
    const actionBtn = document.querySelector(`#vehicleTable .updateButton[vehicle-id="${vehicle.vehicleId}"]`);
    if (!actionBtn) return;
    const row = actionBtn.closest('tr');

    // Generate dropdown list of years from 2000 → current year
    const currentYear = new Date().getFullYear();
    let yearOptions = '<option value="" disabled>Select Year</option>';
    for (let y = currentYear; y >= 2000; y--) {
      yearOptions += `<option value="${y}" ${vehicle.year == y ? 'selected' : ''}>${y}</option>`;
    }

    row.innerHTML = `
      <td>${vehicle.vehicleId}</td>
      <td><input id="updateMake" type="text" value="${vehicle.make}" required></td>
      <td><input id="updateModel" type="text" value="${vehicle.model}" required></td>

      <!-- ✅ Scrollable Year Dropdown -->
      <td>
        <select id="updateYear" class="year-select" required>
          ${yearOptions}
        </select>
      </td>

      <td><input id="updateRegNumber" type="text" value="${vehicle.registrationNumber}" required></td>
      <td><input id="updateType" type="text" value="${vehicle.type}" required></td>

      <!-- ✅ Daily Rate with $ prefix -->
      <td>
        <div style="display:flex; align-items:center; justify-content:center; gap:4px;">
          <span>$</span>
          <input id="updateDailyRate" type="number" value="${vehicle.dailyRate}" min="0" style="width:80px;">
        </div>
      </td>

      <!-- ✅ Mileage with unit -->
      <td>
        <div style="display:flex; align-items:center; justify-content:center; gap:4px;">
          <input id="updateMileage" type="number" value="${vehicle.mileage}" min="0" style="width:90px;">
          <span>km</span>
        </div>
      </td>

      <td><input id="updateLocation" type="text" value="${vehicle.location}" required></td>

      <!-- ✅ Availability Checkbox -->
      <td style="text-align:center;">
        <label style="display:flex; align-items:center; justify-content:center; gap:5px;">
          <input id="updateAvailability" type="checkbox" ${vehicle.availability ? 'checked' : ''}>
          <span>Set Availability</span>
        </label>
      </td>

      <!-- ✅ Actions Column -->
      <td>
        <div style="display:flex; justify-content:center; gap:8px;">
          <button type="button" class="saveButton" vehicle-id="${vehicle.vehicleId}">Save</button>
          <button type="button" class="cancelButton" vehicle-id="${vehicle.vehicleId}">Cancel</button>
        </div>
      </td>`;
}


  // ================= Rentals =================
  clearRentalForm() {
    document.getElementById('rentalForm')?.reset();
  }

  updateRentalTable(rentals) {
  const tbody = document.querySelector('#rentalTable tbody');
  tbody.innerHTML = '';

  if (!rentals.length) {
    tbody.innerHTML = `<tr><td colspan="7">No rentals found.</td></tr>`;
    return;
  }

  rentals.forEach(rental => {
    const row = document.createElement('tr');
    let actionCell = '';

    if (rental.status === 'Rented' || rental.status === 'Overdue') {
      actionCell = `<button class="returnVehicleButton" data-id="${rental.rentalId}">Return Vehicle</button>`;
    } else if (rental.status === 'Returned') {
      actionCell = `<span class="completedLabel">Rental Transaction Completed</span>`;
    }

    row.innerHTML = `
      <td>${rental.rentalId}</td>
      <td>${rental.customer.fullName}</td>
      <td>${rental.vehicle.make} ${rental.vehicle.model}</td>
      <td>${new Date(rental.rentalDate).toLocaleDateString()}</td>
      <td>${new Date(rental.returnDate).toLocaleDateString()}</td>
      <td>${rental.status}</td>
      <td>${actionCell}</td>
    `;
    tbody.appendChild(row);
  });
}


updateReturnedVehiclesTable(rentals) {
  const tbody = document.querySelector('#returnedVehiclesTable tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const returned = rentals.filter(r => r.status === 'Returned');
  if (returned.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5">No returned vehicles yet.</td></tr>`;
    return;
  }

  returned.forEach(rental => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${rental.rentalId}</td>
      <td>${rental.customer.fullName}</td>
      <td>${rental.vehicle.make} ${rental.vehicle.model}</td>
      <td>${rental.actualReturnDate ? new Date(rental.actualReturnDate).toLocaleDateString() : 'N/A'}</td>
      <td>$${rental.rentalFee || '0.00'}</td>`;
    tbody.appendChild(row);
  });
}

updateAvailableRentalsTable(vehicles) {
  const tbody = document.querySelector('#availableRentalsTable tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  // ✅ Only show vehicles that are explicitly available and not reserved/rented
  const availableVehicles = vehicles.filter(v =>
    v.availability === true && v.status === 'Available'
  );

  if (availableVehicles.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7">No vehicles available for rent</td></tr>`;
    return;
  }

  availableVehicles.forEach(v => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${v.vehicleId}</td>
      <td>${v.make}</td>
      <td>${v.model}</td>
      <td>${v.type}</td>
      <td>${v.location}</td>
      <td>$${parseFloat(v.dailyRate).toFixed(2)}</td>
      <td><button class="rentButton" data-id="${v.vehicleId}">Rent</button></td>
    `;
    tbody.appendChild(row);
  });
}

  clearReturnForm() { document.getElementById('returnForm')?.reset(); }

  // ================= Reservations =================

// Clear reservation form
clearReservationForm() {
  document.getElementById('reserveForm')?.reset();
}

// Show list of available vehicles for reservation
updateAvailableReservationsTable(vehicles) {
  const tbody = document.querySelector('#availableReservationsTable tbody');
  tbody.innerHTML = '';

  const availableVehicles = vehicles.filter(v => v.availability && v.status === 'Available');

  if (availableVehicles.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7">No vehicles available for reservation.</td></tr>`;
    return;
  }

  availableVehicles.forEach(v => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${v.vehicleId}</td>
      <td>${v.make}</td>
      <td>${v.model}</td>
      <td>${v.type}</td>
      <td>${v.location}</td>
      <td>$${parseFloat(v.dailyRate).toFixed(2)}</td>
      <td><button class="reserveButton" data-id="${v.vehicleId}">Reserve</button></td>`;
    tbody.appendChild(row);
  });
}

// Show list of current reservations
updateCurrentReservationsTable(reservations) {
  const tbody = document.querySelector('#reservationTable tbody');
  tbody.innerHTML = '';

  if (reservations.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6">No current reservations.</td></tr>`;
    return;
  }

  reservations.forEach(r => {
    const showCancel = (r.status === 'Reserved' || r.status === 'Active');
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${r.reservationId}</td>
      <td>${r.reservingCustomer.fullName}</td>
      <td>${r.reservedVehicle.make} ${r.reservedVehicle.model}</td>
      <td>${new Date(r.reservationDate).toLocaleDateString()}</td>
      <td>${r.status}</td>
      <td>
        ${showCancel
            ? `<button class="cancelReservationButton" data-id="${r.reservationId}">Cancel</button>`
            : ''
        }
      </td>`;
    tbody.appendChild(row);
  });
}


  // ================= Helpers =================
  formatDateTime(date) {
    if (!(date instanceof Date)) date = new Date(date);
    if (Number.isNaN(date.getTime())) return 'N/A';
    let minute = date.getMinutes();
    let hour = date.getHours();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    minute = minute.toString().padStart(2, '0');
    let meridiem = 'AM';
    if (hour >= 12) meridiem = 'PM';
    if (hour > 12) hour -= 12;
    if (hour === 0) hour = 12;
    return `${day}/${month}/${year} ${hour}:${minute} ${meridiem}`;
  }
}

function capitalise(str) { return str ? str[0].toUpperCase() + str.slice(1) : ''; }

// Change visible view
function changeView(view) {
  const ids = ['welcome', 'customers', 'vehicles', 'search', 'rentals', 'reservations'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  const target = document.getElementById(view);
  if (target) target.style.display = 'flex';
}
