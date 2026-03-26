class FeedingActivity {
  constructor(data) {
    this.babyId = data.babyId;
    this.feedingType = data.feedingType;
    this.startTime = data.startTime;
    this.endTime = data.endTime || null;
    this.amountMl = data.amountMl || null;
    this.foodType = data.foodType || null;
    this.side = data.side || null;
    this.notes = data.notes || null;
  }
}

// Extend this base pattern for other activity types (sleep, diaper, health)

class ActivityFactory {
  static createActivity(activityType, data) {
    switch (activityType) {
      case 'feeding':
        return new FeedingActivity(data);
      default:
        throw new Error(`Unsupported activity type: ${activityType}`);
    }
  }
}

module.exports = ActivityFactory;
