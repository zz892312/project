class ReminderObserver {
  constructor(name) {
    this.name = name;
  }

  update(activity) {
    // Simple notification output. In the full app this could send an email, push alert, etc.
    console.log(`Reminder => ${this.name}: New feeding record for baby ${activity.babyId} of type ${activity.feedingType}`);
    if (activity.amountMl && activity.amountMl > 120) {
      console.log(`Reminder => ${this.name}: High feeding amount detected (${activity.amountMl} ml). Review baby health or consult caregiver.`);
    }
  }
}

module.exports = ReminderObserver;