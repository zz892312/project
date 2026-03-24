#!/usr/bin/env node

/**
 * Baby Activity Monitor CLI
 * Milestone 4 Implementation
 *
 * This CLI demonstrates:
 * - Repository Pattern for data access
 * - Factory Pattern for activity creation
 * - Observer Pattern for reminders
 * - External API integration (USDA FoodData)
 * - Cloud database operations
 */

const readline = require('readline');
const { pool } = require('./config/database');
const ActivityFactory = require('./factory/ActivityFactory');
const ActivityRepository = require('./repositories/ActivityRepository');
const ReminderSubject = require('./observer/ReminderSubject');
const ReminderObserver = require('./observer/ReminderObserver');
const { getFoodNutrition } = require('./services/foodDataService');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const activityRepository = new ActivityRepository(pool);
const reminderSubject = new ReminderSubject();
reminderSubject.register(new ReminderObserver('CLI User'));

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function mainMenu() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║   Baby Activity Monitor - CLI Demo (Milestone 4)           ║');
  console.log('║   Demonstrating Design Patterns + Cloud DB + External API  ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  while (true) {
    console.log('Main Menu:');
    console.log('1. View babies');
    console.log('2. Add baby profile');
    console.log('3. Add feeding activity');
    console.log('4. View feeding activities');
    console.log('5. Generate report');
    console.log('6. Exit');

    const choice = await ask('Choose an option (1-6): ');

    switch (choice) {
      case '1':
        await viewBabies();
        break;
      case '2':
        await addBaby();
        break;
      case '3':
        await addFeedingActivity();
        break;
      case '4':
        await viewFeedingActivities();
        break;
      case '5':
        await generateReport();
        break;
      case '6':
        console.log('Goodbye!');
        rl.close();
        process.exit(0);
      default:
        console.log('Invalid choice. Please try again.');
    }
  }
}

async function viewBabies() {
  try {
    console.log('\n--- Viewing Babies ---');
    // For demo purposes, show all babies (in real app, filter by user)
    const babies = await activityRepository.query('SELECT * FROM babies LIMIT 10');
    if (babies.length === 0) {
      console.log('No babies found. Please add a baby first.');
      return;
    }

    babies.forEach(baby => {
      console.log(`ID: ${baby.id}, Name: ${baby.name}, DOB: ${baby.date_of_birth}`);
    });
  } catch (error) {
    console.error('Error viewing babies:', error.message);
  }
}

async function addBaby() {
  try {
    console.log('\n--- Add Baby Profile ---');

    // First, show available users
    const users = await activityRepository.query('SELECT id, first_name, last_name, email FROM users LIMIT 10');
    
    if (users.length === 0) {
      console.log('No users found in the system. Please create a user first.');
      console.log('For demo purposes, you can use user_id = 1');
      return;
    }

    console.log('\nAvailable Users:');
    users.forEach(user => {
      console.log(`  ID: ${user.id}, Name: ${user.first_name} ${user.last_name}, Email: ${user.email}`);
    });

    const userId = await ask('\nEnter user ID from the list above: ');
    
    // Verify the user exists
    const userExists = users.find(u => u.id === parseInt(userId));
    if (!userExists) {
      console.log('User ID not found.');
      return;
    }

    const name = await ask('Baby name: ');
    const dateOfBirth = await ask('Date of birth (YYYY-MM-DD): ');
    const gender = await ask('Gender (male/female/other): ') || 'other';
    const weightAtBirth = await ask('Weight at birth in kg (optional): ') || null;
    const bloodType = await ask('Blood type (optional): ') || null;
    const allergies = await ask('Allergies (optional): ') || null;
    const medicalNotes = await ask('Medical notes (optional): ') || null;

    // Repository Pattern: Save baby to database
    const BabyRepository = require('./repositories/BabyRepository');
    const babyRepository = new BabyRepository(pool);
    const babyId = await babyRepository.createBaby(userId, {
      name,
      dateOfBirth,
      gender,
      weightAtBirth: weightAtBirth ? parseFloat(weightAtBirth) : null,
      bloodType,
      allergies,
      medicalNotes
    });

    console.log(`\n✓ Baby profile created successfully!`);
    console.log(`  Baby ID: ${babyId}`);
    console.log(`  Name: ${name}`);
    console.log(`  DOB: ${dateOfBirth}`);

  } catch (error) {
    console.error('Error adding baby:', error.message);
  }
}

