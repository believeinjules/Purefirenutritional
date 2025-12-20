#!/usr/bin/env node
// Test email sending functionality
// Run with: node test-email.mjs

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;
const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
const emailPort = parseInt(process.env.EMAIL_PORT || '587');

console.log('🧪 Email Configuration Test\n');
console.log('Configuration:');
console.log(`  Host: ${emailHost}`);
console.log(`  Port: ${emailPort}`);
console.log(`  User: ${emailUser}`);
console.log(`  Password: ${'*'.repeat(emailPass?.length || 0)}`);

if (!emailUser || !emailPass) {
  console.error('\n❌ Email credentials not configured!');
  console.error('Please add EMAIL_USER and EMAIL_PASS to .env.local');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: emailHost,
  port: emailPort,
  secure: emailPort === 465,
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

async function testEmail() {
  try {
    console.log('\n📧 Testing email connection...');
    
    // Verify connection
    await transporter.verify();
    console.log('✅ Connected to Gmail successfully!');

    // Send test email
    console.log('\n📬 Sending test email...');
    const info = await transporter.sendMail({
      from: `"Pure Fire Nutritional" <${emailUser}>`,
      to: emailUser, // Send to self for testing
      subject: 'Pure Fire Nutritional - Test Email',
      text: 'This is a test email to verify the Gmail configuration works correctly.',
      html: `
        <h2>Pure Fire Nutritional - Test Email</h2>
        <p>This is a test email to verify the Gmail configuration works correctly.</p>
        <p>If you received this email, your setup is working! ✅</p>
      `,
    });

    console.log('✅ Email sent successfully!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`\n📨 Check your inbox at ${emailUser} for the test email`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('Invalid credentials')) {
      console.error('\n⚠️  Gmail credentials appear to be incorrect.');
      console.error('Make sure:');
      console.error('  1. You generated an App Password (not your main Gmail password)');
      console.error('  2. 2FA is enabled on your Gmail account');
      console.error('  3. The app password is exactly: hbhk moyx pcpy yqio');
    }
    
    process.exit(1);
  }
}

testEmail();
