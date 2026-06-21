require('dotenv').config();
const mongoose = require('mongoose');
const Device = require('./src/models/Device');

const run = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    
    const result = await Device.updateMany(
        { orgId: { $exists: false } },
        { $set: { orgId: 'dell-hackathon-2026' } }
    );
    
    console.log(`Updated ${result.modifiedCount} devices to org: dell-hackathon-2026`);
    
    // Also fix Dhriti specifically
    const dhriti = await Device.findOneAndUpdate(
        { deviceId: 'Dhriti' },
        { $set: { orgId: 'dell-hackathon-2026' } },
        { new: true }
    );
    
    console.log('Dhriti device:', dhriti ? `orgId = ${dhriti.orgId}` : 'not found');
    
    mongoose.disconnect();
};

run().catch(console.error);
