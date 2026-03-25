class ReminderSubject {
  constructor() {
    this.observers = [];
  }

  register(observer) {
    this.observers.push(observer);
  }

  unregister(observer) {
    this.observers = this.observers.filter(obs => obs !== observer);
  }

  notify(activity) {
    this.observers.forEach(observer => observer.update(activity));
  }
}

module.exports = ReminderSubject;