async function addFeedingActivity() {
  try {
    console.log('\n--- Add Feeding Activity ---');

    const babyId = await ask('Enter baby ID: ');
    const feedingType = await ask('Feeding type (breast/bottle/solid): ');
    const startTime = await ask('Start time (YYYY-MM-DD HH:mm:ss): ');
    const endTime = await ask('End time (YYYY-MM-DD HH:mm:ss, optional): ') || null;
    const amountMl = await ask('Amount in ml (optional): ') || null;
    const foodType = await ask('Food type (for nutrition lookup, optional): ') || null;
    const notes = await ask('Notes (optional): ') || null;

    // Verify baby exists
    const baby = await activityRepository.getOne('SELECT id FROM babies WHERE id = ?', [babyId]);
    if (!baby) {
      console.log('Baby not found.');
      return;
    }

    // Factory Pattern: Create feeding activity
    const feeding = ActivityFactory.createActivity('feeding', {
      babyId: parseInt(babyId),
      feedingType,
      startTime,
      endTime,
      amountMl: amountMl ? parseInt(amountMl) : null,
      foodType,
      notes
    });

    // Repository Pattern: Save to database
    const insertId = await activityRepository.createFeeding(feeding);
    console.log(`Feeding activity saved with ID: ${insertId}`);

    // External API: Get nutrition data
    if (foodType) {
      try {
        console.log('Fetching nutrition data...');
        const nutrition = await getFoodNutrition(foodType);
        console.log('Nutrition info:', nutrition);
      } catch (err) {
        console.log('Could not fetch nutrition data:', err.message);
      }
    }

    // Observer Pattern: Notify about new feeding
    reminderSubject.notify(feeding);

  } catch (error) {
    console.error('Error adding feeding activity:', error.message);
  }
}

async function viewFeedingActivities() {
  try {
    console.log('\n--- View Feeding Activities ---');

    const babyId = await ask('Enter baby ID: ');
    const feedings = await activityRepository.getFeedingsByBabyId(babyId);

    if (feedings.length === 0) {
      console.log('No feeding activities found for this baby.');
      return;
    }

    feedings.forEach(feeding => {
      console.log(`ID: ${feeding.id}, Type: ${feeding.feeding_type}, Start: ${feeding.start_time}, Amount: ${feeding.amount_ml || 'N/A'} ml`);
    });

  } catch (error) {
    console.error('Error viewing feeding activities:', error.message);
  }
}

async function generateReport() {
  try {
    console.log('\n--- Generate Report ---');

    const babyId = await ask('Enter baby ID: ');
    const startDate = await ask('Start date (YYYY-MM-DD): ');
    const endDate = await ask('End date (YYYY-MM-DD): ');

    // Get feeding activities in date range
    const feedings = await activityRepository.query(
      'SELECT * FROM feeding_activities WHERE baby_id = ? AND DATE(start_time) BETWEEN ? AND ? ORDER BY start_time',
      [babyId, startDate, endDate]
    );

    console.log(`\nFeeding Report for Baby ID ${babyId} (${startDate} to ${endDate})`);
    console.log('=' .repeat(60));

    if (feedings.length === 0) {
      console.log('No feeding activities found in this date range.');
      return;
    }

    let totalAmount = 0;
    feedings.forEach(feeding => {
      console.log(`${feeding.start_time} - ${feeding.feeding_type} - ${feeding.amount_ml || 0} ml - ${feeding.food_type || 'N/A'}`);
      totalAmount += feeding.amount_ml || 0;
    });

    console.log('=' .repeat(60));
    console.log(`Total feedings: ${feedings.length}`);
    console.log(`Total amount: ${totalAmount} ml`);
    console.log(`Average per feeding: ${feedings.length > 0 ? (totalAmount / feedings.length).toFixed(1) : 0} ml`);

  } catch (error) {
    console.error('Error generating report:', error.message);
  }
}

// Start the CLI
mainMenu().catch(error => {
  console.error('CLI Error:', error);
  rl.close();
  process.exit(1);
});