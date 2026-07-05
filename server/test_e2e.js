const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const API_URL = 'http://localhost:5000/api';

async function runTest() {
  console.log('🚀 Starting End-to-End Integration Test...');

  try {
    // 1. Create a mock PDF file for uploads
    fs.writeFileSync('test-doc.pdf', 'Mock PDF content');

    // ==========================================
    // SCENARIO 1: CUSTOMER
    // ==========================================
    console.log('\n--- Test Scenario 1: Customer ---');
    const customerEmail = `customer_${Date.now()}@test.com`;
    console.log(`👤 Registering customer: ${customerEmail}`);
    const resCustomerReg = await axios.post(`${API_URL}/users/signup`, {
      name: 'Test Customer',
      email: customerEmail,
      password: 'password123',
      phoneNumber: '1234567890',
      district: 'Kamrup',
      meterNumber: `MTR-CUST-${Date.now()}`
    });
    const customerToken = resCustomerReg.data.token;
    console.log('✅ Customer registered & logged in.');

    console.log('📝 Submitting Connection Request...');
    const form = new FormData();
    form.append('fullName', 'Test Customer');
    form.append('userType', 'Domestic');
    form.append('address', '123 Test Street');
    form.append('pincode', '781001');
    form.append('load', '2');
    form.append('meterType', 'Single Phase');
    form.append('contact', '1234567890');
    form.append('meterNumber', 'MTR-TEST-12345');
    form.append('email', customerEmail);
    form.append('aadhaar', fs.createReadStream('test-doc.pdf'));
    form.append('proof', fs.createReadStream('test-doc.pdf'));

    const resSubmit = await axios.post(`${API_URL}/connections`, form, {
      headers: { 
        ...form.getHeaders(),
        Authorization: `Bearer ${customerToken}`
      }
    });
    console.log('✅ Request submitted:', resSubmit.data.message);

    const resMyReq = await axios.get(`${API_URL}/connections/my-request`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    console.log('✅ My Request status:', resMyReq.data.status); // Expect Pending

    // ==========================================
    // SETUP: Create Admin & Engineer via DB directly
    // ==========================================
    console.log('\n--- Setup: Registering Admin and Engineer ---');
    const adminEmail = `admin_${Date.now()}@test.com`;
    const resAdminReg = await axios.post(`${API_URL}/users/signup`, {
      name: 'Test Admin', email: adminEmail, password: 'password123', phoneNumber: '000', district: 'Kamrup', meterNumber: `MTR-ADM-${Date.now()}`
    });
    const engineerEmail = `engineer_${Date.now()}@test.com`;
    const resEngReg = await axios.post(`${API_URL}/users/signup`, {
      name: 'Test Engineer', email: engineerEmail, password: 'password123', phoneNumber: '000', district: 'Kamrup', meterNumber: `MTR-ENG-${Date.now()}`
    });

    // Update their roles in DB directly for the test
    const mongoose = require('mongoose');
    await mongoose.connect('mongodb://localhost:27017/electricityDB');
    await mongoose.connection.collection('users').updateOne({ email: adminEmail }, { $set: { role: 'admin' } });
    await mongoose.connection.collection('users').updateOne({ email: engineerEmail }, { $set: { role: 'engineer' } });
    const engineerDoc = await mongoose.connection.collection('users').findOne({ email: engineerEmail });
    const engineerId = engineerDoc._id.toString();
    console.log('✅ Admin & Engineer registered and roles updated.');

    // Login Admin & Engineer
    const resAdminLog = await axios.post(`${API_URL}/users/login`, { email: adminEmail, password: 'password123' });
    const adminToken = resAdminLog.data.token;
    const resEngLog = await axios.post(`${API_URL}/users/login`, { email: engineerEmail, password: 'password123' });
    const engineerToken = resEngLog.data.token;

    // ==========================================
    // SCENARIO 2: ADMIN
    // ==========================================
    console.log('\n--- Test Scenario 2: Admin ---');
    const resApps = await axios.get(`${API_URL}/admin/applications`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const pendingApp = resApps.data.find(a => a.email === customerEmail);
    console.log(`✅ Found new request! ID: ${pendingApp._id}`);

    console.log('✅ Approving request...');
    await axios.put(`${API_URL}/admin/applications/${pendingApp._id}/status`, { status: 'Approved' }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log('✅ Fetching Engineers...');
    const resEngList = await axios.get(`${API_URL}/admin/engineers`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`Found ${resEngList.data.length} engineers.`);

    console.log('✅ Assigning Engineer...');
    const resAssign = await axios.put(`${API_URL}/admin/applications/${pendingApp._id}/assign`, { engineerId }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`Assigned! Status is now: ${resAssign.data.updated.status}`); // Expect Engineer Assigned

    // ==========================================
    // SCENARIO 3: ENGINEER
    // ==========================================
    console.log('\n--- Test Scenario 3: Engineer ---');
    const resJobs = await axios.get(`${API_URL}/engineer/jobs`, {
      headers: { Authorization: `Bearer ${engineerToken}` }
    });
    console.log(`✅ Found ${resJobs.data.length} assigned jobs.`);
    const myJob = resJobs.data[0];

    console.log('✅ Accepting job (Visit Scheduled)...');
    await axios.put(`${API_URL}/engineer/jobs/${myJob._id}/status`, { status: 'Visit Scheduled' }, {
      headers: { Authorization: `Bearer ${engineerToken}` }
    });

    console.log('✅ Completing job (Meter Installed)...');
    const resComplete = await axios.put(`${API_URL}/engineer/jobs/${myJob._id}/status`, {
      status: 'Meter Installed',
      meterSerialNumber: 'METER-999-XYZ',
      installationDate: new Date().toISOString(),
      installationRemarks: 'Installed perfectly.'
    }, {
      headers: { Authorization: `Bearer ${engineerToken}` }
    });
    console.log(`✅ Job completed! Final status: ${resComplete.data.job.status}`);

    // ==========================================
    // SCENARIO 4: DATABASE VERIFICATION
    // ==========================================
    console.log('\n--- Test Scenario 4: Database Verification ---');
    const { ObjectId } = mongoose.Types;
    const finalDoc = await mongoose.connection.collection('connectionrequests').findOne({ _id: new ObjectId(pendingApp._id) });
    console.log('Final Document State:', {
      status: finalDoc.status,
      assignedEngineer: finalDoc.assignedEngineer?.toString(),
      meterSerialNumber: finalDoc.meterSerialNumber,
      installationRemarks: finalDoc.installationRemarks,
      assignedBy: finalDoc.assignedBy?.toString(),
      assignmentDate: !!finalDoc.assignmentDate,
      installationDate: !!finalDoc.installationDate,
    });
    
    if (finalDoc.status === 'Meter Installed' && finalDoc.meterSerialNumber === 'METER-999-XYZ') {
        console.log('\n🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY! 🎉');
    } else {
        console.log('\n❌ INTEGRATION TEST FAILED!');
    }

    mongoose.connection.close();
    fs.unlinkSync('test-doc.pdf'); // cleanup

  } catch (err) {
    console.error('\n❌ TEST FAILED with error:', err.response?.data || err.message);
  }
}

runTest();
